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

const _ = require('lodash/fp')
const inquirer = require('inquirer')
const util = require('../util')
const repo = require('../repo')

const contributionChoices = _.flow(
    util.contributionTypes,
    _.toPairs,
    _.sortBy(pair => {
        return pair[1].description
    }),
    _.map(pair => {
        return {
            name: `${pair[1].symbol}  ${pair[1].description}`,
            value: pair[0],
        }
    }),
)

function getQuestions(options, username, contributions) {
    return [
        {
            type: 'input',
            name: 'username',
            message: `What is the contributor's ${repo.getTypeName(
                options.repoType,
            )} username?`,
            when: !username,
            validate: function validate(input) {
                if (!input) {
                    return 'Username not provided'
                }
                return true
            },
        },
        {
            type: 'checkbox',
            name: 'contributions',
            message: 'What are the contribution types?',
            when: !contributions,
            default: function (answers) {
                // default values for contributions when updating existing users
                answers.username = answers.username || username
                return options.contributors
                    .filter(
                        entry =>
                            entry.login &&
                            entry.login.toLowerCase() === answers.username.toLowerCase(),
                    )
                    .reduce(
                        (allEntries, entry) => allEntries.concat(entry.contributions),
                        [],
                    )
            },
            choices: contributionChoices(options),
            validate: function (input, answers) {
                answers.username = answers.username || username
                const previousContributions = options.contributors
                    .filter(
                        entry =>
                            entry.login &&
                            entry.login.toLowerCase() === answers.username.toLowerCase(),
                    )
                    .reduce(
                        (allEntries, entry) => allEntries.concat(entry.contributions),
                        [],
                    )

                if (!input.length) {
                    return 'Use space to select at least one contribution type.'
                } else if (_.isEqual(input, previousContributions)) {
                    return 'Nothing changed, use space to select contribution types.'
                }
                return true
            },
        },
    ]
}

function getValidUserContributions(options, contributions) {
    const validContributionTypes = util.contributionTypes(options)
    const userContributions = contributions && contributions.split(',')

    const validUserContributions = _.filter(
        userContribution => validContributionTypes[userContribution] !== undefined,
    )(userContributions)

    const invalidUserContributions = _.filter(
        userContribution => validContributionTypes[userContribution] === undefined,
    )(userContributions)

    if (_.isEmpty(validUserContributions)) {
        throw new Error(
            `${invalidUserContributions.toString()} is/are invalid contribution type(s)`,
        )
    }
    return validUserContributions
}

module.exports = function prompt(options, username, contributions) {
    const defaults = {
        username,
        contributions:
            username === undefined && contributions === undefined
                ? []
                : getValidUserContributions(options, contributions),
    }
    const questions = getQuestions(options, username, contributions)
    return inquirer.prompt(questions).then(_.assign(defaults))
}
