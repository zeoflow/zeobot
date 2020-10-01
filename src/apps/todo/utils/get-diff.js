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

/**
 * This value will take some tweaking. A really large diff
 * is in the hundred thousands (288421 prompted this change),
 * but they can go way higher and would result in downtime.
 */
const MAX_DIFF_SIZE = 150000

async function getCommit (context, zRef, method = 'GET') {
  if (context.event === 'push') {
    return await context.github.repos.getCommit(context.repo({
      method,
      ref: zRef,
      headers: {Accept: 'application/vnd.github.diff'}
    }))
  } else {
    const { number } = context.issue()
    return await context.github.pulls.get(context.repo({
      method,
      headers: {Accept: 'application/vnd.github.diff'},
      pull_number: number
    }))
  }
}

module.exports = async (context, zRef) => {
  const headRequest = await getCommit(context, zRef, 'HEAD')
  const diffSize = headRequest.headers['content-length']
  if (diffSize > MAX_DIFF_SIZE) {
    context.log.info(`Diff is too large: ${diffSize}/${MAX_DIFF_SIZE}`)
    return
  }

  const diff = await getCommit(context, zRef)
  return diff.data
}
