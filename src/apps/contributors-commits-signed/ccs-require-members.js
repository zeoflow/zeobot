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

// Returns a list containing failed commit error messages
// If commits aren't properly signed signed off
// Otherwise returns an empty list
const requireMembers = async function (requireForMembers, zParser) {
    // If members are required to sign-off, then always require sign-off
    if (requireForMembers) {
        return async () => true
    }
    const {zContextParsed} = zParser
    const {
        zGithub,
        zRepoOwner,
    } = zContextParsed

    let org
    try
    {
        const orgDetails = await zGithub.orgs.get({
            org: zRepoOwner,
        })
        org = orgDetails.data
    } catch(e) {
    }
    // If repository belongs to an organization, check if user is a member
    if (org) {
        const members = {}

        return async (login) => {
            let member
            if (login in members) member = members[login]
            else {
                member = await zGithub.orgs.checkMembership({
                    org: zRepoOwner,
                    username: login,
                }).catch(() => {
                    return false
                })
                members[login] = member
            }
            // Sign-off is required for non-members only
            return !member
        }
    }

    // If repository does not belong to an organization, check if user is the owner of the repository
    return async (login) => {
        return login !== zRepoOwner
    }
}

module.exports = {
    requireMembers,
}