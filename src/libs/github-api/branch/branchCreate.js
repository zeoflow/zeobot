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

const {gitGetRef} = require('../git/gitGetRef')
const branchCreate = async (zParser, {branchName}) => {

    const {
        zContextParsed,
    } = zParser
    const {
        zGithub,
        zRepository,
        zRepoOwner,
        zRepoName,
    } = zContextParsed
    const {sha: branchSha} = await gitGetRef(zParser, {branchName})
    if (!branchSha) {
        const {sha: fromSha} = await gitGetRef(zParser, {branchName: zRepository.repositoryDefaultBranch})
        const newRef = await zGithub.git.createRef({
            owner: zRepoOwner,
            repo: zRepoName,
            ref: `refs/heads/${branchName}`,
            sha: fromSha,
        })
        return newRef.data.object.sha
    } else {
        return branchSha
    }
}

module.exports = {
    branchCreate,
}
