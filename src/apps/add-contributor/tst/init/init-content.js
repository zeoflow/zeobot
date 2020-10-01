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

const _ = require('lodash/fp')
const injectContentBetween = require('../util').markdown.injectContentBetween

const listContent = [
    '<!-- ZEOBOT-LIST:START - Do not remove or modify this section -->',
    '<!-- prettier-ignore-start -->',
    '<!-- markdownlint-disable -->',
    '<!-- markdownlint-enable -->',
    '<!-- prettier-ignore-end -->',
    '<!-- ZEOBOT-LIST:END -->',
].join('\n')

function splitAndRejoin(fn) {
    return _.flow(
        _.split('\n'),
        fn,
        _.join('\n'),
    )
}

const findContributorsSection = _.findIndex(function isContributorsSection(
    str,
) {
    return str.toLowerCase().indexOf('## 🏆 contributors 🏆') === -1
})

function addContributorsList(lines) {
    const insertionLine = lines.join('').toLowerCase().indexOf('## 🏆 contributors 🏆')//findContributorsSection(lines)
    if (insertionLine === -1) {
        return lines.concat([
            '## 🏆 Contributors 🏆',
            '',
            listContent,
        ])
    }
    return injectContentBetween(
        lines,
        listContent,
        insertionLine + 3,
        insertionLine + 3,
    )
}

module.exports = {
    addContributorsList: splitAndRejoin(addContributorsList),
}
