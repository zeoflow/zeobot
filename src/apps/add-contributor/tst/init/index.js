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

const util = require('../util')
const prompt = require('./prompt')
const initContent = require('./init-content')
const ensureFileExists = require('./file-exist')

const configFile = util.configFile
const markdown = util.markdown

function injectInFile(file, fn) {
    return markdown.read(file).then(content => markdown.write(file, fn(content)))
}

module.exports = function init() {
    return prompt().then(result => {
        return configFile
            .writeConfig('.zeobot-contributors', result.config)
            .then(() => {
                ensureFileExists(result.contributorFile)
            })
            .then(() =>
                injectInFile(result.contributorFile, initContent.addContributorsList),
            )
    })
}
