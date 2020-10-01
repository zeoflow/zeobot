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

const CommentReply = require('../../utils/comment-reply')
const pullsClose = async (zParser) => {

    const {
        zContextParsed,
    } = zParser

    const {
        zGithub,

        zNumber,
        zRepoOwner,
        zRepoName,
    } = zContextParsed

    await zGithub.pulls.update({
        owner: zRepoOwner,
        pull_number: zNumber,
        repo: zRepoName,
        state: 'closed',
    })

    const commentReply = new CommentReply({zParser})
    commentReply.reply(`I've just closed this pull request.`)
    return commentReply
        .addAutomaticResponse(true)
        .send()
}

const pullsOpen = async (zParser) => {

    const {
        zContextParsed,
    } = zParser

    const {
        zGithub,

        zNumber,
        zRepoOwner,
        zRepoName,
    } = zContextParsed

    await zGithub.pulls.update({
        owner: zRepoOwner,
        pull_number: zNumber,
        repo: zRepoName,
        state: 'open',
    })

    const commentReply = new CommentReply({zParser})
    commentReply.reply(`I've just re-opened this pull request.`)
    return commentReply
        .addAutomaticResponse(true)
        .send()
}

const pullsBody = async (mGithub, {
    owner,
    repo,
    pull_number,
    body,
}) => {

    return await mGithub.pulls.update({
        owner,
        pull_number,
        repo,
        body,
    })
}

module.exports = {
    pullsClose,
    pullsOpen,
    pullsBody,
}
