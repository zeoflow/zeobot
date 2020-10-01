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

async function getUserDetails({github, username}) {
    // TODO: optimzation, if commenting user is the user we're adding we can avoid an api call
    // const commentUser = context.payload.comment.user.login
    // if (user === commentUser) {
    //     return {
    //         name: context.payload.comment.user.name
    //         avatarUrl: context.payload.comment.avatar_url
    //         profile:
    //     }
    // }

    let result
    try {
        result = await github.users.getByUsername({username})
    } catch (error) {
        if (error.status === 404) {
            throw new UserNotFoundError(username)
        } else {
            throw error
        }
    }

    const {avatar_url, blog, html_url, name} = result.data

    return {
        name: name || username,
        avatar_url,
        profile: blog || html_url,
    }
}

module.exports = getUserDetails
