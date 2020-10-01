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

exports.reduceToList = array => {
    return array.reduce((prev, value, i) => {
        if (i + 1 === array.length) {
            return prev + ` and ${value}`
        } else if (i === 0) {
            return prev + `${value}`
        } else {
            return prev + `, ${value}`
        }
    }, '')
}

exports.truncate = (str, maxLength = 80) => {
    if (str.length < maxLength) return str
    return str.substring(0, maxLength) + '...'
}

exports.addAt = str => {
    if (!str.startsWith('@')) return `@${str}`
    return str
}

const stripAt = str => {
    if (str.startsWith('@')) return str.split('@')[1]
    return str
}

exports.assignFlow = ({zConfigFile, zGithub, assignees, author, owner, repo}) => {
    assignees.push(author)
    for (let assigneeNo = 0; assigneeNo < assignees.length; assigneeNo++) {
        assignees[assigneeNo] = assignees[assigneeNo].replace('@', '')
        // zGithub.repos.checkCollaborator({
        //     owner,
        //     repo,
        //     username: username,
        // })
    }
    return {assignees: assignees.map(n => stripAt(n))}
    // if (autoAssign === true) {
    //   return { assignee: author }
    // } else if (typeof autoAssign === 'string') {
    //   return { assignee: autoAssign }
    // } else if (Array.isArray(autoAssign)) {
    //   return { assignees: autoAssign.map(n => stripAt(n)) }
    // }
}

exports.endDiff = diff => diff + '\n__END_OF_DIFF_PARSING__'

exports.lineBreak = body => {
    const regEx = /\/?&lt;br(?:\s\/)?&gt;/g // Regular expression to match all occurences of '&lt;br&gt'
    return body.replace(regEx, '<br>')
}
