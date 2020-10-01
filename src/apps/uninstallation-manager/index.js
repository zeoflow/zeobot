/**
 * Copyright 2020 ZeoFlow SRL
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

const {issueCreate} = require('../../libs/github-api/issue/issueCreate')
const {reposGetDetails} = require('../../libs/github-api/repos/reposGetDetails')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class UninstallationManager {

    static async initializer({zContext}) {
        console.log('InstallationManager')
        const zParser = await initialiseContext({zContext})
        const zUninstallationManager = new UninstallationManager({zParser})
        await zUninstallationManager.run()
    }

    static events() {
        return [
            'installation.deleted',
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
            zRepositoriesRemoved,
        } = zContextParsed

        let repoList = []
        if (zEvent === 'installation' && zPayload.action === 'deleted') {
            repoList = zRepositories.repositoriesData
        } else if (zEvent === 'installation_repositories') {
            repoList = zRepositoriesRemoved.repositoriesRemovedData
        }

        for (const item of repoList) {
            const [zRepoOwner, zRepoName] = item.full_name.split('/')
            await this.removeZeoBot({
                zRepoOwner, zRepoName,
            })
        }
    }

    async removeZeoBot({zRepoOwner, zRepoName}) {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zGithub,
            zSender,
        } = zContextParsed


        const zRepoDetailsParsed = await reposGetDetails(zGithub, {
            owner: zRepoOwner,
            repo: zRepoName,
        })
        const {repositoryDefaultBranch} = zRepoDetailsParsed

        let zRemoveTitle = 'ZeoBot Uninstallation'
        let zRemoveBody = ''

        zRemoveBody += '## ZeoBot was uninstalled from this repository\n'
        zRemoveBody += '### TODO:\n'
        zRemoveBody += 'Remove the config file for the zeobot. It is located as shown below:\n'
        zRemoveBody += '```yml\nbranch: `' + repositoryDefaultBranch + '`\npath: .zeobot/config.yml\n```\n'
        zRemoveBody += ' * at the uninstallation, the default-branch was: `' + repositoryDefaultBranch + '`\n'
        zRemoveBody += ' * the config file should be removed from the `default-branch`\n'
        zRemoveBody += '\n###### ***@zeobot was uninstalled from this repo by @' + zSender.senderLogin + '***'

        await issueCreate(zGithub, {
            owner: zRepoOwner,
            repo: zRepoName,
            title: zRemoveTitle,
            body: zRemoveBody,
        })
    }

}

module.exports = UninstallationManager
