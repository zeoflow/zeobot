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

const regexEscape = require('escape-string-regexp')
const compareVersions = require('compare-versions')
const semver = require('../../libs/version-patcher')

const toObject = (pairs) => {
    return Array.from(pairs).reduce(
        (acc, [key, value]) => Object.assign(acc, {[key]: value}),
        {},
    )
}

const flat = ({depth = 1, object}) => {
    return object.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten)
    }, [])
}

const resolveVersionKeyIncrement = (zDraftRelease, mergedPullRequests) => {
    const priorityMap = {
        patch: 1,
        minor: 2,
        major: 3,
    }
    const oObjectKeys = Object.keys(priorityMap)
    const oFlatMap = oObjectKeys.map(x => [zDraftRelease.versionResolver[x].labels.map(label => [label, x])])
        .reduce((x, y) => x.concat(y), [])
    const oFlat = flat({object: oFlatMap, depth: 1})
    const labelToKeyMap = toObject(oFlat)
    const keys = mergedPullRequests
        .filter(getFilterExcludedPullRequests(zDraftRelease.labelsToExclude))
        .filter(getFilterIncludedPullRequests(zDraftRelease.labelsToInclude))
        .map(pr => pr.labels.map((node) => labelToKeyMap[node.name])).reduce((x, y) => x.concat(y), [])
        .filter(Boolean)
    const keyPriorities = keys.map((key) => priorityMap[key])
    const priority = Math.max(...keyPriorities)
    const versionKey = Object.keys(priorityMap).find(
        (key) => priorityMap[key] === priority
    )
    return versionKey || zDraftRelease.versionResolverDefault
}

const categorizePullRequests = (pullRequests, zDraftRelease) => {
    const allCategoryLabels = zDraftRelease.categories.flatMap((category) => category.labels)
    const uncategorizedPullRequests = []
    const categorizedPullRequests = [...zDraftRelease.categories].map((category) => {
        return {...category, pullRequests: []}
    })
    const filterUncategorizedPullRequests = (pullRequest) => {
        const labels = pullRequest.labels

        if (
            labels.length === 0 ||
            !labels.some((label) => allCategoryLabels.includes(label.name))
        ) {
            uncategorizedPullRequests.push(pullRequest)
            return false
        }
        return true
    }

    // we only want pull requests that have yet to be categorized
    const filteredPullRequests = pullRequests
        .filter(getFilterExcludedPullRequests(zDraftRelease.labelsToExclude))
        .filter(getFilterIncludedPullRequests(zDraftRelease.labelsToInclude))
        .filter(filterUncategorizedPullRequests)

    categorizedPullRequests.map((category) => {
        filteredPullRequests.map((pullRequest) => {
            const labels = pullRequest.labels
            if (labels.some((label) => category.labels.includes(label.name))) {
                category.pullRequests.push(pullRequest)
            }
        })
    })

    return [uncategorizedPullRequests, categorizedPullRequests]
}

const getFilterExcludedPullRequests = (excludeLabels) => {
    return (pullRequest) => {
        const labels = pullRequest.labels
        return !labels.some((label) => excludeLabels.includes(label.name))
    }
}

const getFilterIncludedPullRequests = (includeLabels) => {
    return (pullRequest) => {
        const labels = pullRequest.labels
        return !!(includeLabels.length === 0 ||
            labels.some((label) => includeLabels.includes(label.name)))
    }
}

const template = (string, obj, customReplacers) => {
    let str = string.replace(/(\$[A-Z_]+)/g, (_, k) => {
        let result
        if (k === '$AUTHORS') {
            if (/@\$AUTHORS/.test(string)) {
                let contributors = []
                obj[k].forEach(contributor => {
                    contributors.push('@' + contributor)
                })
                contributors[0] = contributors[0].replace('@', '')
                result = `${contributorsString(contributors)}`
            } else {
                result = `${contributorsString(obj[k])}`
            }
        } else if (obj[k] === undefined || obj[k] === null) {
            result = k
        } else if (typeof obj[k] === 'object') {
            result = template(obj[k].template, obj[k])
        } else {
            result = `${obj[k]}`
        }
        return result
    })
    if (customReplacers) {
        customReplacers.forEach(({search, replace}) => {
            str = str.replace(search, replace)
        })
    }
    return str
}

const sortReleases = (releases) => {
    // For semver, we find the greatest release number
    // For non-semver, we use the most recently merged
    try {
        return releases.sort((r1, r2) => compareVersions(r1.tag_name, r2.tag_name))
    } catch (error) {
        return releases.sort(
            (r1, r2) => new Date(r1.created_at) - new Date(r2.created_at),
        )
    }
}

const SORT_BY = {
    mergedAt: 'merged_at',
    title: 'title',
}

const SORT_DIRECTIONS = {
    ascending: 'ascending',
    descending: 'descending',
}

const coerceVersion = (input) => {
    if (!input) {
        return null
    }

    return typeof input === 'object'
        ? semver.coerce(input.tag_name) || semver.coerce(input.name)
        : semver.coerce(input)
}

