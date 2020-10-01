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

const conventions = {
    angular: {
        name: 'Angular',
        msg: 'docs:',
        lowercase: true,
        transform(msg) {
            return msg.replace(
                /(^.*?) ([A-Z][a-z]+) \w*/,
                (_, ...words) => `${words[0]} ${words[1].toLowerCase()} `,
            )
        },
    },
    atom: {
        name: 'Atom',
        msg: ':memo:',
    },
    gitmoji: {
        name: 'Gitmoji',
        msg: ':busts_in_silhouette:',
    },
    ember: {
        name: 'Ember',
        msg: '[DOC canary]',
    },
    eslint: {
        name: 'ESLint',
        msg: 'Docs:',
    },
    jshint: {
        name: 'JSHint',
        msg: '[[DOCS]]',
    },
    none: {
        name: 'None',
        msg: '',
    },
}

Object.keys(conventions).forEach(style => {
    conventions[style].value = style
})

module.exports = conventions
