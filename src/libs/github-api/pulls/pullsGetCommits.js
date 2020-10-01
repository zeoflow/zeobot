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

const pullsGetCommits = async ({zParser, zNumber}) => {
    const {
        zContextParsed,
    } = zParser
    const {
        zRepository,
        zGithub,
    } = zContextParsed

    const owner = zRepository.repositoryOwnerUsername
    const repo = zRepository.repositoryName
    const pullsCommitsPayload = await zGithub.pulls.listCommits({
        owner,
        repo,
        pull_number: zNumber,
        per_page: 100,
    })
    const pullsCommits = []
    pullsCommitsPayload.data.forEach(pullsCommit => {
        const pullsCommitData = {
            authorLogin: pullsCommit.author.login,
            authorType: pullsCommit.author.type,
            commitAuthorLogin: pullsCommit.commit.author.name,
            commitAuthorType: pullsCommit.commit.author.date,
        }
        pullsCommits.push(pullsCommitData)
    })
    return {
        pullsCommits,
    }
}

module.exports = {
    pullsGetCommits,
}
