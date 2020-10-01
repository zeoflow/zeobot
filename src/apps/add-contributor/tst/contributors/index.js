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
const util = require('../util')
const repo = require('../repo')
const add = require('./add')
const prompt = require('./prompt')

function isNewContributor(contributorList, username) {
    return !_.find({login: username}, contributorList)
}

module.exports = function addContributor(options, username, contributions) {
    const answersP = prompt(options, username, contributions)
    const contributorsP = answersP.then(answers =>
        add(options, answers.username, answers.contributions, repo.getUserInfo),
    )

    const writeContributorsP = contributorsP.then(contributors =>
        util.configFile.writeContributors(options.config, contributors),
    )

    return Promise.all([answersP, contributorsP, writeContributorsP]).then(
        res => {
            const answers = res[0]
            const contributors = res[1]
            return {
                username: answers.username,
                contributions: answers.contributions,
                contributors,
                newContributor: isNewContributor(
                    options.contributors,
                    answers.username,
                ),
            }
        },
    )
}
