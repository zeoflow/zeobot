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

const pify = require('pify')
const request = pify(require('request'))

const addPrivateToken = (url, privateToken = '') => {
    if (privateToken === '') return url

    return `${url}&private_token=${privateToken}`
        .replace(/\?/g, '&')
        .replace('&', '?')
}

const getUserInfo = function (username, hostname, privateToken) {
    /* eslint-disable complexity */
    if (!hostname) {
        hostname = 'https://gitlab.com'
    }

    return request
        .get({
            url: addPrivateToken(
                `${hostname}/api/v4/users?username=${username}`,
                privateToken,
            ),
            headers: {
                'User-Agent': 'request',
            },
        })
        .then(res => {
            const body = JSON.parse(res.body)

            // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
            if (!body || body.length === 0) {
                throw new Error(`User ${username} not found`)
            }

            // no private token present
            if (body.message) {
                throw new Error(body.message)
            }

            const user = body[0]

            return {
                login: user.username,
                name: user.name || username,
                avatar_url: user.avatar_url,
                profile: user.web_url.startsWith('http')
                    ? user.web_url
                    : `http://${user.web_url}`,
            }
        })
}

const getContributors = function (owner, name, hostname, privateToken) {
    if (!hostname) {
        hostname = 'https://gitlab.com'
    }

    return request
        .get({
            url: addPrivateToken(
                `${hostname}/api/v4/projects?search=${name}`,
                privateToken,
            ),
            headers: {
                'User-Agent': 'request',
            },
        })
        .then(res => {
            const projects = JSON.parse(res.body)

            // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
            if (!projects || projects.length === 0) {
                throw new Error(`Project ${owner}/${name} not found`)
            }

            let project = null
            for (let i = 0; i < projects.length; i++) {
                if (projects[i].path_with_namespace === `${owner}/${name}`) {
                    project = projects[i]
                    break
                }
            }

            if (!project) {
                throw new Error(`Project ${owner}/${name} not found`)
            }

            return request
                .get({
                    url: addPrivateToken(
                        `${hostname}/api/v4/projects/${project.id}/repository/contributors`,
                        privateToken,
                    ),
                    headers: {
                        'User-Agent': 'request',
                    },
                })
                .then(newRes => {
                    const contributors = JSON.parse(newRes.body)
                    if (newRes.statusCode >= 400) {
                        if (newRes.statusCode === 404) {
                            throw new Error('No contributors found on the GitLab repository')
                        }
                        throw new Error(contributors.message)
                    }
                    return contributors.map(item => item.name)
                })
        })
}

module.exports = {
    getUserInfo,
    getContributors,
}