const splitSemVer = (input, versionKey = 'version') => {
    if (!input[versionKey]) {
        return null
    }

    const version = input.inc
        ? semver.inc(input[versionKey], input.inc, true)
        : semver.parse(input[versionKey])

    return {
        ...input,
        version,
        $MAJOR: semver.major(version),
        $MINOR: semver.minor(version),
        $PATCH: semver.patch(version),
    }
}

const getTemplatableVersion = (input) => {
    const templatableVersion = {
        $NEXT_MAJOR_VERSION: splitSemVer({...input, inc: 'major'}),
        $NEXT_MINOR_VERSION: splitSemVer({...input, inc: 'minor'}),
        $NEXT_PATCH_VERSION: splitSemVer({...input, inc: 'patch'}),
        $INPUT_VERSION: splitSemVer(input, 'inputVersion'),
        $RESOLVED_VERSION: splitSemVer({
            ...input,
            inc: input.versionKeyIncrement || 'patch',
        }),
    }

    templatableVersion.$RESOLVED_VERSION =
        templatableVersion.$RESOLVED_VERSION || templatableVersion.$INPUT_VERSION

    return templatableVersion
}

const escapeTitle = (title, zDraftRelease) =>
    // If config['change-title-escapes'] contains backticks, then they will be escaped along with content contained inside backticks
    // If not, the entire backtick block is matched so that it will become a markdown code block without escaping any of its content
    title.replace(
        new RegExp(
            `[${regexEscape(zDraftRelease.changeContent)}]|\`.*?\``,
            'g',
        ),
        (match) => {
            if (match.length > 1) return match
            if (match === '@' || match === '#') return `${match}<!---->`
            return `\\${match}`
        },
    )

function contributorsString(sortedContributors) {
    if (sortedContributors.length > 1) {
        return (
            sortedContributors.slice(0, sortedContributors.length - 1).join(', ') +
            ' and ' +
            sortedContributors.slice(-1)
        )
    } else {
        return sortedContributors[0]
    }
}

function pullRequestToString(pullRequests, zDraftRelease) {
    let content = []
    pullRequests.forEach(pullRequest => {
        content.push(template(zDraftRelease.changeTemplate, {
            $TITLE: escapeTitle(pullRequest.title, zDraftRelease),
            $NUMBER: pullRequest.number,
            $AUTHORS: pullRequest.contributors,// ? pullRequest.author.login : 'ghost',
            $BODY: pullRequest.body,
            $URL: pullRequest.url,
        }))
    })
    return content.join('\n')
}

async function findReleases({zContextParsed}) {
    const {
        zGithub,
        zRepoOwner,
        zRepoName,
    } = zContextParsed

    let releases = await zGithub.paginate(
        zGithub.repos.listReleases.endpoint.merge({
            owner: zRepoOwner,
            repo: zRepoName,
            per_page: 100,
        }),
    )

    const sortedPublishedReleases = sortReleases(releases.filter((r) => !r.draft))
    let draftRelease = releases.find((r) => r.draft)
    let lastRelease = sortedPublishedReleases[sortedPublishedReleases.length - 1]

    if (draftRelease !== undefined) {
        draftRelease = {
            tag_name: draftRelease.tag_name,
            target_commitish: draftRelease.target_commitish,
            name: draftRelease.name,
            body: draftRelease.body,
            draft: draftRelease.draft,
            prerelease: draftRelease.prerelease,
            created_at: draftRelease.created_at,
            published_at: draftRelease.published_at,
            author: draftRelease.author.login,
            id: draftRelease.id,
        }
    }
    if (lastRelease !== undefined) {
        lastRelease = {
            tag_name: lastRelease.tag_name,
            target_commitish: lastRelease.target_commitish,
            name: lastRelease.name,
            body: lastRelease.body,
            draft: lastRelease.draft,
            prerelease: lastRelease.prerelease,
            created_at: lastRelease.created_at,
            published_at: lastRelease.published_at,
            author: lastRelease.author.login,
        }
    }

    return {draftRelease, lastRelease}
}

function sortPullRequests(pullRequests, sortBy, sortDirection) {
    const getSortFieldFn = sortBy === SORT_BY.title ? getTitle : getMergedAt

    const sortFn =
        sortDirection === SORT_DIRECTIONS.ascending
            ? dateSortAscending
            : dateSortDescending

    return pullRequests
        .slice()
        .sort((a, b) => sortFn(getSortFieldFn(a), getSortFieldFn(b)))
        .filter(pullRequest => pullRequest.merged_at !== null)
}

function getMergedAt(pullRequest) {
    return new Date(pullRequest.merged_at)
}

function getTitle(pullRequest) {
    return pullRequest.title
}

function dateSortAscending(date1, date2) {
    if (date1 > date2) return 1
    if (date1 < date2) return -1
    return 0
}

function dateSortDescending(date1, date2) {
    if (date1 > date2) return -1
    if (date1 < date2) return 1
    return 0
}

module.exports = {
    findReleases,
    sortPullRequests,
    getTemplatableVersion,
    resolveVersionKeyIncrement,
    template,
    categorizePullRequests,
    pullRequestToString,
    coerceVersion,
}