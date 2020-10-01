const zRepositoriesRemovedParser = async (repositories_removed) => {

    if (repositories_removed === undefined) {
        return
    }

    return module.exports = {
        repositoriesRemovedData: repositories_removed,
    }

}

module.exports = {
    zRepositoriesRemovedParser,
}