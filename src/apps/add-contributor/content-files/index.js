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

const generateContributorsFile = require('../generate/contributors-file')
const {initContributorsFile} = require('../init/contributors-file')
const {getMultipleFiles} = require('../../../libs/utils/get-multiple-files')
const {generate: generateContentFile} = require('../tst/api')
const {initContributorsList} = require('../tst/api')

/*
 *  Fetches, stores, generates, and updates the readme content files for the contributors list
 */
class ContentFiles {
    constructor({zParser}) {
        this.zParser = zParser
        this.contentFilesByPath = null
    }

    async fetch(options) {
        const zParser = this.zParser

        this.contentFilesByPath = await getMultipleFiles(zParser, {
            filePathsArray: options.files,
        })
    }

    initContributors() {
        let readmeContent = this.contentFilesByPath['README.md']['content']
        readmeContent = initContributorsList(readmeContent)
        this.contentFilesByPath['README.md']['content'] = readmeContent
        let contributorsFileContent = this.contentFilesByPath['docs/contributors.md']['content']
        if(contributorsFileContent.indexOf('<!-- ZEOBOT-LIST:START - Do not remove or modify this section -->') === -1) {
            contributorsFileContent = initContributorsFile(contributorsFileContent)
        }
        this.contentFilesByPath['docs/contributors.md']['content'] = contributorsFileContent
    }

    generate(options) {
        let readmeContent = this.contentFilesByPath['README.md']['content']
        readmeContent = readmeContent ? readmeContent : ''
        readmeContent = generateContentFile(
            options,
            options.contributors,
            readmeContent,
        )
        this.contentFilesByPath['README.md']['content'] = readmeContent
        this.contentFilesByPath['docs/contributors.md'] = {
            content: generateContributorsFile(
                options,
                options.contributors,
                this.contentFilesByPath['docs/contributors.md']['content'],
            ),
            originalSha: undefined,
        }
    }

    get(zOptionsConfig) {
        this.contentFilesByPath[zOptionsConfig.getContributorsPath()] = {
            content: zOptionsConfig.getRaw(),
            originalSha: undefined,
        }
        return this.contentFilesByPath
    }
}

module.exports = ContentFiles
