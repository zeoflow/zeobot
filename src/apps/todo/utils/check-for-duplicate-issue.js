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
 * Checks to see if an issue already exists with the given title.
 * @param {import('probot').Context} context - Probot context object
 * @param {string} title - An issue title
 */
module.exports = async (context, title) => {
  if (context.todos.includes(title)) return title
  context.todos.push(title)

  const search = await context.github.search.issuesAndPullRequests({
    q: `${title} in:title repo:${context.payload.repository.full_name}`,
    per_page: 100
  })

  if (search.data.total_count !== 0) {
    return search.data.items.find(issue => issue.title === title)
  }
}
