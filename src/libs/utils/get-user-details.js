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

const {UserNotFoundError} = require('./errors')

async function getUserDetails({zGithub, username}) {

    let result
    try {
        result = await zGithub.users.getByUsername({username})
    } catch (error) {
        if (error.status === 404) {
            throw new UserNotFoundError(username)
        } else {
            throw error
        }
    }

    const {avatar_url, blog, html_url, name} = result.data
    const github_url = 'https://github.com/' + username

    return {
        name: name || username,
        avatar_url,
        profile: blog || html_url,
        github_url,
    }
}

module.exports = getUserDetails
