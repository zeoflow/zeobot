const yaml = require('js-yaml')
const lodash = require('lodash')
const Joi = require('@hapi/joi')

const schema = () => {

    return Joi.object()
        .keys({
            zeobot: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    commands: Joi.object()
                        .keys({
                            enabled: Joi.boolean().default(true),
                            listen_to: Joi.object()
                                .keys({
                                    users: Joi.array().items(Joi.string()).empty(null).default([]),
                                }),
                        }),
                    features: Joi.object()
                        .keys({
                            can_comment: Joi.boolean().default(true),
                        }),
                })
                .default({
                    enabled: true,
                    commands: {
                        enabled: true,
                        listen_to: {
                            users: [],
                        },
                    },
                    features: {
                        can_comment: true,
                    },
                }),
            auto_assign: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    use_review_groups: Joi.boolean().default(false),
                    use_assignee_groups: Joi.boolean().default(false),
                    add_reviewers: Joi.boolean().default(false),
                    add_assignees: Joi.boolean().default(false),
                    number_of_assignees: Joi.number().default(0),
                    number_of_reviewers: Joi.number().default(0),
                    review_groups: Joi.array().items(Joi.string()).empty(null).default([]),
                    assignee_groups: Joi.array().items(Joi.string()).empty(null).default([]),
                    reviewers_to_add: Joi.array().items(Joi.string()).empty(null).default([]),
                    assignees_to_add: Joi.array().items(Joi.string()).empty(null).default([]),
                    skip_keywords: Joi.array().items(Joi.string()).empty(null).default([]),
                })
                .default({
                    enabled: true,
                    use_review_groups: false,
                    use_assignee_groups: false,
                    add_reviewers: false,
                    add_assignees: false,
                    number_of_assignees: 0,
                    number_of_reviewers: 0,
                    review_groups: [],
                    assignee_groups: [],
                    reviewers_to_add: [],
                    assignees_to_add: [],
                    skip_keywords: [],
                }),
            autodelete_merged_branches: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    branches_to_exclude: Joi.array().items(Joi.string()).empty(null).default([]),
                })
                .default({
                    enabled: true,
                    branches_to_exclude: [],
                }),
            branch_in_progress: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                })
                .default({
                    enabled: true,
                }),
            contributors_commits_signed: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    require_for: Joi.object()
                        .keys({
                            members: Joi.boolean().default(false),
                        }),
                })
                .default({
                    enabled: true,
                    require_for: {
                        members: false,
                    },
                }),
            enforce_branch_merge: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    branches_to_enforce: Joi.array().items(Joi.string()).empty(null).default([]),
                    give_access_to: Joi.array().items(Joi.string()).empty(null).default([]),
                })
                .default({
                    enabled: true,
                    branches_to_enforce: [],
                    give_access_to: [],
                }),
            license_checker: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    allowed: Joi.object()
                        .keys({
                            copyright_holders: Joi.array().items(Joi.string()).empty(null).default([]),
                            licenses: Joi.array().items(Joi.string()).empty(null).default([]),
                        }),
                    to_check: Joi.object()
                        .keys({
                            extensions: Joi.array().items(Joi.string()).empty(null).default([]),
                        }),
                    to_ignore: Joi.object()
                        .keys({
                            files_path: Joi.array().items(Joi.string()).empty(null).default([]),
                        }),
                })
                .default({
                    enabled: true,
                    allowed: {
                        copyright_holders: [],
                        licenses: [],
                    },
                    to_check: {
                        extensions: [],
                    },
                    to_ignore: {
                        files_path: [],
                    },
                }),
            draft_release: Joi.object()
                .keys({
                    enabled: Joi.boolean().default(true),
                    template: Joi.object()
                        .keys({
                            name: Joi.string(),
                            tag: Joi.string(),
                            version: Joi.string(),
                            content: Joi.string(),
                        }),
                    change: Joi.object()
                        .keys({
                            template: Joi.string(),
                            title_escapes: Joi.string(),
                        }),
                    labels_to: Joi.object()
                        .keys({
                            exclude: Joi.array().items(Joi.string()).empty(null).default([]),
                            include: Joi.array().items(Joi.string()).empty(null).default([]),
                        }),
                    version_resolver: Joi.object()
                        .keys({
                            major: Joi.object({
                                labels: Joi.array().items(Joi.string()).empty(null).default([]),
                            }),
                            minor: Joi.object({
                                labels: Joi.array().items(Joi.string()).empty(null).default([]),
                            }),
                            patch: Joi.object({
                                labels: Joi.array().items(Joi.string()).empty(null).default([]),
                            }),
                            default: Joi.string()
                                .valid('major', 'minor', 'patch')
                                .default('patch'),
                        }),
                    categories: Joi.array()
                        .items(
                            Joi.object()
                                .keys({
                                    title: Joi.string(),
                                    label: Joi.string(),
                                    labels: Joi.array().single().default([]),
                                })
                                .rename('label', 'labels', {
                                    ignoreUndefined: true,
                                    override: true,
                                }),
                        ),
                    sort: Joi.object()
                        .keys({
                            pull_requests: Joi.object()
                                .keys({
                                    by: Joi.string(),
                                    direction: Joi.string(),
                                }),
                        }),
                })
                .default({
                    enabled: true,
                    template: {
                        name: 'v$RESOLVED_VERSION',
                        tag: 'v$RESOLVED_VERSION',
                        version: '$MAJOR.$MINOR.$PATCH',
                        content: '## Changes\n\n$CHANGES',
                    },
                    change: {
                        template: '- $TITLE (#$NUMBER) by @$AUTHORS',
                        title_escapes: '\<*_&',
                    },
                    labels_to: {
                        exclude: [],
                        include: [],
                    },
                    version_resolver: {
                        major: {
                            labels: [],
                        },
                        minor: {
                            labels: [],
                        },
                        patch: {
                            labels: [],
                        },
                        default: 'patch',
                    },
                    categories: [],
                    sort: {
                        pull_requests: {
                            by: 'merged_at',
                            direction: 'descending',
                        },
                    },
                }),
        })
}

