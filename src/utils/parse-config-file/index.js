const yaml = require('js-yaml')

const parseMergeBlock = async (merge_block) => {

    if (merge_block === null || merge_block === undefined)
        return

    const {
        branch,
        override_users,
    } = merge_block

    return module.exports = {
        branch: branch,
        overrideUsers: override_users,
    }

}

const getConfigFile = async (mContext, {
    owner,
    repo,
    path,
    ref,
}) => {
    try {
        const file = await mContext.github.repos.getContents({
            owner,
            repo,
            path,
            ref,
        })
        const contentBinary = file.data.content
        const content = yaml.safeLoad(Buffer.from(contentBinary, 'base64').toString())
        return {
            content,
            sha: file.data.sha,
        }
    } catch (error) {
        return {
            content: null,
        }
    }

}

const parseConfigFile = async ({mContextParsed}) => {

    const {
        mContext,
        mRepository,
        mRepositoryOwner,
    } = mContextParsed

    const mConfigFile = await getConfigFile(mContext, {
        path: '.github/zeobot.yml',
        owner: mRepositoryOwner.authorUsername,
        repo: mRepository.name,
        ref: mRepository.defaultBranch,
    })
    const {
        content: mContent,
        sha: mConfigSha,
    } = mConfigFile

    let mMergeBlock = await parseMergeBlock(mContent.merge_block)

    return module.exports = {
        mContent,
        mConfigSha,
        mMergeBlock,
    }

}

module.exports = {
    parseConfigFile,
}
