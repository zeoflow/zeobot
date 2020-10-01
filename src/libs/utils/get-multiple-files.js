/**
 * Copyright 2020 ZeoFlow SRL
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {getFile} = require('./get-file')
const getMultipleFiles = async (zParser, {filePathsArray}) => {
    const {zContextParsed} = zParser
    const {zRepository} = zContextParsed
    const getFilesMultiple = filePathsArray.map(filePath => {
        return getFile(zParser, {
            zFilePath: filePath,
            zBranch: zRepository.repositoryDefaultBranch,
        }).then(({content, sha}) => ({
            filePath,
            content,
            sha,
        }))
    })

    const getFilesMultipleList = await Promise.all(getFilesMultiple)
    const multipleFilesByPath = {}
    getFilesMultipleList.forEach(({filePath, content, sha}) => {
        content = !content ? '' : content
        multipleFilesByPath[filePath] = {
            content,
            originalSha: sha,
        }
    })

    return multipleFilesByPath
}

module.exports = {
    getMultipleFiles,
}