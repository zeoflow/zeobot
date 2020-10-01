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

function read(filePath) {
    return pify(fs.readFile)(filePath, 'utf8')
}

function write(filePath, content) {
    return pify(fs.writeFile)(filePath, content)
}

function injectContentBetween(lines, content, startIndex, endIndex) {
    return [].concat(lines.slice(0, startIndex), content, lines.slice(endIndex))
}

module.exports = {
    read,
    write,
    injectContentBetween,
}
