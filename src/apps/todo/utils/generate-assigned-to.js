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

const { reduceToList, addAt } = require('./helpers')

/**
 * Generates the assigned-to part of the footer string
 * @param {boolean|string|string[]} [autoAssign=true] - Auto assign config setting
 * @param {string} author - Commit author
 * @param {number|boolean} author - PR number or false
 * @returns {string}
 */
module.exports = function generateAssignedTo (autoAssign, author, pr) {
  if (autoAssign === true) {
    return pr ? ` cc @${author}.` : ` It's been assigned to @${author} because they committed the code.`
  }

  if (autoAssign === false) {
    return ''
  }

  let assigner
  if (typeof autoAssign === 'string') {
    assigner = addAt(autoAssign)
  }

  if (Array.isArray(autoAssign)) {
    const assigners = autoAssign.map(user => addAt(user))
    assigner = reduceToList(assigners)
  }

  return pr ? ` cc ${assigner}` : ` It's been automagically assigned to ${assigner}.`
}
