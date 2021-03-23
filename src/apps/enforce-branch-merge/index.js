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

const {initialiseContext} = require('../../libs/zbot-parser/initialise')
const {checksCreate} = require('../../libs/github-api/checks/checksCreate')

class EnforceBranchMerge {

    static async initializer({zContext}) {
        console.log('EnforceBranchMerge')
        const zParser = await initialiseContext({zContext})
        const zEnforceBranchMerge = new EnforceBranchMerge({zParser})
        await zEnforceBranchMerge.run()
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
        const {zPullRequest} = zContextParsed
        const {zEnforceBranchMerge} = zConfigFile
        const {
            enabled,
            branchesToEnforce,
            giveAccessTo,
        } = zEnforceBranchMerge

        if (!enabled) {
            await this.createNotEnabledCheck()
            return
        }

        const {
            base,
            user,
        } = zPullRequest
        const branchName = base.ref
        const contributorUsername = user.login

        const branchBlocked = branchesToEnforce.some(rule =>
            new RegExp(`^${rule.split('*').join('.*')}$`).test(branchName),
        )
        // const userBlocked = giveAccessTo.some(rule =>
        //     new RegExp(`^${rule.split('*').join('.*')}$`).test(contributorUsername),
        // )
        const userBlocked = false

        if (branchesToEnforce && !userBlocked || !branchBlocked) {
            this.createSuccessfulCheck()
        } else {
            this.createActionRequiredCheck()
        }

    }

    createActionRequiredCheck() {

        const zParser = this.zParser
        const {zConfigFile, zContextParsed} = zParser
        const {zPullRequest, zSender} = zContextParsed
        const {zEnforceBranchMerge} = zConfigFile
        const {
            enabled,
            giveAccessTo,
        } = zEnforceBranchMerge

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }
        const {
            base,
            head,
        } = zPullRequest

        checksCreate(zParser, {
            name: 'ZeoBot (Enforce Branch Merge)',
            status: 'completed',
            conclusion: 'action_required',
            summary: 'The merge was blocked due to the protection rules (merge attempt from "' + head.ref + '" to "' + base.ref + '").\n\nPossible solutions: ask one of the contributors who have the right to merge to enforce to help you out (' + giveAccessTo.join(", ") + ').',
        })

    }

    createSuccessfulCheck() {

        const zParser = this.zParser
        const {zConfigFile, zContextParsed} = zParser
        const {zPullRequest} = zContextParsed
        const {zEnforceBranchMerge} = zConfigFile
        const {enabled} = zEnforceBranchMerge

        if (!enabled) {
            this.createNotEnabledCheck()
            return
        }
        const {
            base,
        } = zPullRequest

        checksCreate(zParser, {
            name: 'ZeoBot (Enforce Branch Merge)',
            status: 'completed',
            conclusion: 'success',
            summary: 'You have the right to write to this branch (' + base.ref + ').',
        })

    }

    createNotEnabledCheck() {

        const zParser = this.zParser

        checksCreate(zParser, {
            name: 'ZeoBot (Enforce Branch Merge)',
            status: 'completed',
            conclusion: 'neutral',
            summary: 'Enforce Branch Merge  is disabled. To enable change the config file that is located at `.zeobot/config.yml`',
        })

    }

}

module.exports = EnforceBranchMerge
