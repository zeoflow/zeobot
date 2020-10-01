/**
 * Generate an array of labels based on the config
 * @param {import('probot').Context} context - Probot context object
 */
const {issueCreateLabel} = require('../../libs/github-api/issue/issueCreateLabel')
const generateLabel = async (zParser) => {

    const {
        zContextParsed,
    } = zParser
    const {
        zGithub,

        zRepoName,
        zRepoOwner,
    } = zContextParsed

    //zeobot
    const labelZeobotToDo = {
        name: '@zeobot-todo',
        color: '1745e8',
        description: '',
    }
    const labelZeobotBIP = {
        name: '@zeobot-bip',
        color: 'B7FF03',
        description: '',
    }

    //useful
    const labelBug = {
        name: '@bug',
        color: 'd50000',
        description: '',
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
        description: '',
    }
    const labelEnhancement = {
        name: '@enhancement',
        color: '651FFF',
        description: '',
    }
    const labelFeature = {
        name: '@feature',
        color: '651FFF',
        description: '',
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

    let labels = [
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
        labelIssue,
        labelMaintenance,
        labelNew,
        labelPriorityCritical,
        labelPriorityHigh,
        labelPriorityMedium,
        labelPriorityLow,
        labelPriorityVeryLow,
        labelSecurity,
    ]

    labels.forEach(label => {
        const {
            name,
            color,
            description,
        } = label
        issueCreateLabel(zGithub, {
            owner: zRepoOwner,
            repo: zRepoName,
            name,
            color,
            description,
        })
    })

}

module.exports = {
    generateLabel,
}