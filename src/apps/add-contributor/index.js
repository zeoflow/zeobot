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

const nlp = require('compromise')
const CommentReply = require('../../libs/utils/comment-reply')
const getUserDetails = require('../../libs/utils/get-user-details')
const ContentFiles = require('./content-files')
const OptionsConfig = require('./options-config')
const {Contributions} = require('./utils/default-types')
const {createPullRequestFromFiles} = require('../../libs/utils/create-pull-request')
const {contributionParser} = require('../../libs/utils/commands/command-parser')
const {isActionCommand} = require('../../libs/utils/commands/command-parser')

const plugin = {
    words: {
        ...Contributions,
        'add': 'Action',
    },
}

nlp.plugin(plugin)

const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class AddContribuitor {

    static async initializer({zContext, zParser, zComment}) {
        if (zParser === undefined || zParser === null) {
            zParser = await initialiseContext({zContext})
        }
        return new AddContribuitor({zParser, zComment})
    }

    constructor({zParser, zComment}) {
        console.log('AddContribuitor')
        this.zParser = zParser
        this.zComment = zComment
    }

    async detectComment() {

        const zParser = this.zParser
        const commentReply = new CommentReply({zParser})
        const {who, action, contributions} = this.parseComment()

        if (action === 'add') {
            const safeWho = this.getSafeRef(who)
            const branchName = `add-contributor/${safeWho.toLowerCase()}`

            return await this.processAddContributor({
                who,
                contributions,
                branchName,
                commentReply,
            })
        }

        commentReply.reply(`I could not determine your intention.`)
        commentReply.reply(
            `Basic usage: @zeobot please add @teodorhmx1 for code, doc and infra`,
        )
        commentReply.reply(
            `For other usages see the [documentation](https://allcontributors.org/docs/en/bot/usage)`,
        )
        commentReply.send()

    }

    parseComment() {
        const message = this.zComment

        const {
            action,
            isCommand,
        } = isActionCommand(message)

        if (isCommand) {
            return this.parseAddComment(action)
        }

        return {
            action: false,
        }
    }

    parseAddComment(action) {

        const message = this.zComment

        let whoMatched = nlp(message)
            .match(`${action} [.]`)
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
            .data()[0].text

        const who = whoMatched.startsWith('@') ? whoMatched.substr(1) : whoMatched

        // Contributions
        const contributions = contributionParser(message)

        return {
            action: 'add',
            who,
            contributions,
        }
    }

    getSafeRef(ref) {
        return ref.replace(/[\.\[\~\^\:\?\*\@\/\\]/gi, '-')
    }


    async processAddContributor({
                                    who,
                                    contributions,
                                    branchName,
                                    commentReply,
                                }) {

        const zParser = this.zParser
        const {zContextParsed} = zParser
        const {zGithub, zNumber} = zContextParsed

        if (contributions.length === 0) {
            console.log('No contributions to add.')
            return
        }
        const {name, avatar_url, profile} = await getUserDetails({
            zGithub,
            username: who,
        })

        const zOptionsConfig = OptionsConfig.generateConfig({zParser})
        await zOptionsConfig.fetch()
        await zOptionsConfig.addContributor({
            login: who,
            contributions,
            name,
            avatar_url,
            profile,
        })

        const zContentFiles = new ContentFiles({
            zParser,
        })
        await zContentFiles.fetch(zOptionsConfig.get())
        zContentFiles.initContributors()
        zContentFiles.generate(zOptionsConfig.get())

        const filesByPathToUpdate = zContentFiles.get(zOptionsConfig)

        const {
            pullCreated,
            pullRequestNumber,
        } = await createPullRequestFromFiles(zParser, {
            title: `add ${who} as a contributor`,
            body: `Adds @${who} as a contributor for **${contributions.join(
                ', ',
            )}**.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${commentReply.replyingToWhere()}) in (#${zNumber})`,
            filesByPath: filesByPathToUpdate,
            branchName,
            who,
            contributions,
        })

        /**
         * @todo-zeobot(t): To change the structure for contributions
         * @todo-zeobot(b): **Old Contributions: ...**
         * @todo-zeobot(b): **New Contributions: ...**
         * @todo-zeobot(a): @TeodorHMX1
         * @todo-zeobot(l): @feature
         */
        if (pullCreated) {
            commentReply.reply(
                `I've put a pull request (#${pullRequestNumber}) to add @${who} as a contributor! :tada:`,
            )
            commentReply.reply(`Contributions: **${contributions.join(', ')}**`)
            commentReply
                .addAutomaticResponse(true)
                .send()
            return
        }
        // Updated
        commentReply.reply(
            `I've updated the pull request (#${pullRequestNumber}) to add @${who} as a contributor! :tada:`,
        )
        commentReply.reply(`Contributions: **${contributions.join(', ')}**`)
        commentReply
            .addAutomaticResponse(true)
            .send()
    }

}

module.exports = AddContribuitor
