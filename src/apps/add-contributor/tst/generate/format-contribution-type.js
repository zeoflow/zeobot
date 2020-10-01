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

const linkTemplate = _.template(
    '<a href="docs/contributors.md" title="<%= description %>"><%= symbol %></a>',
)

function getType(options, contribution) {
    const types = util.contributionTypes(options)
    return types[contribution.type || contribution]
}

module.exports = function formatContribution(
    options,
    contributor,
    contribution,
) {
    const type = getType(options, contribution)

    if (!type) {
        throw new Error(
            `Unknown contribution type ${contribution} for contributor ${contributor.login ||
            contributor.name}`,
        )
    }

    const templateData = {
        symbol: type.symbol,
        description: type.description,
        contributor,
        options,
    }

    let url = getUrl(contribution, contributor)

    if (contribution.url) {
        url = contribution.url
    } else if (type.link) {
        url = _.template(type.link)(templateData)
    }

    return linkTemplate(_.assign({url}, templateData))
}

function getUrl(contribution, contributor) {
    if (contributor.login) {
        return `#${contribution}-${contributor.login}`
    } else {
        return `#${contribution}`
    }
}
