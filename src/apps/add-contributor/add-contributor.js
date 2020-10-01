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

function uniqueTypes(contribution) {
    return contribution.type || contribution
}

function formatContributions(options, existing = [], types) {
    const same = _.intersectionBy(uniqueTypes, existing, types)
    const remove = types.length < existing.length && same.length

    if (options.url) {
        return existing.concat(
            types.map(type => {
                return {type, url: options.url}
            }),
        )
    }

    if (remove) {
        return same
    }

    return _.uniqBy(uniqueTypes, existing.concat(types))
}

function updateContributor(options, contributor, contributions) {
    return _.assign(contributor, {
        contributions: formatContributions(
            options,
            contributor.contributions,
            contributions,
        ),
    })
}

function updateExistingContributor(options, username, contributions) {
    return options.contributors.map(contributor => {
        if (
            !contributor.login ||
            username.toLowerCase() !== contributor.login.toLowerCase()
        ) {
            return contributor
        }
        return updateContributor(options, contributor, contributions)
    })
}

function addNewContributor(options, username, contributions, infoFetcher) {
    return infoFetcher(username, options.repoType, options.repoHost).then(
        userData => {
            const contributor = _.assign(userData, {
                contributions: formatContributions(options, [], contributions),
            })
            return options.contributors.concat(contributor)
        },
    )
}

function addContributor(
    options,
    username,
    contributions,
    infoFetcher,
) {
    // case insensitive find
    const exists = _.find(contributor => {
        return (
            contributor.login &&
            contributor.login.toLowerCase() === username.toLowerCase()
        )
    }, options.contributors)

    if (exists) {
        return Promise.resolve(
            updateExistingContributor(options, username, contributions),
        )
    }
    return addNewContributor(options, username, contributions, infoFetcher)
}

module.exports = {
    addContributor
}
