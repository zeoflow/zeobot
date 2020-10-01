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

const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const reopenClosed = require('./utils/reopen-closed')
const mainLoop = require('./utils/main-loop')
const CommentReply = require('../../libs/utils/comment-reply')
const {issueListForRepo} = require('../../libs/github-api/issue/issueListForRepo')

const {initialiseContext} = require('../../libs/zbot-parser/initialise')
const {issueListComments} = require('../../libs/github-api/issue/issueListComments')
const {assignFlow, lineBreak, truncate} = require('./utils/helpers')
const {issueListLabelsOnIssue} = require('../../libs/github-api/issue/issueListLabelsOnIssue')
const {reposListCollaborators} = require('../../libs/github-api/repos/reposListCollaborators')
const {issueCreate} = require('../../libs/github-api/issue/issueCreate')
const {commentCreate} = require('../../libs/github-api/comment/commentCreate')
const {
    zCommentTodoMD,
    zIssueTodoMD,
    zIssueFromMergeTodoMD,
    zTitleChangeTodoMD,
} = require('../../../res/templates')

class ToDo {

    static async initializer({zContext}) {
        console.log('ToDo')
        const zParser = await initialiseContext({zContext})
        const zToDo = new ToDo({zParser})
        await zToDo.run()
    }

    static events() {
        return [
            'pull_request.opened',
            'pull_request.reopened',
            'pull_request.synchronize',
            'pull_request.closed',
            'push',
            'issues.edited',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    async markTodo() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zIsPullRequest,
            zGithub,
            zRepoOwner,
            zRepoName,
            zNumber,
        } = zContextParsed

        await zGithub.issues.addLabels({
            owner: zRepoOwner,
            repo: zRepoName,
            issue_number: zNumber,
            labels: ['@zeobot-todo'],
        })

        const commentReply = new CommentReply({zParser})
        commentReply.reply(`I've just added the **\`@zeobot-todo\`** label.`)
        commentReply.reply(`From now on, this ${zIsPullRequest ? 'pull request' : 'issue'} will be considered as a **\`todo task\`**.`)
        return commentReply
            .addAutomaticResponse(true)
            .send()

    }

