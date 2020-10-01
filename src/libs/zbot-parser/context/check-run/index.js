const zCheckRunParser = async (check_run) => {

    if (check_run === undefined) {
        return
    }

    const {
        id,
        head_sha: headSha,
        external_id: externalID,
        url,
        html_url: htmlUrl,
        status,
        conclusion,
        started_at: startedAt,
        completed_at: completedAt,
        output,
        name,
        check_suite: checkSuite,
        app,
        pull_requests: pullRequests,
    } = check_run

    const outputObj = {
        title: output.title,
        summary: output.summary,
        text: output.text,
        annotations_count: output.annotations_count,
        annotations_url: output.annotations_url,
    }

    const checkSuiteObj = {
        id: checkSuite.id,
        head_branch: checkSuite.head_branch,
        head_sha: checkSuite.head_sha,
        status: checkSuite.status,
        conclusion: checkSuite.conclusion,
        url: checkSuite.url,
        before: checkSuite.before,
        after: checkSuite.after,
        pull_requests: checkSuite.pull_requests,
        app: checkSuite.app,
        created_at: checkSuite.created_at,
        updated_at: checkSuite.updated_at,
    }

    return module.exports = {
        id,
        headSha,
        externalID,
        url,
        htmlUrl,
        status,
        conclusion,
        startedAt,
        completedAt,
        output: outputObj,
        name,
        checkSuite: checkSuiteObj,
        app,
        pullRequests,
    }

}

module.exports = {
    zCheckRunParser,
}