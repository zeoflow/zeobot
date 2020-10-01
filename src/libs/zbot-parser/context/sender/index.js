const zSenderParser = async (sender) => {

    if (sender === undefined) {
        return
    }

    const {
        login: senderLogin,
        id: senderID,
        node_id: senderNodeID,
        avatar_url: senderAvatar,
        gravatar_id: senderGravatar,
        url: senderURl,
        html_url: senderHtmlURL,
        followers_url: senderFollowersURL,
        following_url: senderFollowingURL,
        gists_url: senderGistsURL,
        starred_url: senderStarredURL,
        subscriptions_url: senderSubscriptionsURL,
        organizations_url: senderOrganizationsURL,
        repos_url: senderReposURL,
        events_url: senderEventsURL,
        received_events_url: senderReceivedEventsURl,
        type: senderType,
        site_admin: senderSiteAdmin,
    } = sender

    return module.exports = {
        senderLogin,
        senderID,
        senderNodeID,
        senderAvatar,
        senderGravatar,
        senderURl,
        senderHtmlURL,
        senderFollowersURL,
        senderFollowingURL,
        senderGistsURL,
        senderStarredURL,
        senderSubscriptionsURL,
        senderOrganizationsURL,
        senderReposURL,
        senderEventsURL,
        senderReceivedEventsURl,
        senderType,
        senderSiteAdmin,
    }

}

module.exports = {
    zSenderParser,
}