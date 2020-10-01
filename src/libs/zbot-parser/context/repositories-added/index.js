const zRepositoriesAddedParser = async (repositories_added) => {

    if (repositories_added === undefined) {
        return
    }

    return module.exports = {
        repositoriesAddedData: repositories_added,
    }

}

module.exports = {
    zRepositoriesAddedParser,
}