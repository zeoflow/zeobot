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

const {
    AllContributorBotError,
    BranchNotFoundError,
    ResourceNotFoundError,
} = require('../../utils/errors')

class Repository {
    constructor({repo, owner, github, defaultBranch, log}) {
        this.github = github
        this.repo = repo
        this.owner = owner
        this.defaultBranch = defaultBranch
        this.baseBranch = defaultBranch
        this.log = log
        this.skipCiString = '[skip ci]'
    }

    getFullname() {
        return `${this.owner}/${this.repo}`
    }

    setBaseBranch(branchName) {
        this.baseBranch = branchName
    }

    async getFile(filePath) {
        try {
            const file = await this.github.repos.getContents({
                owner: this.owner,
                repo: this.repo,
                path: filePath,
                ref: this.baseBranch,
            })
            const contentBinary = file.data.content
            const content = Buffer.from(contentBinary, 'base64').toString()
            return {
                content,
                sha: file.data.sha,
            }
        } catch (error) {
            if (error.status === 404) {
                throw new ResourceNotFoundError(filePath, this.getFullname())
            } else {
                throw error
            }
        }
    }

    async getMultipleFiles(filePathsArray) {
        // TODO: can probably optimise this instead of sending a request per file
        const repository = this

        const getFilesMultiple = filePathsArray.map(filePath => {
            return repository.getFile(filePath).then(({content, sha}) => ({
                filePath,
                content,
                sha,
            }))
        })

        const getFilesMultipleList = await Promise.all(getFilesMultiple)
        const multipleFilesByPath = {}
        getFilesMultipleList.forEach(({filePath, content, sha}) => {
            multipleFilesByPath[filePath] = {
                content,
                sha,
            }
        })

        return multipleFilesByPath
    }

    async getRef(branchName) {
        try {
            const result = await this.github.git.getRef({
                owner: this.owner,
                repo: this.repo,
                ref: `heads/${branchName}`,
            })
            return result.data.object.sha
        } catch (error) {
            if (error.status === 404) {
                throw new BranchNotFoundError(branchName)
            }
        }
    }

    async createBranch(branchName) {
        const fromSha = await this.getRef(this.defaultBranch)

        await this.github.git.createRef({
            owner: this.owner,
            repo: this.repo,
            ref: `refs/heads/${branchName}`,
            sha: fromSha,
        })
    }

    async getBranch(branchName) {
        try {
            const result = await this.github.repos.getBranch({
                owner: this.owner,
                repo: this.repo,
                branch: branchName,
            })
            return result.data.commit.sha
        } catch (error) {
            return null
        }
    }

    async getBranchSha(branchName) {
        try {
            const result = await this.github.git.getRef({
                owner: this.owner,
                repo: this.repo,
                ref: `heads/${branchName}`,
            })
            return result.data.object.sha
        } catch (error) {
            return null
        }
    }

    async createBranchIfNot(branchName) {
        const branchExist = await this.getBranch(branchName) !== null
        if (!branchExist) {
            const fromSha = await this.getBranchSha(this.defaultBranch)
            await this.github.git.createRef({
                owner: this.owner,
                repo: this.repo,
                ref: `refs/heads/${branchName}`,
                sha: fromSha,
            })
        }
    }

    async getFileShaSignature(branchName, path) {
        try {
            return await this.github.repos.getContents({
                owner: this.owner,
                repo: this.repo,
                path: path,
                ref: branchName,
            })
        } catch (error) {
            return null
        }
    }

    async deleteFileGit(filePath, branchName, originalSha, message) {
        await this.github.repos.deleteFile({
            message: message,
            owner: this.owner,
            path: filePath,
            repo: this.repo,
            sha: originalSha,
            branch: branchName,
        })
    }

    async updateFileGit({filePath, content, branchName, originalSha, message}) {
        const contentBinary = Buffer.from(content).toString('base64')
        await this.github.repos.createOrUpdateFile({
            owner: this.owner,
            repo: this.repo,
            branch: branchName,
            path: filePath,
            message: message,
            content: contentBinary,
            sha: originalSha,
        })
    }

    async updateFile({filePath, content, branchName, originalSha}) {
        const contentBinary = Buffer.from(content).toString('base64')
        //octokit.github.io/rest.js/#api-Repos-updateFile
        await this.github.repos.createOrUpdateFile({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            message: `docs: update ${filePath} ${this.skipCiString}`,
            content: contentBinary,
            sha: originalSha,
            branch: branchName,
        })
    }

    async createFile({filePath, content, branchName}) {
        const contentBinary = Buffer.from(content).toString('base64')

        //octokit.github.io/rest.js/#api-Repos-createFile
        await this.github.repos.createOrUpdateFile({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            message: `docs: create ${filePath} ${this.skipCiString}`,
            content: contentBinary,
            branch: branchName,
        })
    }

    async createOrUpdateFile({filePath, content, branchName, originalSha}) {
        if (originalSha === undefined) {
            await this.createFile({filePath, content, branchName})
        } else {
            await this.updateFile({
                filePath,
                content,
                branchName,
                originalSha,
            })
        }
    }

    async createOrUpdateFiles({filesByPath, branchName}) {
        const repository = this
        const createOrUpdateFilesMultiple = Object.entries(filesByPath).map(
            ([filePath, {content, originalSha}]) => {
                return repository.createOrUpdateFile({
                    filePath,
                    content,
                    branchName,
                    originalSha,
                })
            },
        )

        await Promise.all(createOrUpdateFilesMultiple)
    }

    async getPullRequestData({branchName}) {
        const results = await this.github.pulls.list({
            owner: this.owner,
            repo: this.repo,
            state: 'open',
            head: `${this.owner}:${branchName}`,
        })
        return {
            pullRequestURL: results.data[0].html_url,
            pullRequestNumber: results.data[0].number,
        }
    }

    async createPullRequest({title, body, branchName}) {
        try {
            const result = await this.github.pulls.create({
                owner: this.owner,
                repo: this.repo,
                title,
                body,
                head: branchName,
                base: this.defaultBranch,
                maintainer_can_modify: true,
            })
            return {
                pullRequestURL: result.data.html_url,
                pullRequestNumber: result.data.number,
                pullCreated: true,
            }
        } catch (error) {
            if (error.status === 422) {
                const pullRequestData = await this.getPullRequestData({
                    branchName,
                })
                const {
                    pullRequestURL,
                    pullRequestNumber,
                } = pullRequestData
                return {
                    pullRequestURL,
                    pullRequestNumber,
                    pullCreated: false,
                }
            }
        }
    }

    async createPullRequestFromFiles({title, body, filesByPath, branchName}) {
        const branchNameExists = branchName === this.baseBranch
        if (!branchNameExists) {
            await this.createBranch(branchName)
        }

        await this.createOrUpdateFiles({
            filesByPath,
            branchName,
        })

        return await this.createPullRequest({
            title,
            body,
            branchName,
        })
    }
}

module.exports = Repository
