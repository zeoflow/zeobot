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

const {initialiseContext} = require('../../libs/zbot-parser/initialise')
const {pullsGetCommits} = require('../../libs/github-api/pulls/pullsGetCommits')
const {pullsList} = require('../../libs/github-api/pulls/pullsList')
const {
    pullRequestToString,
    categorizePullRequests,
    template,
    resolveVersionKeyIncrement,
    getTemplatableVersion,
    coerceVersion,
    sortPullRequests,
    findReleases,
} = require('./utils')

class DraftRelease {

    static async initializer({zContext}) {
        console.log('DraftRelease')
        const zParser = await initialiseContext({zContext})
        const zDraftRelease = new DraftRelease({zParser})
        await zDraftRelease.run()
    }

    static events() {
        return [
            'push',
            'pull_request.closed',
            'pull_request.labeled',
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
        const {zDraftRelease} = zConfigFile
        const {
            zRepository,
            zGithub,

            zRepoOwner,
            zRepoName,
        } = zContextParsed

        // get releases
        // draft release and last release
        const {draftRelease, lastRelease} = await findReleases({zContextParsed})

        const {pullsList: pullsListData} = await pullsList({zParser: this.zParser})
        const pullRequestsList = []
        pullsListData.forEach(pullObject => {
            if (pullObject.merged_at) {
                if (!lastRelease) {
                    pullRequestsList.push(pullObject)
                } else if (new Date(pullObject.merged_at) > new Date(lastRelease.published_at)) {
                    pullRequestsList.push(pullObject)
                }
            }
        })

        // sort pulls by merged at or title, asc desc
        const sortedMergedPullRequests = sortPullRequests(
            pullRequestsList,
            zDraftRelease.sortPullRequestsBy,
            zDraftRelease.sortPullRequestsDirection,
        )

        const pullsContent = []
        sortedMergedPullRequests.forEach(pullRequest => {
            const {
                number,
                title,
                body,
                labels,
                merged_at,
                base_branch,
            } = pullRequest
            const pullData = {
                number,
                title,
                userName: pullRequest.user.login,
                userType: pullRequest.user.type,
                body,
                labels,
                merged_at,
                base_branch,
                contributors: [],
            }
            pullsContent.push(pullData)
        })

        pullsContent.filter((pr) => pr.base_branch === zRepository.defaultBranch)
        for (let i = 0; i < pullsContent.length; i++) {
            const pr = pullsContent[i]
            let data = await pullsGetCommits({zParser, zNumber: pr.number})
            pullsContent[i].contributors = data['pullsCommits']
                .sort((a, b) => a.authorLogin.localeCompare(b.authorLogin))
                .map(item => item.authorLogin)
                .filter((value, index, self) => self.indexOf(value) === index)

        }

        const version = coerceVersion(lastRelease)
        let inputVersion = coerceVersion(`$MAJOR.$MINOR.$PATCH`)

        let versionInfo
        if (!version && !inputVersion) {
            versionInfo = {
                '$NEXT_MAJOR_VERSION':
                    {
                        version: '1.0.0',
                        template: '$MAJOR.$MINOR.$PATCH',
                        inputVersion: '1.0.0',
                        inc: 'major',
                        '$MAJOR': 1,
                        '$MINOR': 0,
                        '$PATCH': 0,
                    },
                '$NEXT_MINOR_VERSION':
                    {
                        version: '1.0.0',
                        template: '$MAJOR.$MINOR.$PATCH',
                        inputVersion: '1.0.0',
                        inc: 'minor',
                        '$MAJOR': 1,
                        '$MINOR': 0,
                        '$PATCH': 0,
                    },
                '$NEXT_PATCH_VERSION':
                    {
                        version: '1.0.0',
                        template: '$MAJOR.$MINOR.$PATCH',
                        inputVersion: '1.0.0',
                        inc: 'patch',
                        '$MAJOR': 1,
                        '$MINOR': 0,
                        '$PATCH': 0,
                    },
                '$RESOLVED_VERSION':
                    {
                        version: '1.0.0',
                        template: '$MAJOR.$MINOR.$PATCH',
                        inputVersion: '1.0.0',
                        inc: 'patch',
                        '$MAJOR': 1,
                        '$MINOR': 0,
                        '$PATCH': 0,
                    },
            }
        } else {
            versionInfo = {
                ...getTemplatableVersion({
                    version,
                    template: zDraftRelease.templateVersion,
                    inputVersion: version.version,
                    versionKeyIncrement: resolveVersionKeyIncrement(zDraftRelease, pullsContent),
                }),
            }
        }

        let body = zDraftRelease.templateContent
        let releaseName
        let tagName
        if (versionInfo) {
            releaseName = template(zDraftRelease.templateName, versionInfo)
            tagName = template(zDraftRelease.templateTag, versionInfo)
        }

        const [
            uncategorizedPullRequests,
            categorizedPullRequests,
        ] = categorizePullRequests(pullsContent, zDraftRelease)

        const changeLog = []

        categorizedPullRequests.map((category, index) => {
            if (category.pullRequests.length) {
                changeLog.push(`### - ${category.title}\n\n`)

                changeLog.push(pullRequestToString(category.pullRequests, zDraftRelease))

                if (index + 1 !== categorizedPullRequests.length) changeLog.push('\n\n')
            }
        })

        if (uncategorizedPullRequests.length) {
            if (categorizedPullRequests) {
                if (categorizedPullRequests.length !== 0 && changeLog.length !== 0) {
                    changeLog.push('\n\n')
                    changeLog.push(`### - Others\n\n`)
                }
            }
            changeLog.push(pullRequestToString(uncategorizedPullRequests, zDraftRelease))
        }

        body = template(body, {
            $CHANGES: changeLog.join('').trim(),
        })

        if (!draftRelease) {
            zGithub.repos.createRelease({
                owner: zRepoOwner,
                repo: zRepoName,
                name: releaseName,
                tag_name: tagName,
                body: body,
                draft: true,
                prerelease: false,
            })
        } else {
            zGithub.repos.updateRelease({
                owner: zRepoOwner,
                repo: zRepoName,
                name: releaseName,
                tag_name: tagName,
                body: body,
                draft: true,
                prerelease: false,
                release_id: draftRelease.id,
            })
        }

    }

}

module.exports = DraftRelease
