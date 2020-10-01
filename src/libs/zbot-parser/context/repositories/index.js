const zRepositoriesParser = async (repositories) => {

    if (repositories === undefined) {
        return
    }

    return module.exports = {
        repositoriesData: repositories,
    }

}

module.exports = {
    zRepositoriesParser,
}