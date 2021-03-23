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

const {issueListLabelsForRepo} = require('../../libs/github-api/issue/issueListLabelsForRepo')
const {issueCreateLabel} = require('../../libs/github-api/issue/issueCreateLabel')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')

class LabelsUpdater {

    static async initializer({zContext}) {
        console.log('LabelsUpdater')
        const zParser = await initialiseContext({zContext})
        const zLabelsUpdater = new LabelsUpdater({zParser})
        const {zContextParsed} = zParser
        const {zRepoOwner, zRepoName} = zContextParsed
        await zLabelsUpdater.run({zRepoOwner, zRepoName})
    }

    static events() {
        return [
            'issue_comment.created',
            'issue_comment.deleted',
            'issue_comment.edited',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    async run({zRepoOwner, zRepoName}) {

        const zParser = this.zParser
        const {
            zContextParsed,
        } = zParser
        const {
            zGithub,

            zRepoName: zRepoNameP,
            zRepoOwner: zRepoOwnerP,
        } = zContextParsed

        const labels = await this.generateLabels({zRepoOwner, zRepoName})
        labels.forEach(label => {
            const {
                name,
                color,
                description,
                oldName,
            } = label
            issueCreateLabel(zGithub, {
                owner: zRepoOwner || zRepoOwnerP,
                repo: zRepoName || zRepoNameP,
                name,
                color,
                description,
                oldName: oldName || name,
            })
        })

    }

    async generateLabels({zRepoOwner, zRepoName}) {

        //zeobot
        const labelZeobotToDo = {
            name: '@zeobot-todo',
            color: '1745e8',
            description: '',
        }
        const labelZeobotBIP = {
            name: '@zeobot-bip',
            color: 'B7FF03',
            description: 'Branch In Progress | ZeoBot will block this branch from being merged',
        }

        //useful
        const labelBug = {
            name: '@bug',
            color: 'd50000',
            description: 'Something isn\'t working',
        }
        const labelBugFix = {
            name: '@bug-fix',
            color: '00F2A1',
            description: '',
        }
        const labelDependencyUpdates = {
            name: '@dependency-update',
            color: '212121',
            description: '',
        }
        const labelDocumentation = {
            name: '@documentation',
            color: '546E7A',
            description: 'Improvements or additions to documentation',
        }
        const labelEnhancement = {
            name: '@enhancement',
            color: '651FFF',
            description: 'New feature or request',
        }
        const labelFeature = {
            name: '@feature',
            color: '651FFF',
            description: 'New feature or request',
        }
        const labelGoodFirstIssue = {
            name: '@good-first-issue',
            color: '7057ff',
            description: 'Good for newcomers',
        }
        const labelIssue = {
            name: '@issue',
            color: 'd50000',
            description: '',
        }
        const labelMaintenance = {
            name: '@maintenance',
            color: '64DD17',
            description: '',
        }
        const labelNew = {
            name: '@new',
            color: '3D019D',
            description: '',
        }
        const labelPriorityCritical = {
            name: '@priority-critical',
            color: 'd50000',
            description: '',
        }
        const labelPriorityHigh = {
            name: '@priority-high',
            color: 'FF5100',
            description: '',
        }
        const labelPriorityLow = {
            name: '@priority-low',
            color: '0e8a16',
            description: '',
        }
        const labelPriorityVeryLow = {
            name: '@priority-very-low',
            color: '3F51B5',
            description: '',
        }
        const labelPriorityMedium = {
            name: '@priority-medium',
            color: 'FFD600',
            description: '',
        }
        const labelSecurity = {
            name: '@security',
            color: 'd1021b',
            description: '',
        }
        const labelDuplicate = {
            name: '@duplicate',
            color: '4F4F4F',
            description: 'This issue or pull request already exists',
        }
        const labelHelpWanted = {
            name: '@help-wanted',
            color: 'FFFFFF',
            description: 'Extra attention is needed',
        }
        const labelInvalid = {
            name: '@invalid',
            color: 'E61946',
            description: 'This doesn\'t seem right',
        }
        const labelQuestion = {
            name: '@question',
            color: '1547D1',
            description: 'Further information is requested',
        }
        const labelWontfix = {
            name: '@wontfix',
            color: 'D01515',
            description: 'This will not be worked on',
        }
        const labelUI = {
            name: '@UI',
            color: '2f99eb',
            description: '',
        }
        const labelConfig = {
            name: '@config',
            color: '275400',
            description: '',
        }
        const labelEnvironment = {
            name: '@environment',
            color: '275400',
            description: '',
        }

        const zeobotLabels = [
            //zeobot labels
            labelZeobotToDo,
            labelZeobotBIP,

            //useful labels
            labelBug,
            labelBugFix,
            labelDependencyUpdates,
            labelDocumentation,
            labelEnhancement,
            labelFeature,
            labelGoodFirstIssue,
            labelIssue,
            labelMaintenance,
            labelNew,
            labelPriorityCritical,
            labelPriorityHigh,
            labelPriorityMedium,
            labelPriorityLow,
            labelPriorityVeryLow,
            labelSecurity,
            labelDuplicate,
            labelHelpWanted,
            labelInvalid,
            labelQuestion,
            labelWontfix,
            labelUI,
            labelConfig,
            labelEnvironment
        ]

        const zParser = this.zParser
        const {zLabels} = await issueListLabelsForRepo({zParser, zRepoOwner, zRepoName})
        const labelsN = zeobotLabels.map(label => label.name)
        const zLabelsN = zLabels.map(label => label.name)
        const oldLabelsArr = zLabels.map(label => {
            if (!labelsN.includes(label.name) && !zLabelsN.includes('@' + label.name.replace(/ /g, '-'))) {
                return '@' + label.name.replace(/ /g, '-')
            }
        }).filter(label => label)

        zeobotLabels.forEach(label => {
            if (oldLabelsArr.includes(label.name)) {
                const labelOld = {
                    oldName: zLabels[zLabelsN.indexOf(label.name.replace(/-/g, ' ').replace(/@/g, ''))].name,
                    name: label.name,
                    color: label.color,
                    description: label.description,
                };
                zeobotLabels.push(labelOld)
            }
        });
        return zeobotLabels.reverse()

    }

    static async installInRepo({zParser, zRepoOwner, zRepoName}) {

        const zLabelsUpdater = new LabelsUpdater({zParser})
        await zLabelsUpdater.run({zRepoOwner, zRepoName})

    }

}

module.exports = LabelsUpdater
