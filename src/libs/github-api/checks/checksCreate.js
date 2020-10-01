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

const checksCreate = (zParser, {
    name,
    status,
    conclusion,
    summary,
    text,
    actions,
}) => {

    const {zContextParsed} = zParser
    const {zPullRequest} = zContextParsed

    const timeStart = new Date()

    const {
        head,
    } = zPullRequest

    const {
        zContext,
        zGithub,
    } = zContextParsed

    return zGithub.checks.create(
        zContext.repo({
            head_branch: head.ref,
            head_sha: head.sha,
            name: name,
            status: status,
            conclusion: conclusion,
            started_at: timeStart,
            completed_at: new Date(),
            output: {
                title: 'ZeoBot',
                summary: summary,
                text: text,
            },
            actions: actions,
        }),
    )
}

module.exports = {
    checksCreate,
}