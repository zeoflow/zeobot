const zRepositoriesSelectionParser = async (repository_selection) => {

    if (repository_selection === undefined) {
        return
    }

    return module.exports = {
        repositoriesSelectionData: repository_selection,
    }

}

module.exports = {
    zRepositoriesSelectionParser,
}