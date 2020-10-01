const zPayloadParser = async (payload) => {

    if (payload === undefined) {
        return
    }

    const {
        action,
        number,
        ref,
        head_commit,
    } = payload

    return module.exports = {
        action,
        number,
        ref,
        head_commit,
    }

}

module.exports = {
    zPayloadParser,
}