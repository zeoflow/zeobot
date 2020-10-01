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

const validator = require('email-validator')

// Returns a list containing failed commit error messages
// If commits aren't properly signed signed off
// Otherwise returns an empty list
const getCCSStatus = async function (commits, isRequiredFor, prURL) {
    const failed = []

    for (const {commit, author, parents, sha} of commits) {
        const isMerge = parents && parents.length > 1
        const signoffRequired = !author || await isRequiredFor(author.login)
        if (isMerge || (!signoffRequired && commit.verification.verified) || (!signoffRequired)) {
            continue
        } else if (author && author.type === 'Bot') {
            continue
        }

        const commitInfo = {
            sha,
            url: `${prURL}/commits/${sha}`,
            author: commit.author.name,
            committer: commit.committer.name,
            message: '',
        }

        const signoffs = getSignoffs(commit)

        if (signoffs.length === 0) {
            // no signoffs found
            if (signoffRequired) {
                commitInfo.message = 'The sign-off is missing.'
                failed.push(commitInfo)
            } else if (!commit.verification.verified) {
                commitInfo.message = 'Commit by organization member is not verified.'
                failed.push(commitInfo)
            }

            continue
        }

        const email = commit.author.email || commit.committer.email
        if (!(validator.validate(email))) {
            commitInfo.message = `${email} is not a valid email address.`
            failed.push(commitInfo)
            continue
        }

        const authors = [commit.author.name.toLowerCase(), commit.committer.name.toLowerCase()]
        const emails = [commit.author.email.toLowerCase(), commit.committer.email.toLowerCase()]
        if (signoffs.length === 1) {
            // commit contains one signoff
            const sig = signoffs[0]
            if (!(authors.includes(sig.name.toLowerCase())) || !(emails.includes(sig.email.toLowerCase()))) {
                commitInfo.message = `Expected "${commit.author.name} <${commit.author.email}>", but got "${sig.name} <${sig.email}>".`
                failed.push(commitInfo)
            }
        } else {
            // commit contains multiple signoffs
            const valid = signoffs.filter(
                signoff => authors.includes(signoff.name.toLowerCase()) && emails.includes(signoff.email.toLowerCase()),
            )

            if (valid.length === 0) {
                const got = signoffs.map(sig => `"${sig.name} <${sig.email}>"`).join(', ')
                commitInfo.message = `Can not find "${commit.author.name} <${commit.author.email}>", in [${got}].`
                failed.push(commitInfo)
            }
        } // end if
    } // end for
    return failed
}

function getSignoffs(commit) {
    const regex = /^Signed-off-by: (.*) <(.*)>$/img
    const matches = []
    let match
    while ((match = regex.exec(commit.message)) !== null) {
        matches.push({
            name: match[1],
            email: match[2],
        })
    }

    return matches
}

module.exports = {
    getCCSStatus,
}