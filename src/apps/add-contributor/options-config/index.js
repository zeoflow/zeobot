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

const {addContributorWithDetails} = require('../add-with-details')
const {reposGetFile} = require('../../../libs/github-api/repos/reposGetFile')
const zContributorsPath = '.zeobot/contributors.src'

class OptionsConfig {

    static generateConfig({zParser}) {
        return new OptionsConfig({zParser})
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    getContributorsPath() {
        return zContributorsPath
    }

    async addContributor({login, contributions, name, avatar_url, profile}) {

        const options = this.options
        function findOldContributions(username) {
            const contributors = options.contributors
            for (let i = 0; i < contributors.length; i++) {
                if (contributors[i].login === username) {
                    return contributors[i].contributions
                }
            }

            return []
        }

        const profileWithProtocol = profile.startsWith('http')
            ? profile
            : `http://${profile}`

        const oldContributions = findOldContributions(login)
        const newContributions = [
            ...new Set([...oldContributions, ...contributions]),
        ]

        const newContributorsList = await addContributorWithDetails({
            options,
            login,
            contributions: newContributions,
            name,
            avatar_url,
            profile: profileWithProtocol,
        })

        const newOptions = {
            ...options,
            contributors: newContributorsList,
        }
        this.options = newOptions
        return newOptions
    }

    async fetch() {
        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {zRepoOwner, zRepoName, zRepository} = zContextParsed
        const {
            content: rawOptionsFileContent,
            sha,
        } = await reposGetFile(zParser, {zFilePath: zContributorsPath, zBranch: zRepository.repositoryDefaultBranch})
        let options = {
            projectName: zRepoName,
            projectOwner: zRepoOwner,
            repoType: 'github',
            repoHost: 'https://github.com',
            contributors: [],
            files: ['README.md', 'docs/contributors.md'],
            contributorsPerLine: 7,
        }

        try {
            if (rawOptionsFileContent !== undefined) {
                options = JSON.parse(rawOptionsFileContent)
            }

            options.projectName = zRepoName
            options.projectOwner = zRepoOwner
            options.repoType = 'github'
            options.repoHost = 'https://github.com'
            if (!options.contributors) {
                options.contributors = []
            }
            if (!Array.isArray(options.contributors)) {
                options.contributors = []
            }
            if (!Array.isArray(options.files)) {
                options.files = ['README.md', 'docs/contributors.md']
            }
            if (!options.files.includes('README.md')) {
                options.files.push('README.md')
            }
            if (!options.files.includes('docs/contributors.md')) {
                options.files.push('docs/contributors.md')
            }

            this.options = options
            this.sha = sha
            return {
                sha,
                options,
            }
        } catch (error) {
            throw error
        }
    }

    get() {
        const options = this.options
        if (!Array.isArray(options.files)) {
            options.files = ['README.md', 'docs/contributors.md']
        }
        if (!Number.isInteger(options.contributorsPerLine)) {
            options.contributorsPerLine = 7
        }
        return options
    }

    getRaw() {
        return `${JSON.stringify(this.options, null, 2)}\n`
    }
}

module.exports = OptionsConfig
