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

const Assistant = require('./apps/assistant')
const AutoAssign = require('./apps/auto-assign')
const AutodeleteMergedBranches = require('./apps/autodelete-merged-branches')
const LabelsUpdater = require('./apps/labels-updater')
const BranchInProgress = require('./apps/branch-in-progress')
const ContributorsCommitsSigned = require('./apps/contributors-commits-signed')
const DraftRelease = require('./apps/draft-release')
const EnforceBranchMerge = require('./apps/enforce-branch-merge')
const LicenseChecker = require('./apps/license-checker')
const ToDo = require('./apps/todo')
const InstallationManager = require('./apps/installation-manager')
const UninstallationManager = require('./apps/uninstallation-manager')
const chalk = require('chalk')

process.stdout.write(
    chalk.yellow(
        `${chalk.bold(
            'WARNING',
        )} :: Remember to update the private key from << res/keys/pk.pem >> and to change the webhook secret variable from << .env >>\n`,
    ),
)

function formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()
    const day = (date.getDate()).toString().length === 1 ? '0' + (date.getDate()).toString() : (date.getDate()).toString()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

const aliveSince = formatDate(new Date())

function keepAlive() {
    console.log(`Alive since: ${aliveSince}. Current time ${formatDate(new Date())}`)
}

setInterval(keepAlive, 60 * 1000)

module.exports = (robot) => {
    robot.log('Loaded ZeoBot GitHub App')

    // new version
    // installation manager
    robot.on(InstallationManager.events(), async (zContext) => {
        await InstallationManager.initializer({zContext})
    })
    // uninstallation manager
    robot.on(UninstallationManager.events(), async (zContext) => {
        await UninstallationManager.initializer({zContext})
    })
    // labels updater
    robot.on(LabelsUpdater.events(), async (zContext) => {
        await LabelsUpdater.initializer({zContext})
    })
    // zeobot assistant
    robot.on(Assistant.events(), async (zContext) => {
        await Assistant.initializer({zContext})
    })
    // auto assign
    robot.on(AutoAssign.events(), async (zContext) => {
        await AutoAssign.initializer({zContext})
    })
    // autodelete merged branch
    robot.on(AutodeleteMergedBranches.events(), async (zContext) => {
        await AutodeleteMergedBranches.initializer({zContext})
    })
    // branch in progress
    robot.on(BranchInProgress.events(), async (zContext) => {
        await BranchInProgress.initializer({zContext})
    })
    // contributors commits signed
    robot.on(ContributorsCommitsSigned.events(), async (zContext) => {
        await ContributorsCommitsSigned.initializer({zContext})
    })
    // draft release
    robot.on(DraftRelease.events(), async (zContext) => {
        await DraftRelease.initializer({zContext})
    })
    // enforce branch merge
    robot.on(EnforceBranchMerge.events(), async (zContext) => {
        await EnforceBranchMerge.initializer({zContext})
    })
    // license checker
    robot.on(LicenseChecker.events(), async (zContext) => {
        await LicenseChecker.initializer({zContext})
    })
    // to do
    robot.on(ToDo.events(), async (zContext) => {
        await ToDo.initializer({zContext})
    })
}

