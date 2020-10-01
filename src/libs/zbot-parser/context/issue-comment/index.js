const zCommentParser = async (comment) => {

    if (comment === undefined) {
        return
    }

    const {
        url: url,
        html_url: htmlURL,
        issue_url: issueURL,
        id: ID,
        node_id: nodeID,
        user: user,
        created_at: createdAt,
        updated_at: updatedAt,
        author_association: authorAssociation,
        body: body,
    } = comment

    return module.exports = {
        url,
        htmlURL,
        issueURL,
        ID,
        nodeID,
        user,
        createdAt,
        updatedAt,
        authorAssociation,
        body,
    }

}

module.exports = {
    zCommentParser,
}