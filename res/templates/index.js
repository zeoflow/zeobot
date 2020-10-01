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

 const { handlebars } = require('hbs')

// Register a githubHost global helper to make links respect the GHE_HOST env var
handlebars.registerHelper('githubHost', () => process.env.GHE_HOST || 'github.com')

const compile = filename =>
  handlebars.compile(require(`./${filename}`))

module.exports = {
  zCommentTodoMD: compile('todoComment'),
  zIssueTodoMD: compile('todoIssue'),
  zIssueFromMergeTodoMD: compile('todoIssueFromMerge'),
  zTitleChangeTodoMD: compile('todoTitleChange'),
  zReopenClosedTodoMD: compile('todoReopenClosed'),
}
