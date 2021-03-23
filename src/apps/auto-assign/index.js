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

const {issueAddAssignees} = require('../../libs/github-api/issue/issueAddAssignees')
const {pullsCreateReviewRequest} = require('../../libs/github-api/pulls/pullsCreateReviewRequest')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')
const lodash = require('lodash')
class AutoAssign {

    static async initializer({zContext}) {
        console.log('AutoAssign')
        const zParser = await initialiseContext({zContext})
        const zAutoAssign = new AutoAssign({zParser})
        await zAutoAssign.run()
    }

    static events() {
        return [
            'pull_request.opened',
            'pull_request.ready_for_review',
            'pull_request.reopened',
            'issues.opened',
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
        const {zAutoAssign} = zConfigFile
        const {
            enabled,
            useReviewGroups,
            useAssigneeGroups,
            addReviewers,
            addAssignees,
            reviewGroups,
            assigneeGroups,
            skipKeywords,
        } = zAutoAssign
        const {
            zGithub,
            zPullRequest,
            zIssue,

            zRepoOwner,
            zRepoName,
            zNumber,
        } = zContextParsed

        if (!enabled) {
            return
        }

        let zContent = zPullRequest
        let isPr = true
        if(zContent == null)
        {
            isPr = false
            zContent = zIssue
        }
        const owner = zRepoOwner
        const repo = zRepoName
        const {
            title,
            draft,
        } = zContent

        if (skipKeywords && this.includesSkipKeywords(title, skipKeywords)) {
            return
        }
        if (draft && isPr) {
            return
        }
        if (useReviewGroups && !reviewGroups) {
            return
        }
        if (useAssigneeGroups && !assigneeGroups) {
            return
        }
        if (addReviewers && isPr) {
            const {reviewers, team_reviewers} = this.chooseReviewers(owner, zAutoAssign)
            if (reviewers.length > 0 || team_reviewers.length > 0) {
                await pullsCreateReviewRequest(zGithub, {
                    owner,
                    repo,
                    pull_number: zNumber,
                    reviewers,
                    team_reviewers,
                })
            }
        }
        if (addAssignees) {
            const assignees = this.chooseAssignees(owner, zAutoAssign)
            if (assignees.length > 0) {
                await issueAddAssignees(zGithub, {
                    owner,
                    repo,
                    issue_number: zNumber,
                    assignees,
                })
            }
        }

    }

    chooseUsers(candidates, desiredNumber, filterUser = '') {
        const {teams, users} = candidates.reduce(
            (acc, reviewer) => {
                const separator = '/'
                const isTeam = reviewer.includes(separator)
                if (isTeam) {
                    const team = reviewer.split(separator)[1]
                    acc.teams = [...acc.teams, team]
                } else if (reviewer !== filterUser) {
                    acc.users = [...acc.users, reviewer]
                }
                return acc
            },
            {
                teams: [],
                users: [],
            },
        )
        // all-assign
        if (desiredNumber === 0) {
            return {
                teams,
                users,
            }
        }
        return {
            teams,
            users: lodash.sampleSize(users, desiredNumber),
        }
    }

    chooseUsersFromGroups(owner, groups, desiredNumber) {
        let users = []
        for (const group in groups) {
            if (groups.hasOwnProperty(group)) {
                users = users.concat(
                    this.chooseUsers(groups[group], desiredNumber, owner).users,
                )
            }
        }
        return users
    }

    chooseReviewers(owner, zAutoAssign) {
        const {
            useReviewGroups,
            numberOfReviewers,
            reviewGroups,
            reviewersToAdd,
        } = zAutoAssign
        const useGroups = useReviewGroups && Object.keys(reviewGroups).length > 0
        if (useGroups) {
            const chosenReviewers = this.chooseUsersFromGroups(
                owner,
                reviewGroups,
                numberOfReviewers,
            )
            return {
                reviewers: chosenReviewers,
                team_reviewers: [],
            }
        }
        const chosenReviewers = this.chooseUsers(reviewersToAdd, numberOfReviewers, owner)
        return {
            reviewers: chosenReviewers.users,
            team_reviewers: chosenReviewers.teams,
        }
    }

    chooseAssignees(owner, zAutoAssign) {
        const {
            useAssigneeGroups,
            addAssignees,
            assigneeGroups,
            numberOfAssignees,
            numberOfReviewers,
            reviewersToAdd,
            assigneesToAdd,
        } = zAutoAssign
        let chosenAssignees = []
        const useGroups = useAssigneeGroups && Object.keys(assigneeGroups).length > 0
        if (typeof addAssignees === 'string') {
            if (addAssignees !== 'author') {
                throw new Error(
                    'Error in configuration file to do with using addAssignees. Expected \'addAssignees\' variable to be either boolean or \'author\'',
                )
            }
            chosenAssignees = [owner]
        } else if (useGroups) {
            chosenAssignees = this.chooseUsersFromGroups(
                owner,
                assigneeGroups,
                numberOfAssignees || numberOfReviewers,
            )
        } else {
            const candidates = assigneesToAdd ? assigneesToAdd : reviewersToAdd
            chosenAssignees = this.chooseUsers(
                candidates,
                numberOfAssignees || numberOfReviewers,
                owner,
            ).users
        }
        return chosenAssignees
    }

    includesSkipKeywords(title, skipKeywords) {
        for (const skipKeyword of skipKeywords) {
            if (title.toLowerCase().includes(skipKeyword.toLowerCase()) === true) {
                return true
            }
        }
        return false
    }

}

module.exports = AutoAssign
