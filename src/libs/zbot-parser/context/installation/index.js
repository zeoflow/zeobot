const zInstallationParser = async (installation) => {

    if (installation === undefined) {
        return
    }

    const {
        id: installationID,
        account: installationAccount,
        repository_selection: installationRepositorySelection,
        access_tokens_url: installationAccessTokensURl,
        repositories_url: installationRepositoriesURL,
        html_url: installationHtmlURL,
        app_id: installationAppID,
        target_id: installationTargetID,
        target_type: installationTargetType,
        permissions: installationPermissions,
        events: installationEvents,
        created_at: installationCreatedAt,
        updated_at: installationUpdatedAt,
        single_file_name: installationSingleFileName,
    } = installation

    return module.exports = {
        installationID,
        installationAccount,
        installationRepositorySelection,
        installationAccessTokensURl,
        installationRepositoriesURL,
        installationHtmlURL,
        installationAppID,
        installationTargetID,
        installationTargetType,
        installationPermissions,
        installationEvents,
        installationCreatedAt,
        installationUpdatedAt,
        installationSingleFileName,
    }

}

module.exports = {
    zInstallationParser,
}