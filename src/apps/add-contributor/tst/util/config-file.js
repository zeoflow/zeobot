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

const fs = require('fs')
const pify = require('pify')
const _ = require('lodash/fp')
const jf = require('json-fixer')

function readConfig(configPath) {
    try {
        const {data: config, changed} = jf(fs.readFileSync(configPath, 'utf-8'))
        if (!('repoType' in config)) {
            config.repoType = 'github'
        }
        if (!('commitConvention' in config)) {
            config.commitConvention = 'none'
        }
        if (changed) {
            //Updates the file with fixes
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
        }
        return config
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new SyntaxError(
                `Configuration file has malformed JSON: ${configPath}. Error:: ${
                    error.message
                }`,
            )
        }
        if (error.code === 'ENOENT') {
            throw new Error(`Configuration file not found: ${configPath}`)
        }
        throw error
    }
}

function writeConfig(configPath, content) {
    if (!content.projectOwner) {
        throw new Error(`Error! Project owner is not set in ${configPath}`)
    }
    if (!content.projectName) {
        throw new Error(`Error! Project name is not set in ${configPath}`)
    }

    if (content.files && !content.files.length) {
        throw new Error(
            `Error! Project files was overridden and is empty in ${configPath}`,
        )
    }
    return pify(fs.writeFile)(configPath, `${JSON.stringify(content, null, 2)}\n`)
}

function writeContributors(configPath, contributors) {
    let config
    try {
        config = readConfig(configPath)
    } catch (error) {
        return Promise.reject(error)
    }
    const content = _.assign(config, {contributors})
    return writeConfig(configPath, content)
}

module.exports = {
    readConfig,
    writeConfig,
    writeContributors,
}
