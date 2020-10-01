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

const CommentReply = require('../../libs/utils/comment-reply')
const {checksCreate} = require('../../libs/github-api/checks/checksCreate')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class BranchInProgress {

    static async initializer({zContext}) {
        console.log('BranchInProgress')
        const zParser = await initialiseContext({zContext})
        const zBranchInProgress = new BranchInProgress({zParser})
        await zBranchInProgress.run()
    }

    static events() {
        return [
            'pull_request.edited',
            'pull_request.labeled',
            'pull_request.opened',
            'pull_request.reopened',
            'pull_request.synchronize',
            'pull_request.unassigned',
            'pull_request.unlabeled',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    async run() {

        const zParser = this.zParser
        const {
            zContextParsed,
            zConfigFile,
        } = zParser
        const {zBranchInProgress} = zConfigFile
        const {
            enabled,
        } = zBranchInProgress
        const {
            zPullRequest,
            zIssue,
            zIsPullRequest,
        } = zContextParsed

        let labelsData
        if (zIsPullRequest) {
            labelsData = zPullRequest.labels
        } else {
            labelsData = zIssue.labels
        }

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        let labels = []
        for (let i = 0; i < labelsData.length; i++) {
            labels.push(labelsData[i].name)
        }

        const mergeBlocked = labels.indexOf('@zeobot-bip') !== -1
        if (!mergeBlocked) {
            this.createSuccessfulCheck()
        } else {
            this.createActionRequiredCheck()
        }
    }

    async setBip() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zNumber,
            zGithub,

            zRepoOwner,
            zRepoName,
        } = zContextParsed

        await zGithub.issues.addLabels({
            owner: zRepoOwner,
            repo: zRepoName,
            issue_number: zNumber,
            labels: ['@zeobot-bip'],
        })

        this.createActionRequiredCheck()

        const commentReply = new CommentReply({zParser})
        commentReply.reply(`I've just added the \`@zeobot-bip\` label to this branch.`)
        return commentReply
            .addAutomaticResponse(true)
            .send()

    }

    async deleteBip() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zNumber,
            zGithub,

            zRepoOwner,
            zRepoName,
        } = zContextParsed

        await zGithub.issues.removeLabel({
            owner: zRepoOwner,
            repo: zRepoName,
            issue_number: zNumber,
            name: '@zeobot-bip',
        })

        this.createSuccessfulCheck()

        const commentReply = new CommentReply({zParser})
        commentReply.reply(`I've just removed the \`@zeobot-bip\` label from this branch.`)
        return commentReply
            .addAutomaticResponse(true)
            .send()

    }

    createActionRequiredCheck() {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zBranchInProgress} = zConfigFile
        const {enabled} = zBranchInProgress

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        checksCreate(zParser, {
            name: 'ZeoBot (Branch In Progress)',
            status: 'completed',
            conclusion: 'action_required',
            summary: 'Merged block - possible reasons: the branch is under development or it contains some error',
        })

    }

    createSuccessfulCheck() {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zBranchInProgress} = zConfigFile
        const {enabled} = zBranchInProgress

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        checksCreate(zParser, {
            name: 'ZeoBot (Branch In Progress)',
            status: 'completed',
            conclusion: 'success',
            summary: 'You have the right to write to this branch',
        })

    }

    createNotEnabledCheck() {

        const zParser = this.zParser

        checksCreate(zParser, {
            name: 'ZeoBot (Branch In Progress)',
            status: 'completed',
            conclusion: 'neutral',
            summary: 'Branch In Progress is disabled. To enable change the config file that is located at `.zeobot/config.yml`',
        })

    }

}

module.exports = BranchInProgress
