const {zConfigFileParser} = require('./config-file')
const {zContextParser} = require('./context')

const initialiseContext = async ({zContext}) => {

    const zContextParsed = await zContextParser(zContext)
    const {
        zActionName,
    } = zContextParsed
    let zConfigFile = null
    if(zActionName !== 'installation_repositories' && zActionName !== 'installation') {
        zConfigFile = await zConfigFileParser({zContextParsed: zContextParsed})
    }

    return module.exports = {
        zContextParsed,
        zConfigFile,
    }

}

module.exports = {
    initialiseContext,
}