    async unmarkTodo() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zIsPullRequest,
            zGithub,
            zRepoOwner,
            zRepoName,
            zNumber,
        } = zContextParsed

        await zGithub.issues.removeLabel({
            owner: zRepoOwner,
            repo: zRepoName,
            issue_number: zNumber,
            name: '@zeobot-todo',
        })

        const commentReply = new CommentReply({zParser})
        commentReply.reply(`I've just removed the **\`@zeobot-todo\`** label.`)
        commentReply.reply(`From now on, this ${zIsPullRequest ? 'pull request' : 'issue'} won't be considered a **\`todo task\`**.`)
        return commentReply
            .addAutomaticResponse(true)
            .send()

    }

    async run() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zActionName,
            zActionType,
        } = zContextParsed

        if (zActionName === 'pull_request') {
            if (zActionType === 'opened' || zActionType === 'reopened' || zActionType === 'synchronize') {
                /**
                 * @todo-zeobot(t): auto case title
                 * @todo-zeobot(b): if the users choose so, the titles from the issues will start
                 * @todo-zeobot(b): with capital/lower/normal letter
                 */
                // pullRequestHandler
                await this.pullRequestHandler()
            } else if (zActionType === 'closed') {
                // pullRequestMergedHandler
                await this.pullRequestMergedHandler()
            }
        } else if (zActionName === 'push') {
            // pushHandler
            await this.pushHandler()
        } else if (zActionName === 'issues') {
            if (zActionType === 'edited') {
                // issueRenameHandler
                await this.issueRenameHandler()
            }
        }

    }

    async pullRequestHandler() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zContext,

            zNumber,
            zRef,
        } = zContextParsed

        const {zIssueListForRepo} = await issueListForRepo({zParser})
        const {zCommentsList} = await issueListComments({zParser})
        return mainLoop({zContext, zRef},
            async (
                {
                    title,
                    keyword,
                    sha,
                    filename,
                    assignedToString,
                    range,
                    bodyComment,
                }) => {
                // This PR already has a comment for this item
                if (zCommentsList.some(c => c.body.startsWith(`## ${title}`))) {
                    zContext.log(`Comment with title [${title}] already exists`)
                    return
                }

                let issueNo = 'N/A'
                let zIssue = zIssueListForRepo.filter(issue => issue.title === title)
                if (zIssue.length > 0) {
                    issueNo = zIssue[0].number
                }

                let body = zCommentTodoMD(zContext.repo({
                    title,
                    body: bodyComment,
                    sha,
                    assignedToString,
                    number: issueNo,
                    range,
                    filename,
                    keyword,
                }))

                body = lineBreak(body)
                const {owner, repo} = zContext.repo()
                zContext.log(`Creating comment [${title}] in [${owner}/${repo}#${zNumber}]`)
                return commentCreate(zParser, {
                    owner,
                    repo,
                    content: body,
                    issue_number: zNumber,
                })
            })
    }

    async pullRequestMergedHandler() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zContext,
            zPullRequest,

            zNumber,
            zRef,
        } = zContextParsed

        if (!zPullRequest.merged)
            return

        return mainLoop({zContext, zRef}, async ({
                                             title,
                                             config,
                                             filename,
                                             range,
                                             assignedToString,
                                             keyword,
                                             bodyComment,
                                             sha,
                                             username,
                                         }) => {
            // Prevent duplicates
            const existingIssue = await checkForDuplicateIssue(zContext, title)
            if (existingIssue) {
                zContext.log(`Duplicate issue found with title [${title}]`)
                return reopenClosed({context: zContext, config, issue: existingIssue}, {
                    keyword,
                    title,
                    sha,
                    filename,
                })
            }

            let body = zIssueFromMergeTodoMD(zContext.repo({
                sha,
                assignedToString,
                range,
                filename,
                keyword,
                number: zNumber,
                body: bodyComment,
            }))

            body = lineBreak(body)
            const {owner, repo} = zContext.repo()
            zContext.log(`Creating issue [${title}] in [${owner}/${repo}]`)
            return zContext.github.issues.create(zContext.repo({
                title: truncate(title),
                body,
                ...assignFlow(config, username),
            }))
        })
    }

    async pushHandler() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zContext,
            zGithub,
            zPayload,
            zRef,
        } = zContextParsed

        if (zContext.payload === undefined) {
            return
        }
        // if (zPayload.head_commit === undefined) {
        //     return
        // }
        // if (zPayload.head_commit.id === undefined) {
        //     return
        // }
        // // Do not trigger on merge commits
        // const commit = await zGithub.git.getCommit(zContext.repo({
        //     commit_sha: zPayload.head_commit.id,
        // }))
        //
        // if (commit.data.parents.length > 1) {
        //     return
        // }

        return mainLoop({zContext, zRef}, async ({
                                             title,
                                             config,
                                             keyword,
                                             sha,
                                             filename,
                                             range,
                                             username,
                                             bodyComment,
                                             assigneesToAdd,
                                             labelsToAdd,
                                         }) => {
            // Prevent duplicates
            const existingIssue = await checkForDuplicateIssue(zContext, title)
            if (existingIssue) {
                if (typeof existingIssue === 'string') return
                zContext.log(`Duplicate issue found with title [${title}]`)
                return reopenClosed({context: zContext, config, issue: existingIssue}, {keyword, sha, filename})
            }

            let mentions
            if (assigneesToAdd.length === 0) {
                mentions = null
            } else {
                mentions = ''
                for (let i = 0; i < assigneesToAdd.length; i++) {
                    mentions += '@' + assigneesToAdd[i]
                    if (i !== assigneesToAdd.length - 1) {
                        mentions += ', '
                    }
                }
            }

            const {owner, repo} = zContext.repo()

            const collaboratorsList = await reposListCollaborators(zGithub, {
                owner,
                repo,
            })
            let repoCollaborators = []
            collaboratorsList.forEach(collaborator => {
                repoCollaborators.push(collaborator.login.toLowerCase())
            })
            let issueAssignees = [
                username,
            ]
            let assignees = [
                '@' + username,
            ]
            assigneesToAdd.forEach(assignee => {
                if (repoCollaborators.includes(assignee.toLowerCase())) {
                    assignees.push('@' + assignee.toLowerCase())
                    issueAssignees.push(assignee.toLowerCase())
                }
            })

            let assigneesTxt = '' + assignees.join(', ')
            if (assignees.length === 1) {
                assigneesTxt += ' was'
            } else {
                assigneesTxt += ' were'
            }
            // Actually create the issue
            const body = lineBreak(zIssueTodoMD(zContext.repo({
                sha,
                author: username,
                mentions,
                assignees: assigneesTxt,
                range,
                filename,
                keyword,
                body: bodyComment,
            })))
            await issueCreate(zGithub, {
                owner: owner,
                repo: repo,
                title: truncate(title),
                labels: labelsToAdd,
                assignees: issueAssignees,
                body: body,
            })
        })

    }

    async issueRenameHandler() {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zContext,
            zGithub,

            zIsBot,
            zNumber,
        } = zContextParsed
        const {changes} = zContext.payload

        if (changes.title) {
            if (!zIsBot) {
                const {zLabelsOnIssue} = await issueListLabelsOnIssue({zParser})
                let found = false
                for (let i = 0; i < zLabelsOnIssue.length; i++) {
                    const zLabelOnIssue = zLabelsOnIssue[i]
                    const {name} = zLabelOnIssue
                    if (name === '@zeobot-todo') {
                        found = true
                        break
                    }
                }

                if (found) {
                    const {
                        zRepoOwner,
                        zRepoName,
                    } = zContextParsed
                    return Promise.all([
                        zGithub.issues.update({
                            issue_number: zNumber,
                            owner: zRepoOwner,
                            repo: zRepoName,
                            title: changes.title.from,
                        }),
                        commentCreate(zParser, {
                            issue_number: zNumber,
                            owner: zRepoOwner,
                            repo: zRepoName,
                            content: zTitleChangeTodoMD(),
                        }),
                    ])
                }
            }
        }
    }

}

module.exports = ToDo
