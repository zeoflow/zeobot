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

const pullsList = async ({zParser}) => {
    const {
        zContextParsed,
    } = zParser
    const {
        zGithub,

        zRepoOwner,
        zRepoName,
    } = zContextParsed

    // set the owner and repo
    const owner = zRepoOwner
    const repo = zRepoName

    // get all the pulls for the repo
    const pullsListData = await zGithub.pulls.list({
        owner,
        repo,
        per_page: 100,
        state: 'all',
    })

    // sort the pulls that were merged after the last release was craeted
    const pullsList = []
    pullsListData.data.forEach(pullObject => {
        const {
            number,
            state,
            locked,
            title,
            user: {
                login,
                type,
            },
            body,
            labels,
            created_at,
            updated_at,
            closed_at,
            merged_at,
            merge_commit_sha,
        } = pullObject
        const pullData = {
            number,
            state,
            locked,
            title,
            user: {
                login,
                type,
            },
            body,
            labels,
            created_at,
            updated_at,
            closed_at,
            merged_at,
            merge_commit_sha,
            base_branch: pullObject.base.ref,
            base_sha: pullObject.base.sha,
        }
        pullsList.push(pullData)
    })
    return {
        pullsList,
    }
}

module.exports = {
    pullsList,
}
