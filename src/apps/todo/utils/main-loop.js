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

const parseDiff = require('parse-diff')
const getDiff = require('./get-diff')
const getDetails = require('./get-details')
const configSchema = require('./config-schema')
const LabelsUpdater = require('../../labels-updater')

module.exports = async ({zContext, zRef}, handler) => {
    const context = zContext
    context.todos = []

    // Get the diff for this commit or PR
    const diff = await getDiff(context, zRef)
    if (!diff) return

    // Grab the config file
    const configFile = await context.config('config.yml')
    const configValue = (configFile && configFile.todo) ? configFile.todo : {}

    const {value: config, error} = configSchema.validate(configValue)
    if (error) throw error

    /**
     * @todo-zeobot(t): title
     * @todo-zeobot(b|c): content
     * @todo-zeobot(a): assignees
     * @todo-zeobot(l|f): labels
     */

        // RegEx that matches lines with the configured keywords
    const regexTitle = new RegExp('(?<tag>@todo-zeobot\\([tT]\\):)(?<content>.*)')
    const regexContent = new RegExp('(?<tag>@todo-zeobot\\([bB:cC]\\):)(?<content>.*)')
    const regexAssignees = new RegExp('(?<tag>@todo-zeobot\\([aA]\\):)(?<content>.*)')
    const regexLabels = new RegExp('(?<tag>@todo-zeobot\\([lL:fF]\\):)(?<content>.*)')


    // Parse the diff as files
    const files = parseDiff(diff)

    await Promise.all(files.map(async file => {
        // if (shouldExcludeFile(context.log, file.to, config.exclude)) return

        // Loop through every chunk in the file
        await Promise.all(file.chunks.map(async chunk => {
            // Chunks can have multiple changes
            await Promise.all(chunk.changes.map(async (change, index) => {

                // @todo Only act on added lines
                // :TODO: Also handle deleted TODO lines
                if (change.type !== 'add') return

                // Attempt to find a matching line
                const matchesTitle = regexTitle.exec(change.content)
                // Trim whitespace to ensure a clean title
                let title = matchesTitle === null ? null : matchesTitle.groups.content.trim()
                if (title === null) return

                let line = change.ln || change.ln2

                // This might have matched a minified file, or something
                // huge. GitHub wouldn't allow this anyway, so let's just ignore it.
                if (!title || title.length > 256) return

                // Get the details of this commit or PR
                const {owner, repo} = context.repo()
                const deets = getDetails({context, config, chunk, line: change.ln || change.ln2})
                const {
                    sha,
                } = deets

                let file2 = await context.github.repos.getContents({
                    owner,
                    repo,
                    path: file.to,
                    ref: zRef,
                })
                file2 = await Buffer.from(file2.data.content, 'base64').toString()
                const arrayOfLines = await file2.match(/[^\r\n]+/g)
                let shouldExit = false
                const contentReco = []
                let assigneesReco = []
                let labelsReco = ['@zeobot-todo']
                line--
                while (!shouldExit && line < arrayOfLines.length) {
                    const content2 = arrayOfLines[line]
                    const matchesContent = regexContent.exec(content2)
                    const matchesAssignees = regexAssignees.exec(content2)
                    const matchesLabels = regexLabels.exec(content2)
                    let contentC = matchesContent === null ? null : matchesContent.groups.content.trim()
                    let contentA = matchesAssignees === null ? null : matchesAssignees.groups.content.trim()
                    let contentL = matchesLabels === null ? null : matchesLabels.groups.content.trim()
                    if ((contentC === null && contentA === null && contentL === null) && !content2) {
                        shouldExit = true
                    } else {
                        if (contentC !== null) {
                            if (contentReco.length > 0 && contentReco[contentReco.length - 1] !== '\n') contentReco.push('\n')
                            contentReco.push(contentC)
                        }
                        if (contentA !== null) {
                            const pattern = /\B@[a-z0-9_-]+/gi
                            assigneesReco = assigneesReco.concat(contentA.match(pattern))
                        }
                        if (contentL !== null) {
                            const pattern = /[@{1}:a-z0-9_-]+/gi
                            labelsReco = labelsReco.concat(contentL.match(pattern))
                        }
                        line++
                    }
                }

                let labelsToAdd = []
                const zLabelsUpdater = new LabelsUpdater({zParser: null})
                let approvedLabels = []
                zLabelsUpdater.generateLabels().forEach(label => approvedLabels.push(label.name))
                labelsReco.some(label => {
                    if (approvedLabels.includes(label)) {
                        if (!labelsToAdd.includes(label)) {
                            labelsToAdd.push(label)
                        }
                    }
                })

                let assigneesToAdd = []
                assigneesReco.some(assignee => {
                    if (!assigneesToAdd.includes(assignee)) {
                        assigneesToAdd.push(assignee.replace('@', ''))
                    }
                })

                // Run the handler for this webhook listener
                return handler({
                    keyword: matchesTitle.groups.tag,
                    bodyComment: contentReco.join(''),
                    assigneesToAdd: assigneesToAdd,
                    labelsToAdd: labelsToAdd,
                    filename: file.to,
                    title,
                    config,
                    chunk,
                    index,
                    ...deets,
                })
            }))
        }))
    }))
}