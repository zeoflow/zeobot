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

const {requireMembers} = require('./ccs-require-members')
const {getCCSStatus} = require('./ccs-status')
const {reposCompareCommits} = require('../../libs/github-api/repos/reposCompareCommits')
const {checksCreate} = require('../../libs/github-api/checks/checksCreate')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class ContributorsCommitsSigned {

    static async initializer({zContext}) {
        console.log('ContributorsCommitsSigned')
        const zParser = await initialiseContext({zContext})
        const zContributorsCommitsSigned = new ContributorsCommitsSigned({zParser})
        await zContributorsCommitsSigned.run()
    }

    static events() {
        return [
            'pull_request.edited',
            'pull_request.opened',
            'pull_request.reopened',
            'pull_request.synchronize',
            'check_run.requested_action',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
        this.summary = ''
    }

    async run() {

        const zParser = this.zParser
        const {
            zContextParsed,
            zConfigFile,
        } = zParser
        const {zContributorsCommitsSigned} = zConfigFile
        const {
            enabled,
            isRequiredForMembers,
        } = zContributorsCommitsSigned
        const {
            zPullRequest,
            zContext,
            zActionType,
            zActionName,
        } = zContextParsed

        if (zActionName === 'check_run' && zActionType === 'requested_action') {
            return this.overrideCCS()
        }

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        const {htmlURL} = zPullRequest
        const zCompareCommits = await reposCompareCommits({zParser})
        const commits = zCompareCommits.data.commits

        const isRequiredFor = await requireMembers(isRequiredForMembers, zParser)
        const dcoFailed = await getCCSStatus(
            commits,
            isRequiredFor,
            htmlURL,
        )

        if (!dcoFailed.length) {
            this.createSuccessfulCheck()
        } else {
            let summary = []
            dcoFailed.forEach(function (commit) {
                summary.push(
                    `Commit sha: [${commit.sha.substr(0, 7)}](${commit.url}), Author: ${
                        commit.author
                    }, Committer: ${commit.committer}; ${commit.message}`,
                )
            })
            summary = summary.join('\n')
            if (dcoFailed.length === 1) {
                summary = this.handleOneCommit() + `\n\n${summary}`
            } else {
                summary = this.handleMultipleCommits(dcoFailed) + `\n\n${summary}`
            }
            this.summary = summary
            this.createActionRequiredCheck()
        }

    }

    handleOneCommit() {
        return 'You only have one commit incorrectly signed off!'
    }

    handleMultipleCommits(dcoFailed) {
        return `You have ${dcoFailed.length} commits incorrectly signed off.`
    }

    overrideCCS() {
        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {zCheckRun, zRequestedAction} = zContextParsed
    }

    createActionRequiredCheck() {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zContributorsCommitsSigned} = zConfigFile
        const {enabled} = zContributorsCommitsSigned

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        checksCreate(this.zParser, {
            name: 'ZeoBot (Contributor Commits Signed)',
            status: 'completed',
            conclusion: 'action_required',
            summary: this.summary,
            actions: [
                {
                    label: 'Set CCS to pass',
                    description: 'would set status to passing',
                    identifier: 'override_ccs',
                },
            ],
        })

    }

    createSuccessfulCheck() {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zContributorsCommitsSigned} = zConfigFile
        const {enabled} = zContributorsCommitsSigned

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }

        checksCreate(this.zParser, {
            name: 'ZeoBot (Contributor Commits Signed)',
            status: 'completed',
            conclusion: 'success',
            summary: 'All commits are signed off!',
        })

    }

    createNotEnabledCheck() {
        checksCreate(this.zParser, {
            name: 'ZeoBot (Contributor Commits Signed)',
            status: 'completed',
            conclusion: 'neutral',
            summary: 'Contributor Commits Signed is disabled. To enable change the config file that is located at `.zeobot/config.yml`',
        })
    }

}

module.exports = ContributorsCommitsSigned
