/**
 * Copyright 2021 ZeoFlow SRL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const LabelsUpdater = require('../labels-updater')
const fs = require('fs')
const Repository = require('../../libs/github-api/repository')
const CommentReply = require('../../libs/utils/comment-reply')
const {reposGetDetails} = require('../../libs/github-api/repos/reposGetDetails')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class InstallationManager {

    static async initializer({zContext}) {
        console.log('InstallationManager')
        const zParser = await initialiseContext({zContext})
        const zInstallationManager = new InstallationManager({zParser})
        await zInstallationManager.run()
    }

    static events() {
        return [
            'installation.created',
            'installation_repositories',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    async run() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zPayload,
            zEvent,
            zRepositories,
            zRepositoriesAdded,
        } = zContextParsed

        let repoList = []
        if (zEvent === 'installation' && zPayload.action === 'created') {
            repoList = zRepositories.repositoriesData
        } else if (zEvent === 'installation_repositories') {
            repoList = zRepositoriesAdded.repositoriesAddedData
        }

        for (const item of repoList) {
            const [zRepoOwner, zRepoName] = item.full_name.split('/')
            await LabelsUpdater.installInRepo({zParser, zRepoOwner, zRepoName})
            await this.initializeYml({zRepoOwner, zRepoName})
        }
    }

    async initializeYml({zRepoOwner, zRepoName}) {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zContext,
            zGithub,
            zSender,
        } = zContextParsed

        const zRepoDetailsParsed = await reposGetDetails(zGithub, {
            owner: zRepoOwner,
            repo: zRepoName,
        })
        const {
            repositoryDefaultBranch,
        } = zRepoDetailsParsed

        const repository = new Repository({
            repo: zRepoName,
            owner: zRepoOwner,
            github: zGithub,
            defaultBranch: repositoryDefaultBranch,
            log: zContext.log,
        })

        const mInitializationBranch = 'zeobot-installation'
        await repository.createBranchIfNot(mInitializationBranch)
        const fileSha = await repository.getFileShaSignature(mInitializationBranch, '.zeobot/config.yml')
        let zeobotFileSha = ''
        if (fileSha !== null) {
            zeobotFileSha = fileSha.data.sha
        }

        let zConfigFile = fs.readFileSync('./res' + '/zeobot.yml')
        await repository.updateFileGit({
            filePath: '.zeobot/config.yml',
            content: zConfigFile,
            branchName: mInitializationBranch,
            originalSha: zeobotFileSha,
            message: 'ZeoBot\'s Configuration file was created with the default values',
        })

        let zPRBody = '## ZeoBot\'s Environment Prepared.\n'
        zPRBody += '### The file is stored and will be read from the following location:\n'
        zPRBody += '```yml\nbranch: `' + repositoryDefaultBranch + '`\npath: .zeobot/config.yml\n```\n'
        zPRBody += ' * at the installation the default-branch was: `' + repositoryDefaultBranch + '`\n'
        zPRBody += ' * the config file should be stored in the `default-branch`\n'
        zPRBody += '\n ***@zeobot was added to this repo by @' + zSender.senderLogin + '***'

        const zPRInstallation = await repository.createPullRequest(
            {
                title: 'ZeoBot\'s Environment Prepared',
                body: zPRBody,
                branchName: mInitializationBranch,
            },
        )

        const {
            pullRequestNumber: pull_number,
        } = zPRInstallation

        await zGithub.issues.addLabels({
            owner: zRepoOwner,
            issue_number: pull_number,
            repo: zRepoName,
            labels: ["@config", "@priority-critical", "@maintenance"]
        })

        const commentReply = new CommentReply({zParser})
        commentReply.reply(`## I've just created the configuration file`)
        commentReply.reply(`### The default values are the following:\n \`\`\`yml\n${zConfigFile}\n\`\`\``)
        return commentReply
            .addInstallationResponse()
            .withNumber(pull_number)
            .withOwner(zRepoOwner)
            .withRepo(zRepoName)
            .send()

        // let commit_message = 'ZeoBot\'s Configuration Created'
        // await reposMergeBranch(zGithub, {
        //     repo,
        //     owner,
        //     pull_number,
        //     commit_message,
        // })

    }

}

module.exports = InstallationManager
