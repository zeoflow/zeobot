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

const reposGetFile = async (zParser, {
    zFilePath,
    zBranch
}) => {

    const {zContextParsed} = zParser
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
    } = zContextParsed

    try {
        const file = await zGithub.repos.getContents({
            owner: zRepoOwner,
            repo: zRepoName,
            path: zFilePath,
            ref: zBranch,
        })
        const contentBinary = file.data.content
        const content = Buffer.from(contentBinary, 'base64').toString()
        return {
            content,
            sha: file.data.sha,
            error: false,
        }
    } catch (error) {
        return {
            error: true,
        }
    }
}

module.exports = {
    reposGetFile,
}