const parseZeobot = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let zeobotConfigParsed = config.zeobot

    return module.exports = {
        enabled: zeobotConfigParsed.enabled,
        canComment: zeobotConfigParsed.features.can_comment,
        commandsEnabled: zeobotConfigParsed.commands.enabled,
        listenToUsers: zeobotConfigParsed.commands.listen_to.users,
    }

}

const parseAutoAssign = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let aaConfigParsed = config.auto_assign

    return module.exports = {
        enabled: aaConfigParsed.enabled,
        useReviewGroups: aaConfigParsed.use_review_groups,
        useAssigneeGroups: aaConfigParsed.use_assignee_groups,
        addReviewers: aaConfigParsed.add_reviewers,
        addAssignees: aaConfigParsed.add_assignees,
        numberOfAssignees: aaConfigParsed.number_of_assignees,
        numberOfReviewers: aaConfigParsed.number_of_reviewers,
        reviewGroups: aaConfigParsed.review_groups,
        assigneeGroups: aaConfigParsed.assignee_groups,
        skipKeywords: aaConfigParsed.skip_keywords,
        reviewersToAdd: aaConfigParsed.reviewers_to_add,
        assigneesToAdd: aaConfigParsed.assignees_to_add,
    }

}

const parseAutodeleteMergedBranches = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let ambConfigParsed = config.autodelete_merged_branches

    return module.exports = {
        enabled: ambConfigParsed.enabled,
        branchesToExclude: ambConfigParsed.branches_to_exclude,
    }

}

const parseBranchInProgress = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let bipConfigParsed = config.branch_in_progress

    return module.exports = {
        enabled: bipConfigParsed.enabled,
    }

}

const parseContributorsCommitsSigned = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let ccsConfigParsed = config.contributors_commits_signed

    return module.exports = {
        enabled: ccsConfigParsed.enabled,
        isRequiredForMembers: ccsConfigParsed.require_for.members,
    }

}

const parseEnforceBranchMerge = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let ebmConfigParsed = config.enforce_branch_merge

    return module.exports = {
        enabled: ebmConfigParsed.enabled,
        branchesToEnforce: ebmConfigParsed.branches_to_enforce,
        giveAccessTo: ebmConfigParsed.give_access_to,
    }

}

