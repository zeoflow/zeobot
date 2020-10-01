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
    zReopenClosedTodoMD,
} = require('../../../../res/templates')

/**
 * Reopen a closed issue and post a comment saying what happened and why
 * @param {object} params
 * @param {import('probot').Context} params.context
 * @param {object} params.config
 * @param {object} params.issue
 * @param {Data} data
 */
module.exports = async ({context, config, issue}, data) => {
    if (issue.state === 'closed' && config.reopenClosed) {
        await context.github.issues.update(context.repo({
            issue_number: issue.number,
            state: 'open',
        }))

        const body = zReopenClosedTodoMD(context.repo(data))
        return context.github.issues.createComment(context.repo({
            issue_number: issue.number,
            body,
        }))
    }
}

/**
 * @typedef Data
 * @property {string} keyword
 * @property {string} sha
 * @property {string} filename
 */
