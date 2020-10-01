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

const {lineBreak} = require('./helpers')

module.exports = (changes, changeIndex) => {
    const assignees = []
    const nextChanges = changes.slice(changeIndex + 1)
    const regexContent = new RegExp('(?<tag>@todo-zeobot\\([aA]\\):)(?<content>.*)')
    const pattern = '(?:^|[^a-zA-Z0-9_!#$%&*@＠]|RT:?)([@＠])([a-zA-Z0-9_]{1,20})(\\/[a-zA-Z][a-zA-Z0-9_\\-]{0,24})?'

    let prevLn = changeIndex
    for (const change of nextChanges) {
        const ln = regexContent.exec(change.ln)
        if (prevLn < ln - 1) {
            break
        }
        const matches = regexContent.exec(change.content)
        if (!matches) break

        const content = matches.groups.content
        const mentions = content.match(pattern)
        for (const mention in mentions) {
            if (mentions.hasOwnProperty(mention)) {
                assignees.push(
                    mention.trim(),
                )
            }
        }
        if (mentions.length > 0) {
            prevLn = ln
        }
    }

    return {
        assignees,
        changeIndex: prevLn,
    }
}
