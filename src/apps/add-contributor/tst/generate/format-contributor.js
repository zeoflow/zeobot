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
const formatContributionType = require('./format-contribution-type')

const avatarTemplate = _.template(
    '<img src="<%= contributor.avatar_url %>" width="<%= options.imageSize %>px;" alt=""/>',
)
const avatarBlockTemplate = _.template(
    '<a href="<%= contributor.profile %>"><%= avatar %><br /><sub><b><font size="+1"><%= name %></font></b></sub></a><br /><sub><a href="<%= github_url %>">@<%= login %></a></sub>',
)
const avatarBlockTemplateNoProfile = _.template(
    '<%= avatar %><br /><sub><b><%= name %></b></sub>',
)
const contributorTemplate = _.template(
    '<%= avatarBlock %><br /><%= contributions %>',
)

const defaultImageSize = 100

function defaultTemplate(templateData) {
    const name = escapeName(templateData.contributor.name)
    const login = escapeName(templateData.contributor.login)
    const github_url = 'https://github.com/' + login
    const avatar = avatarTemplate(
        _.assign(templateData, {
            name,
        }),
    )
    const avatarBlockTemplateData = _.assign(
        {
            name,
            avatar,
            login,
            github_url,
        },
        templateData,
    )
    let avatarBlock

    if (templateData.contributor.profile) {
        avatarBlock = avatarBlockTemplate(avatarBlockTemplateData)
    } else {
        avatarBlock = avatarBlockTemplateNoProfile(avatarBlockTemplateData)
    }

    return contributorTemplate(_.assign({avatarBlock}, templateData))
}

function escapeName(name) {
    return name.replace(new RegExp('\\|', 'g'), '&#124;')
}

module.exports = function formatContributor(options, contributor) {
    const formatter = _.partial(formatContributionType, [options, contributor])
    const contributions = contributor.contributions.map(formatter).join(' ')
    const templateData = {
        contributions,
        contributor,
        options: _.assign({imageSize: defaultImageSize}, options),
    }
    return defaultTemplate(templateData)
}
