/**
 * Copyright 2021 ZeoFlow SRL
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

const nlp = require('compromise')
const ContributorsCommitsSigned = require('../contributors-commits-signed')
const LicenseChecker = require('../license-checker')
const EnforceBranchMerge = require('../enforce-branch-merge')
const BranchInProgress = require('../branch-in-progress')
const AddContribuitor = require('../add-contributor')
const CommentReply = require('../../libs/utils/comment-reply')
const ToDo = require('../todo')
const {commandsList} = require('../../libs/utils/commands/command-parser')
const {markTodo} = require('../../libs/utils/commands/command-parser')
const {unmarkTodo} = require('../../libs/utils/commands/command-parser')
const {branchDelete} = require('../../libs/utils/commands/command-parser')
const {branchDelete: gitDeleteBranch} = require('../../libs/github-api/branch/branchDelete')
const {branchOpen} = require('../../libs/utils/commands/command-parser')
const {bipSet} = require('../../libs/utils/commands/command-parser')
const {bipDelete} = require('../../libs/utils/commands/command-parser')
const {pullsOpen} = require('../../libs/github-api/pulls/pullsUpdate')
const {prOpen} = require('../../libs/utils/commands/command-parser')
const {pullsClose} = require('../../libs/github-api/pulls/pullsUpdate')
const {prClose} = require('../../libs/utils/commands/command-parser')
const {forceSet} = require('../../libs/utils/commands/command-parser')
const {statusCheck} = require('../../libs/utils/commands/command-parser')
const {isValidCommand} = require('../../libs/utils/commands/command-parser')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class Assistant {

    static async initializer({zContext}) {
        console.log('Assistant')
        const zParser = await initialiseContext({zContext})
        const zAssistant = new Assistant({zParser})
        await zAssistant.run()
    }

    static events() {
        return [
            'issue_comment.created',
            'issue_comment.deleted',
            'issue_comment.edited',
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

        const {
            zSender,
            zComment,
            zIsBot,
            zIsPullRequest,
            zNumber,

            zActionType,
        } = zContextParsed

        const {
            zZeobot,
        } = zConfigFile

        const {
            commandsEnabled,
            listenToUsers,
        } = zZeobot

        if (zActionType !== 'created') {
            return
        }

        if (!commandsEnabled) {
            return
        }

        if (zIsBot) {
            return
        }

        if (!this.isMessageForBot(zComment.body)) {
            return
        }

        const userCommandApproved = listenToUsers.map(value => {
            return value.toLowerCase()
        }).some(rule =>
            new RegExp(`^${rule.split('*').join('.*')}$`).test(zSender.senderLogin.toLowerCase()),
        ) || listenToUsers.length === 0

        if (!isValidCommand(zComment.body)) {
            const commentReply = new CommentReply({zParser})
            commentReply.reply(`I could not determine your intention. :confused:`)
            commentReply.reply(`To view the available commands, type: :point_right:**\`@zeobot commands\`**:point_left:`)
            return commentReply
                .addAutomaticResponse()
                .send()
        }
        const {validCommand: validCommandList} = commandsList(zComment.body)
        if (validCommandList) {
            const categories = [
                {
                    name: 'BIP (Branch In Progress)',
                    restricted: true,
                },
                {
                    name: 'Branch',
                    restricted: true,
                },
                {
                    name: 'Commands List',
                    restricted: false,
                },
                {
                    name: 'Contributors',
                    restricted: true,
                },
                {
                    name: 'Force Status Check',
                    restricted: true,
                },
                {
                    name: 'Pull Request',
                    restricted: true,
                },
                {
                    name: 'Status Checks',
                    restricted: false,
                },
                {
                    name: 'ToDo',
                    restricted: true,
                },
            ]
            let navigator = 0
            const filteredCategories = categories.filter(category => {
                if (userCommandApproved) {
                    return category
                } else if (!category.restricted) {
                    return category
                }
            })
            const restrictedCategories = categories.map(category => {
                if (category.restricted) {
                    return `- **${category.name.toLowerCase()}(r)**`
                }
            }).filter(category => category)
            const exCategory = filteredCategories[Math.floor(Math.random() * filteredCategories.length)].name.toLowerCase()
            filteredCategories.forEach(category => {
                filteredCategories[navigator] = `- **${category.name.toLowerCase()}${category.restricted ? '(r)' : ''}**`
                navigator++
            })
            const commentReply = new CommentReply({zParser})
            commentReply.reply(`Here are the categories that are relevant to you: \n${filteredCategories.join('\n')}`)
            if (!userCommandApproved) {
                commentReply.reply(`The restricted categories are the following: \n${restrictedCategories.join('\n')}`)
            }
            commentReply.reply(`##### To view the commands from a category, type: **\`@zeobot commands >> ${exCategory}\`**.`)
            commentReply.reply(`##### (r) means that this command is restricted.`)
            return commentReply
                .addAutomaticResponse(true)
                .send()
        }

        if (statusCheck(zComment.body)) {
            if (!zIsPullRequest) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You are attempting to do the status checks for an issue. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            }
            const commentReply = new CommentReply({zParser})
            commentReply.reply(`Status check requested.`)
            commentReply
                .addAutomaticResponse(true)
                .send()
            let zContributorsCommitsSigned = new ContributorsCommitsSigned({zParser})
            await zContributorsCommitsSigned.run()
            let zLicenseChecker = new LicenseChecker({zParser})
            await zLicenseChecker.run()
            let zEnforceBranchMerge = new EnforceBranchMerge({zParser})
            await zEnforceBranchMerge.run()
            let zBranchInProgress = new BranchInProgress({zParser})
            await zBranchInProgress.run()
            return
        }

        if (!userCommandApproved) {
            const commentReply = new CommentReply({zParser})
            commentReply.reply(`:rotating_light: You **don't have the clearance** for this command. :rotating_light:`)
            return commentReply
                .addAdminsResponse(listenToUsers)
                .addAutomaticResponse(true)
                .send()
        }

        const {checks: checkForceSet, status: statusForceSet, validCommand: validForceSet} = forceSet(zComment.body)
        const {validCommand: validPrClose} = prClose(zComment.body)
        const {validCommand: validPrOpen} = prOpen(zComment.body)
        const {validCommand: validBipSet} = bipSet(zComment.body)
        const {validCommand: validBipDelete} = bipDelete(zComment.body)
        const {validCommand: validBranchOpen} = branchOpen(zComment.body)
        const {validCommand: validBranchDelete} = branchDelete(zComment.body)
        const {validCommand: validMarkTodo} = markTodo(zComment.body)
        const {validCommand: validUnmarkTodo} = unmarkTodo(zComment.body)
        if (zIsPullRequest) {
            if (validForceSet) {
                return this.attemptForceSet(checkForceSet, statusForceSet)
            } else if (validPrClose) {
                return await pullsClose(zParser)
            } else if (validPrOpen) {
                return await pullsOpen(zParser)
            } else if (validBipSet) {
                let zBranchInProgress = new BranchInProgress({zParser})
                return await zBranchInProgress.setBip()
            } else if (validBipDelete) {
                let zBranchInProgress = new BranchInProgress({zParser})
                return await zBranchInProgress.deleteBip()
            } else if (validBranchOpen) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`This command is disabled for this repo.`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validBranchDelete) {
                await gitDeleteBranch(zParser)
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`I've just deleted this branch.`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validMarkTodo) {
                return await new ToDo({zParser}).markTodo()
            } else if (validUnmarkTodo) {
                return await new ToDo({zParser}).unmarkTodo()
            }
            return await new AddContribuitor({
                zParser,
                zComment: zComment.body,
            }).detectComment()
        } else {
            if (validForceSet) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You are attempting to override the check${checkForceSet.length !== 1 ? 's' : ''} for an issue. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validPrClose) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You are attempting to close this issue using the pull request command. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validPrOpen) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You are attempting to open this issue using the pull request command. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validBipSet || validBipDelete) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You can not use this command for an issue. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validBranchOpen || validBranchDelete) {
                const commentReply = new CommentReply({zParser})
                commentReply.reply(`You can not use this command for an issue. :confused:`)
                return commentReply
                    .addAutomaticResponse(true)
                    .send()
            } else if (validMarkTodo) {
                return await new ToDo({zParser}).markTodo()
            } else if (validUnmarkTodo) {
                return await new ToDo({zParser}).unmarkTodo()
            }
            return await new AddContribuitor({
                zParser,
                zComment: zComment.body,
            }).detectComment()
        }

    }

    isMessageForBot(message) {
        return nlp(message)
            .toLowerCase()
            .normalize({
                whitespace: true, // remove hyphens, newlines, and force one space between words
                case: false, // keep only first-word, and 'entity' titlecasing
                numbers: false, // turn 'seven' to '7'
                punctuation: true, // remove commas, semicolons - but keep sentence-ending punctuation
                unicode: false, // visually romanize/anglicize 'Björk' into 'Bjork'.
                contractions: false, // turn "isn't" to "is not"
                acronyms: false, //remove periods from acronyms, like 'F.B.I.'
                parentheses: false, //remove words inside brackets (like these)
                possessives: false, // turn "Google's tax return" to "Google tax return"
                plurals: false, // turn "batmobiles" into "batmobile"
                verbs: false, // turn all verbs into Infinitive form - "I walked" → "I walk"
                honorifics: false, //turn 'Vice Admiral John Smith' to 'John Smith'
            })
            .has('/(@zeobot|@zeoflow)/')
    }

    attemptForceSet(checks, status) {

        const zParser = this.zParser
        for (let i = 0; i < checks.length; i++) {
            switch (checks[i]) {
                case 'bip':
                    let zBranchInProgress = new BranchInProgress({zParser})
                    if (status === 'pass') {
                        zBranchInProgress.createSuccessfulCheck()
                    } else if (status === 'fail') {
                        zBranchInProgress.createActionRequiredCheck()
                    }
                    break
                case 'ccs':
                    let zContributorsCommitsSigned = new ContributorsCommitsSigned({zParser})
                    if (status === 'pass') {
                        zContributorsCommitsSigned.createSuccessfulCheck()
                    } else if (status === 'fail') {
                        zContributorsCommitsSigned.createActionRequiredCheck()
                    }
                    break
                case 'ebm':
                    let zEnforceBranchMerge = new EnforceBranchMerge({zParser})
                    if (status === 'pass') {
                        zEnforceBranchMerge.createSuccessfulCheck()
                    } else if (status === 'fail') {
                        zEnforceBranchMerge.createActionRequiredCheck()
                    }
                    break
                case 'lc':
                    let zLicenseChecker = new LicenseChecker({zParser})
                    if (status === 'pass') {
                        zLicenseChecker.createSuccessfulCheck()
                    } else if (status === 'fail') {
                        zLicenseChecker.createActionRequiredCheck('Override')
                    }
                    break
                default:
            }
        }
        if (checks.length !== 0) {
            const commentReply = new CommentReply({zParser})
            commentReply.reply(`I've just updated the following check${checks.length !== 1 ? 's' : ''}: **${checks.join(', ')}** to **${status}**`)
            return commentReply
                .addAutomaticResponse(true)
                .send()
        }
    }

}

module.exports = Assistant
