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

const {branchDelete} = require('../../libs/github-api/branch/branchDelete')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')
class AutodeleteMergedBranches {

    static async initializer({zContext}) {
        console.log('AutodeleteMergedBranches')
        const zParser = await initialiseContext({zContext})
        const zAutodeleteMergedBranches = new AutodeleteMergedBranches({zParser})
        await zAutodeleteMergedBranches.run()
    }

    static events() {
        return [
            "pull_request.closed",
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
        const {zAutodeleteMergedBranches} = zConfigFile
        const {
            enabled,
            branchesToExclude,
        } = zAutodeleteMergedBranches
        const {
            zPullRequest,
        } = zContextParsed

        const {
            head,
            base,
            merged: isMerged,
        } = zPullRequest

        const headRepoId = head.repo.id
        const baseRepoId = base.repo.id

        const branchName = head.ref
        if (!enabled || !isMerged) {
            return
        }

        if (headRepoId !== baseRepoId) {
            // Closing PR from fork
            return
        }

        if (branchesToExclude.some(
            rule => new RegExp(`^${rule.split('*').join('.*')}$`).test(branchName),
        )) {
            return
        }

        await branchDelete(this.zParser)

    }

}

module.exports = AutodeleteMergedBranches