const parseLicenseChecker = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let lcConfigParsed = config.license_checker

    return module.exports = {
        enabled: lcConfigParsed.enabled,
        allowedCopyrightHolders: lcConfigParsed.allowed.copyright_holders,
        allowedLicenses: lcConfigParsed.allowed.licenses,
        toCheckExtensions: lcConfigParsed.to_check.extensions,
        toIgnoreFiles: lcConfigParsed.to_ignore.files_path,
    }

}

const parseDraftRelease = async (zContent) => {

    const {value: config} = schema().validate(zContent, {
        abortEarly: false,
        allowUnknown: true,
    })
    let drConfigParsed = config.draft_release

    const version_resolver = drConfigParsed.version_resolver
    Object.keys(version_resolver).forEach(version => {
        version_resolver[version].labels = version_resolver[version].labels || []
    })

    return module.exports = {
        enabled: drConfigParsed.enabled,
        templateName: drConfigParsed.template.name,
        templateTag: drConfigParsed.template.tag,
        templateVersion: drConfigParsed.template.version,
        templateContent: drConfigParsed.template.content,
        changeTemplate: drConfigParsed.change.template,
        changeContent: drConfigParsed.change.title_escapes,
        labelsToExclude: drConfigParsed.labels_to.exclude || [],
        labelsToInclude: drConfigParsed.labels_to.include || [],
        versionResolverMajor: drConfigParsed.version_resolver.major.labels || [],
        versionResolverMinor: drConfigParsed.version_resolver.minor.labels || [],
        versionResolverPatch: drConfigParsed.version_resolver.patch.labels || [],
        versionResolver: version_resolver,
        versionResolverDefault: drConfigParsed.version_resolver.default,
        replacers: drConfigParsed.replacers,
        categories: drConfigParsed.categories || [],
        sortPullRequestsBy: drConfigParsed.sort.pull_requests.by,
        sortPullRequestsDirection: drConfigParsed.sort.pull_requests.direction,
    }

}

const getConfigFile = async (zGithub, {
    owner,
    repo,
    path,
    ref,
}) => {
    try {
        const file = await zGithub.repos.getContents({
            owner,
            repo,
            path,
            ref,
        })
        const contentBinary = file.data.content
        const content = yaml.safeLoad(Buffer.from(contentBinary, 'base64').toString())
        return {
            content,
            sha: file.data.sha,
        }
    } catch (error) {
        return {
            content: null,
        }
    }

}

const zConfigFileParser = async ({zContextParsed}) => {

    const {
        zRepository,
        zGithub,
    } = zContextParsed

    const mConfigFile = await getConfigFile(zGithub, {
        path: '.zeobot/config.yml',
        owner: zRepository.repositoryOwnerUsername,
        repo: zRepository.repositoryName,
        ref: zRepository.repositoryDefaultBranch,
    })
    let {
        content: zContent,
        sha: zConfigSha,
    } = mConfigFile

    if (!zContent) {
        zContent = {
            zeobot: undefined,
            auto_assign: undefined,
            autodelete_merged_branches: undefined,
            branch_in_progress: undefined,
            contributors_commits_signed: undefined,
            enforce_branch_merge: undefined,
            license_checker: undefined,
            draft_release: undefined,
        }
    }
    let zZeobot = await parseZeobot(zContent)

    let zAutoAssign = await parseAutoAssign(zContent)
    let zAutodeleteMergedBranches = await parseAutodeleteMergedBranches(zContent)
    let zBranchInProgress = await parseBranchInProgress(zContent)
    let zContributorsCommitsSigned = await parseContributorsCommitsSigned(zContent)
    let zEnforceBranchMerge = await parseEnforceBranchMerge(zContent)
    let zLicenseChecker = await parseLicenseChecker(zContent)
    let zDraftRelease = await parseDraftRelease(zContent)

    return module.exports = {
        zContent,
        zConfigSha,

        zZeobot,

        zAutoAssign,
        zAutodeleteMergedBranches,
        zBranchInProgress,
        zContributorsCommitsSigned,
        zEnforceBranchMerge,
        zLicenseChecker,
        zDraftRelease,
    }

}

module.exports = {
    zConfigFileParser,
}
