const zIssueParser = async (issue) => {

    if (issue === undefined) {
        return
    }

    const {
        url: URL,
        labels_url: labelsURL,
        comments_url: commentsURL,
        events_url: eventsURL,
        html_url: htmlURL,
        id: ID,
        node_id: nodeID,
        number: number,
        title: title,
        user: user,
        labels: labels,
        state: state,
        locked: locked,
        assignee: assignee,
        assignees: assignees,
        milestone: milestone,
        comments: comments,
        created_at: createdAt,
        updated_at: updatedAt,
        closed_at: closedAt,
        author_association: authorAssociations,
        body: body,
        pull_request: pullRequest,
    } = issue

    return module.exports = {
        URL,
        labelsURL,
        commentsURL,
        eventsURL,
        htmlURL,
        ID,
        nodeID,
        number,
        title,
        user,
        labels,
        state,
        locked,
        assignee,
        assignees,
        milestone,
        comments,
        createdAt,
        updatedAt,
        closedAt,
        authorAssociations,
        body,
        pullRequest,
    }

}

module.exports = {
    zIssueParser,
}