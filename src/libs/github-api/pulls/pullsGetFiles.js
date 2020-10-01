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

const pullsGetFiles = async ({zParser}) => {
    const {
        zContextParsed,
    } = zParser
    const {
        zRepository,
        zGithub,
        zNumber,
        zRepoOwner,
        zRepoName,
    } = zContextParsed

    const pullsFilesPayload = await zGithub.pulls.listFiles({
        owner: zRepoOwner,
        repo: zRepoName,
        pull_number: zNumber,
        per_page: 100,
    })
    const pullsFiles = pullsFilesPayload.data
    return {
        pullsFiles,
    }
}

module.exports = {
    pullsGetFiles,
}
