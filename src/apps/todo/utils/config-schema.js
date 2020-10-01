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

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  autoAssign: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()), Joi.string()).default(true)
    .description('Should **todo** automatically assign a user to the new issue? If `true`, it\'ll assign whoever pushed the code. If a string, it\'ll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone.'),
  keyword: Joi.array().items(Joi.string()).single().default(['todo'])
    .description('The keyword(s) to use to generate issue titles'),
  bodyKeyword: Joi.array().items(Joi.string()).single().default(['@body', 'BODY'])
    .description('If this is in the line right after the main keyword, it will become the generated issue body.'),
  blobLines: Joi.alternatives(Joi.number(), Joi.boolean().valid(false)).default(10)
    .description('The number of lines of code to show, starting from the keyword.'),
  caseSensitive: Joi.boolean().default(false)
    .description('Should the keyword be case sensitive?'),
  label: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()).single()).default(true)
    .description('Add a label to the new issue. If true, add the `todo` label. If false, don\'t add any label.You can also give it a label name or an array of label names.'),
  reopenClosed: Joi.boolean().default(true)
    .description('If an issue already exists and is closed, reopen it. Note: if set to false, no new issue will be created.'),
  exclude: Joi.string().allow(null).default(null)
    .description('Exclude certain files and/or directories. Should be a valid regular expression.')
})
