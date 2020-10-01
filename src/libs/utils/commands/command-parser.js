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

const nlp = require('compromise')
const {contributionTypeMappings} = require('../../../apps/add-contributor/utils/default-types')
const {contributionTypeMultiWordMapping} = require('../../../apps/add-contributor/utils/default-types')
const {Contributions} = require('../../../apps/add-contributor/utils/default-types')
const {commands_list} = require('./commands-list')

const isValidCommand = (message) => {

    let BotCommands = {}
    Object.keys(commands_list).forEach(command => {
        BotCommands[command] = '#BotCommands'
    })
    const plugin = {
        words: {
            ...BotCommands,
        },
    }
    nlp.plugin(plugin)

    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands')
        .text('method')
        .trim()

    return botCommand !== ''

}

const isActionCommand = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.AddContributor.Action')
        .text('method')
        .trim()

    const action = doc
        .toLowerCase()
        .match('#BotCommands.AddContributor.Action')
        .normalize()
        .out('string')

    return {
        isCommand: botCommand !== '',
        action,
    }

}

const contributionParser = (message) => {

    const plugin = {
        words: {
            ...Contributions,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
    // This is to support multi word 'matches' (altho the compromise docs say it supports this *confused*)
    Object.entries(contributionTypeMultiWordMapping).forEach(
        ([multiWordType, singleWordType]) => {
            doc.replace(multiWordType, singleWordType)
        },
    )
    return doc
        .match('#Contribution')
        .data()
        .map(data => {
            // This removes whitespace, commas etc
            return data.normal
        })
        .map(type => {
            if ((contributionTypeMappings[type] || type) === 'bugo') {
                return
            }
            if (contributionTypeMappings[type])
                return contributionTypeMappings[type]
            return type
        })
        .filter(contribution => contribution)
        .sort()

}

const statusCheck = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.StatusCheck')
        .text('method')
        .trim()

    return botCommand !== ''

}

const forceSet = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommandX = doc
        .match('#BotCommands.ForceSet.Begin * #BotCommands.ForceSet.Action')
        .text('method')
    const botCommandXB = nlp(botCommandX)
        .match('#BotCommands.ForceSet.Begin')
        .first(1)
        .text('method')
    const botCommandXC = nlp(botCommandX)
        .match('#BotCommands.ForceSet.Checks')
        .data()
    const botCommandXT = nlp(botCommandX)
        .match('#BotCommands.ForceSet.Between')
        .first(1)
        .text('method')
    const botCommandXA = nlp(botCommandX)
        .match('#BotCommands.ForceSet.Action')
        .first(1)
        .text('method')

    let elementsToApply = []
    let validCommand = false
    for (let itemIndex in botCommandXC) {
        if (botCommandXC.hasOwnProperty(itemIndex)) {
            const itemText = botCommandXC[itemIndex].normal
            elementsToApply.push(itemText)
            validCommand = true
        }
    }

    return {
        command: botCommandXB.trim(),
        checks: elementsToApply,
        type: botCommandXT.trim(),
        status: botCommandXA.trim(),
        validCommand,
    }

}

const prClose = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.PR.Close')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const prOpen = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.PR.Open')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const bipSet = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.BIP.Set')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const bipDelete = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.BIP.Delete')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const branchDelete = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.Branch.Delete')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const branchOpen = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.Branch.Open')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const markTodo = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.TodoTask.Mark')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const unmarkTodo = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.TodoTask.Unmark')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

const commandsList = (message) => {

    const plugin = {
        words: {
            ...commands_list,
        },
    }
    nlp.plugin(plugin)
    const doc = nlp(message).toLowerCase()
        .normalize({
            whitespace: true,
            case: true,
            punctuation: true,
        })
    const botCommand = doc
        .match('#BotCommands.Commands.List')
        .text('method')

    let validCommand = isValid(botCommand)

    return {
        validCommand,
    }

}

function isValid(botCommand) {
    return botCommand !== undefined && botCommand !== null && botCommand !== ''
}

module.exports = {
    isValidCommand,
    isActionCommand,
    statusCheck,
    contributionParser,
    forceSet,
    prClose,
    prOpen,
    bipSet,
    bipDelete,
    branchDelete,
    branchOpen,
    markTodo,
    unmarkTodo,
    commandsList,
}