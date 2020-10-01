const {zCheckRunParser} = require('./check-run')
const {pullsGetDetails} = require('../../github-api/pulls/pullsGetDetails')
const {zRepositoriesParser} = require('./repositories')
const {
    zRepositoriesRemovedParser,
} = require('./repositories-removed')
const {
    zRepositoriesAddedParser,
} = require('./repositories-added')
const {
    zRepositoriesSelectionParser,
} = require('./repository-selection')
const {
    zInstallationParser,
} = require('./installation')
const {
    zPullRequestParser,
} = require('./pull-request')
const {
    zSenderParser,
} = require('./sender')
const {
    zRepositoryParser,
} = require('./repository')
const {
    zIssueParser,
} = require('./issue')
const {
    zCommentParser,
} = require('./issue-comment')
const {
    zPayloadParser,
} = require('./payload')

const zContextParser = async (context) => {

    let zContext = context
    let zEvent = context.event
    let zGithub = context.github
    let zLog = await context.log
    let zPayload = await zPayloadParser(context.payload)
    let zComment = await zCommentParser(context.payload.comment)
    let zCheckRun = await zCheckRunParser(context.payload.check_run)
    let zIssue = await zIssueParser(context.payload.issue)
    let zRepository = await zRepositoryParser(context.payload.repository)
    let zSender = await zSenderParser(context.payload.sender)
    let zPullRequest = await zPullRequestParser(context.payload.pull_request)
    let zInstallation = await zInstallationParser(context.payload.installation)
    let zRepositories = await zRepositoriesParser(context.payload.repositories)
    let zRepositoriesSelection = await zRepositoriesSelectionParser(context.payload.repository_selection)
    let zRepositoriesAdded = await zRepositoriesAddedParser(context.payload.repositories_added)
    let zRepositoriesRemoved = await zRepositoriesRemovedParser(context.payload.repositories_removed)

    let zIsBot = zSender.senderType === 'Bot'

    let zRepoOwner = zRepository ? zRepository.repositoryOwner.login : null
    let zRepoName = zRepository ? zRepository.repositoryName : null

    let zNumber = (zIssue || zPullRequest || zPayload).number
    let zRequestAction = context.payload.requested_action

    let zIsPullRequest = false
    if (zIssue !== undefined) {
        zIsPullRequest = zIssue.pullRequest !== undefined
    }
    if (zPullRequest !== undefined) {
        zIsPullRequest = true
    } else {
        zPullRequest = await pullsGetDetails(zGithub, {
            owner: zRepoOwner,
            repo: zRepoName,
            pull_number: zNumber,
        })
    }

    let zRef = ''
    if (zPullRequest) {
        zRef = zPullRequest.head.ref
    } else if (zContext.payload.ref) {
        zRef = zContext.payload.ref
    }

    let zActionName = zContext.name
    let zActionType = zContext.payload.action

    return module.exports = {
        zContext,
        zEvent,
        zGithub,
        zLog,
        zPayload,
        zCheckRun,
        zComment,
        zIssue,
        zRepository,
        zSender,
        zPullRequest,
        zInstallation,
        zRepositories,
        zRepositoriesSelection,
        zRepositoriesAdded,
        zRepositoriesRemoved,
        zRequestAction,

        zIsBot,
        zIsPullRequest,

        zNumber,
        zRef,

        zRepoOwner,
        zRepoName,

        zActionName,
        zActionType,
    }

}

module.exports = {
    zContextParser,
}