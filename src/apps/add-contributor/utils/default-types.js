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

const repo = require('../tst/repo')

const defaultTypes = function (repoType) {
    return {
        'blog': {
            icon: ':newspaper:',
            title: 'Blogposts',
        },
        'bug-reporter': {
            icon: ':beetle::speech_balloon:',
            title: 'Bugs reporter',
            link: repo.getLinkToIssues(repoType),
        },
        'bug-fixer': {
            icon: ':beetle::wrench:',
            title: 'Bugs resolver',
        },
        'code': {
            icon: ':bust_in_silhouette::computer:',
            title: 'Code',
            link: repo.getLinkToCommits(repoType),
        },
        'design': {
            icon: ':art::paintbrush:',
            title: 'Design',
        },
        'doc': {
            icon: ':open_book::pencil2:',
            title: 'Documentation',
            link: repo.getLinkToCommits(repoType),
        },
        'ideas': {
            icon: ':bulb::speech_balloon:',
            title: 'Ideas, Planning, & Feedback',
        },
        'infra': {
            icon: ':construction::gear:',
            title: 'Infrastructure (Hosting, Build-Tools, etc)',
        },
        'maintenance': {
            icon: ':bust_in_silhouette::toolbox:',
            title: 'Maintenance',
        },
        'project-management': {
            icon: ':bust_in_silhouette::card_index_dividers:',
            title: 'Project Manager',
        },
        'question': {
            icon: ':bust_in_silhouette::speech_balloon:',
            title: 'Questions Answerer',
        },
        'review': {
            icon: ':mag_right::scroll:',
            title: 'Pull Requests Reviewer',
            link: repo.getLinkToReviews(repoType),
        },
        'security': {
            title: ':rotating_light: Security :rotating_light:',
        },
        'sponsor': {
            icon: ':bust_in_silhouette::moneybag:',
            title: 'Sponsor',
        },
        'test': {
            icon: ':warning:',
            title: 'Tester',
            link: repo.getLinkToCommits(repoType),
        },
        'translation': {
            icon: ':world_map:',
            title: 'Translation Creator',
        },
        'tutorial': {
            icon: ':page_with_curl:',
            title: 'Tutorials Creator',
        },
    }
}

const validContributionTypes = Object.keys(defaultTypes('null'))

// Additional terms to match to types (plurals, aliases etc)
const contributionTypeMappings = {
    'blogs': 'blog',
    'blogging': 'blog',
    'bugs': 'bugo',
    'bug': 'bugo',
    'reporter': 'bug-reporter',
    'fix': 'bug-fixer',
    'fixer': 'bug-fixer',
    'resolver': 'bug-fixer',
    'codes': 'code',
    'coding': 'code',
    'designing': 'design',
    'designs': 'design',
    'design': 'design',
    'doc': 'doc',
    'docs': 'doc',
    'documenting': 'doc',
    'documentation': 'doc',
    'idea': 'ideas',
    'infras': 'infra',
    'infrastructure': 'infra',
    'maintaining': 'maintenance',
    'management': 'project-management',
    'managing': 'project-management',
    'project': 'project-management',
    'projectManaging': 'project-management',
    'questions': 'question',
    'reviews': 'review',
    'securing': 'security',
    'sponsor': 'sponsor',
    'tests': 'test',
    'testing': 'test',
    'translator': 'translation',
    'translating': 'translation',
    'translations': 'translation',
    'tutorials': 'tutorial',
}

// Additional terms to match to types (plurals, aliases etc) that are multi word
const contributionTypeMultiWordMapping = {
    'project management': 'project-management',
    'project manager': 'project-management',
    'bug fixer': 'bug-fixer',
    'bugs fixer': 'bug-fixer',
    'bug reporter': 'bug-reporter',
}

const Contributions = {}

validContributionTypes.forEach(type => {
    Contributions[type] = 'Contribution'
})

Object.keys(contributionTypeMappings).forEach(type => {
    Contributions[`${type}`] = 'Contribution'
})

module.exports = {
    defaultTypes,
    validContributionTypes,
    contributionTypeMappings,
    contributionTypeMultiWordMapping,
    Contributions,
}
