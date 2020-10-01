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

const CommentReply = require('./comment-reply')
const {pullsBody} = require('../github-api/pulls/pullsUpdate')
const {getFile} = require('./get-file')
const {gitGetRef} = require('../github-api/git/gitGetRef')
const {branchCreate} = require('../github-api/branch/branchCreate')
let gParser
let branchSha
const createPullRequestFromFiles = async (zParser, {
    title,
    body,
    filesByPath,
    branchName,
    who,
    contributions,
}) => {
    gParser = zParser

    branchSha = await branchCreate(zParser, {branchName})

    await createOrUpdateFiles({
        filesByPath,
        branchName,
    })

    return await createPullRequest({
        title,
        body,
        branchName,
        who,
        contributions,
    })
}

const createPullRequest = async ({title, body, branchName, who, contributions}) => {
    const {zContextParsed} = gParser
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
        zRepository,
    } = zContextParsed

    try {
        const result = await zGithub.pulls.create({
            owner: zRepoOwner,
            repo: zRepoName,
            title,
            body,
            head: branchName,
            base: zRepository.repositoryDefaultBranch,
            maintainer_can_modify: true,
        })
        return {
            pullRequestURL: result.data.html_url,
            pullRequestNumber: result.data.number,
            pullCreated: true,
        }
    } catch (error) {
        if (error.status === 422) {
            const pullRequestData = await getPullRequestData({
                branchName,
            })
            const {
                pullRequestURL,
                pullRequestNumber,
            } = pullRequestData
            await pullsBody(zGithub, {
                owner: zRepoOwner,
                repo: zRepoName,
                pull_number: pullRequestNumber,
                body,
            })
            const commentReply = new CommentReply({zParser: gParser})
            commentReply.reply(
                `I've just updated @${who}'s contributions in this pull request (#${pullRequestNumber})! :tada:`,
            )
            commentReply.reply(`Contributions: **${contributions.join(', ')}**`)
            commentReply
                .withNumber(pullRequestNumber)
                .addAutomaticResponse(true)
                .send()
            return {
                pullRequestURL,
                pullRequestNumber,
                pullCreated: false,
            }
        }
    }
}

const getPullRequestData = async ({branchName}) => {
    const {zContextParsed} = gParser
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
    } = zContextParsed
    const results = await zGithub.pulls.list({
        owner: zRepoOwner,
        repo: zRepoName,
        state: 'open',
        head: `${zRepoOwner}:${branchName}`,
    })
    return {
        pullRequestURL: results.data[0].html_url,
        pullRequestNumber: results.data[0].number,
    }
}

const createOrUpdateFiles = async ({filesByPath, branchName}) => {
    const createOrUpdateFilesMultiple = Object.entries(filesByPath).map(
        ([filePath, {content, originalSha}]) => {
            return createOrUpdateFile({
                filePath,
                content,
                branchName,
            })
        },
    )

    await Promise.all(createOrUpdateFilesMultiple)
}

const createOrUpdateFile = async ({filePath, content, branchName}) => {
    const {sha: originalSha} = await getFile(gParser, {zFilePath: filePath, zBranch: branchName})
    if (originalSha === undefined) {
        await createFile({filePath, content, branchName})
    } else {
        await updateFile({
            filePath,
            content,
            branchName,
            originalSha,
        })
    }
}

const createFile = async ({filePath, content, branchName, originalSha}) => {
    const contentBinary = Buffer.from(content).toString('base64')
    const {zContextParsed} = gParser
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
    } = zContextParsed
    try {
        await zGithub.repos.createOrUpdateFile({
            owner: zRepoOwner,
            repo: zRepoName,
            path: filePath,
            message: `create ${filePath}`,
            content: contentBinary,
            branch: branchName,
        })
    } catch (error) {
        throw error
    }
}

const updateFile = async ({filePath, content, branchName, originalSha}) => {
    const contentBinary = Buffer.from(content).toString('base64')
    const {zContextParsed} = gParser
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
    } = zContextParsed
    try {
        await zGithub.repos.createOrUpdateFile({
            owner: zRepoOwner,
            repo: zRepoName,
            path: filePath,
            message: `update ${filePath}`,
            content: contentBinary,
            branch: branchName,
            sha: originalSha,
        })
    } catch (error) {
        throw error
    }
}

module.exports = {
    createPullRequestFromFiles,
}