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

const {commentCreate} = require('../../github-api/comment/commentCreate')

class CommentReply {
    constructor({zParser}) {
        this.zParser = zParser
        this.message = ''
        this.sent = false
    }

    replyingToWho() {
        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {zSender} = zContextParsed
        return zSender.senderLogin
    }

    replyingToWhere() {
        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {zComment} = zContextParsed
        return zComment.htmlURL
    }

    reply(message) {
        this.message += `\n${message}\n`
    }

    withNumber(number) {
        this.number = number
        return this
    }

    addAdminsResponse(listenToUsers) {
        this.message += `\nRepository's members with clearance to use this command:`
        this.message += `\n> ##### ${listenToUsers.join(', ')}`
        return this
    }

    addAutomaticResponse(isRequested) {
        this.message += `\n---\n`
        if (isRequested) {
            this.message += `\n:pushpin: This is an **automatic response**. Action requested by @${this.replyingToWho()} in this [comment](${this.replyingToWhere()})`
        } else {
            this.message += `\n:pushpin: This is an **automatic response** based on @${this.replyingToWho()}'s [comment](${this.replyingToWhere()})`
        }
        this.message += `\n:pushpin: To **disable the comments** from zeobot, type: :point_right:**\`@zeobot disable comments\`**:point_left:`
        return this
    }

    addInstallationResponse() {
        this.message += `\n---\n`
        this.message += `\n:pushpin: This is an **automatic response** based on @${this.replyingToWho()}'s action`
        this.message += `\n:pushpin: To **disable the comments** from zeobot, type: :point_right:**\`@zeobot disable comments\`**:point_left:`
        return this
    }

    withOwner(owner) {
        this.owner = owner
        return this
    }

    withRepo(repo) {
        this.repo = repo
        return this
    }

    send() {
        if (this.sent) {
            return console.log('Message already sent')
        }

        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {
            zNumber,
            zRepoOwner,
            zRepoName,
        } = zContextParsed

        this.sent = true
        const body = `${this.message}`
        let number = zNumber
        if (this.number) {
            number = this.number
        }
        return commentCreate(zParser, {
            owner: zRepoOwner || this.owner,
            repo: zRepoName || this.repo,
            content: body,
            issue_number: number,
        })
    }
}

module.exports = CommentReply
