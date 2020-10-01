const parseRepositoryOwner = async (mRepository) => {

    if (mRepository === null || mRepository === undefined)
        return
    if (mRepository.owner === null || mRepository.owner === undefined)
        return

    const {
        login,
        avatar_url,
        type,
    } = mRepository.owner

    return module.exports = {
        authorUsername: login,
        authorAvatar: avatar_url,
        authorType: type,
    }

}

const parseRepository = async (mPayload) => {

    if (mPayload === null || mPayload === undefined)
        return
    if (mPayload.repository === null || mPayload.repository === undefined)
        return

    const {
        id,
        name,
        full_name,
        owner,
        description,
        created_at,
        updated_at,
        pushed_at,
        homepage,
        size,
        stargazers_count,
        watchers_count,
        language,
        license,
        watchers,
        default_branch,
    } = mPayload.repository

    return module.exports = {
        ID: id,
        name: name,
        fullName: full_name,
        owner: owner,
        description: description,
        createdAt: created_at,
        updatedAt: updated_at,
        pushedAt: pushed_at,
        homepage: homepage,
        size: size,
        stargazersCount: stargazers_count,
        watchersCount: watchers_count,
        language: language,
        license: license,
        watchers: watchers,
        defaultBranch: default_branch,
    }

}

const parseSender = async (mPayload) => {

    if (mPayload === null || mPayload === undefined)
        return
    if (mPayload.sender === null || mPayload.sender === undefined)
        return

    const {
        login,
        avatar_url,
        type,
    } = mPayload.sender

    return module.exports = {
        username: login,
        avatar: avatar_url,
        type: type,
    }

}

const parseIssueAuthor = async (mIssue) => {

    if (mIssue === null || mIssue === undefined)
        return
    if (mIssue.author === null || mIssue.author === undefined)
        return

    const {
        login,
        avatar_url,
        type,
    } = mIssue.author

    return module.exports = {
        authorUsername: login,
        authorAvatar: avatar_url,
        authorType: type,
    }

}

const parseIssue = async (mPayload) => {

    if (mPayload === null || mPayload === undefined)
        return
    if (mPayload.issue === null || mPayload.issue === undefined)
        return

    const {
        id,
        number,
        title,
        user,
        labels,
        state,
        locked,
        assignee,
        assignees,
        created_at,
        updated_at,
        closed_at,
        pull_request,
    } = mPayload.issue

    return module.exports = {
        ID: id,
        number: number,
        title: title,
        author: user,
        labels: labels,
        state: state,
        locked: locked,
        assignee: assignee,
        assignees: assignees,
        createdAt: created_at,
        updatedAt: updated_at,
        closedAt: closed_at,
        pullRequest: pull_request,
    }

}

const parseInstallationAuthor = async (mInstallation) => {

    if (mInstallation === null || mInstallation === undefined)
        return
    if (mInstallation.author === null || mInstallation.author === undefined)
        return

    const {
        login,
        avatar_url,
        type,
    } = mInstallation.author

    return module.exports = {
        authorUsername: login,
        authorAvatar: avatar_url,
        authorType: type,
    }

}

const parseInstallation = async (mPayload) => {

    if (mPayload === null || mPayload === undefined)
        return
    if (mPayload.installation === null || mPayload.installation === undefined)
        return

    const {
        id,
        account,
        repository_selection,
        app_id,
        app_slug,
        target_id,
        target_type,
    } = mPayload.installation

    return module.exports = {
        ID: id,
        author: account,
        reposSelection: repository_selection,
        appID: app_id,
        appSlug: app_slug,
        targetID: target_id,
        targetType: target_type,
    }

}

const parseCommentAuthor = async (mComment) => {

    if (mComment === null || mComment === undefined)
        return
    if (mComment.author === null || mComment.author === undefined)
        return

    const {
        login,
        avatar_url,
        type,
    } = mComment.author

    return module.exports = {
        authorUsername: login,
        authorAvatar: avatar_url,
        authorType: type,
    }

}

const parseComment = async (mPayload) => {

    if (mPayload === null || mPayload === undefined)
        return
    if (mPayload.comment === null || mPayload.comment === undefined)
        return

    const {
        user,
        created_at,
        updated_at,
        body,
    } = mPayload.comment

    return module.exports = {
        author: user,
        createdAt: created_at,
        updatedAt: updated_at,
        content: body,
    }

}

const parsePayload = async (mContext) => {

    if (mContext === null || mContext === undefined)
        return
    if (mContext.payload === null || mContext.payload === undefined)
        return
    const {
        action,
        comment,
        installation,
        issue,
        sender,
        repository,
        repository_selection,
        repositories,
        repositories_added,
        repositories_removed,
    } = mContext.payload

    return module.exports = {
        action: action,
        comment: comment,
        installation: installation,
        issue: issue,
        sender: sender,
        repository: repository,
        repositorySelection: repository_selection,
        repositories: repositories,
        repositoriesAdded: repositories_added,
        repositoriesRemoved: repositories_removed,
    }

}

const parseContext = async ({context}) => {

    let mContext = context
    let mEvent = mContext.event
    let mGithub = mContext.github
    let mLog = mContext.log
    let mPayload = await parsePayload(mContext)
    let mComment = await parseComment(mPayload)
    let mCommentAuthor = await parseCommentAuthor(mComment)
    let mInstallation = await parseInstallation(mPayload)
    let mInstallationAuthor = await parseInstallationAuthor(mInstallation)
    let mIssue = await parseIssue(mPayload)
    let mIssueAuthor = await parseIssueAuthor(mIssue)
    let mSender = await parseSender(mPayload)
    let mRepository = await parseRepository(mPayload)
    let mRepositoryOwner = await parseRepositoryOwner(mRepository)
    let isBot = mSender.type === 'Bot'

    return module.exports = {
        mContext,
        mEvent,
        mGithub,
        mLog,
        mPayload,
        mComment,
        mCommentAuthor,
        mInstallation,
        mInstallationAuthor,
        mIssue,
        mIssueAuthor,
        mSender,
        mRepository,
        mRepositoryOwner,
        isBot,
    }

}

module.exports = {
    parseContext,
}
