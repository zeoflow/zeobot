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

const minimatch = require('minimatch')
const {initialiseContext} = require('../../libs/zbot-parser/initialise')
const {checksCreate} = require('../../libs/github-api/checks/checksCreate')
const {gitGetBlob} = require('../../libs/github-api/git/gitGetBlob')
const {pullsGetFiles} = require('../../libs/github-api/pulls/pullsGetFiles')

class LicenseChecker {

    static async initializer({zContext}) {
        console.log('LicenseChecker')
        const zParser = await initialiseContext({zContext})
        const zLicenseChecker = new LicenseChecker({zParser})
        await zLicenseChecker.run()
    }

    static events() {
        return [
            'pull_request.edited',
            'pull_request.labeled',
            'pull_request.opened',
            'pull_request.reopened',
            'pull_request.synchronize',
            'pull_request.unassigned',
            'pull_request.unlabeled',
        ]
    }

    constructor({zParser}) {
        this.zParser = zParser
    }

    async run() {

        const zParser = this.zParser
        const {
            zContextParsed,
            zConfigFile,
        } = zParser
        const {
            zGithub,

            zRepoOwner,
            zRepoName,
        } = zContextParsed
        const {zLicenseChecker} = zConfigFile

        const {
            enabled,
            allowedCopyrightHolders,
            allowedLicenses,
            toCheckExtensions,
            toIgnoreFiles,
        } = zLicenseChecker

        if (!enabled) {
            return this.createNotEnabledCheck()
        }

        const owner = zRepoOwner
        const repo = zRepoName

        const listFilesParams = await pullsGetFiles({zParser})
        const {
            pullsFiles,
        } = listFilesParams

        let licenseError = false
        const failureMessages = []

        for (let i = 0; pullsFiles[i] !== undefined; i++) {

            const file = pullsFiles[i]
            const {
                filename,
                status,
                sha: file_sha,
            } = file

            if (minimatch(filename, '(' + toIgnoreFiles.join('|') + ')')) {
                continue
            }
            if (!minimatch(filename, '*.+(' + toCheckExtensions.join('|') + ')', {matchBase: true})) {
                continue
            }
            if (status === 'removed') {
                continue
            }
            if (!this.isSourceFile(filename, toCheckExtensions)) {
                continue
            }

            const zGitGetBlob = await gitGetBlob(zGithub, {
                repo,
                owner,
                file_sha,
            })
            const {
                blobContent,
            } = zGitGetBlob
            const fileContents = Buffer.from(blobContent, 'base64').toString(
                'utf8',
            )

            const detectedLicense = this.detectLicenseHeader(fileContents)
            const {
                licenseYear,
                licenseType,
                licenseCopyright,
            } = detectedLicense

            if (!this.isAllowedLicense(licenseType, allowedLicenses)) {
                licenseError = true
                failureMessages.push(filename + ' is missing a valid license header. (please add a license header)')
                continue
            }

            if (!licenseCopyright) {
                licenseError = true
                failureMessages.push(filename + ' is missing a valid copyright line.')
                continue
            }

            if (status === 'added' || status === 'modified') {
                if (!this.isAllowedCopyrightHolder(licenseCopyright, allowedCopyrightHolders)) {
                    licenseError = true
                    failureMessages.push(filename + ' has an invalid copyright holder: ' + licenseCopyright)
                }
                const currentYear = new Date().getFullYear()
                if (licenseYear !== currentYear) {
                    licenseError = true
                    failureMessages.push(filename + ' should have a copyright year of ' + currentYear)
                }
            }

        }

        if (!licenseError) {
            this.createSuccessfulCheck()
        } else {
            let copyrightHolders = 'Valid copyright holder(s): '
            copyrightHolders += allowedCopyrightHolders.join(", ")
            failureMessages.splice(0, 0, copyrightHolders)
            this.createActionRequiredCheck(failureMessages.join('\n'))
        }

    }

    createActionRequiredCheck(outputText) {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zLicenseChecker} = zConfigFile
        const {enabled} = zLicenseChecker

        if (!enabled) {
            return this.createNotEnabledCheck()
        }

        checksCreate(zParser, {
            name: 'ZeoBot (License Checker)',
            status: 'completed',
            conclusion: 'action_required',
            summary: 'Some new files are missing headers',
            text: outputText,
        })

    }

    createSuccessfulCheck() {

        const zParser = this.zParser
        const {zConfigFile} = zParser
        const {zLicenseChecker} = zConfigFile
        const {enabled} = zLicenseChecker

        if (!enabled) {
            return this.createNotEnabledCheck()
        }

        checksCreate(zParser, {
            name: 'ZeoBot (License Checker)',
            status: 'completed',
            conclusion: 'success',
            summary: 'All required files contain a license',
        })

    }

    createNotEnabledCheck() {

        const zParser = this.zParser

        checksCreate(zParser, {
            name: 'ZeoBot (License Checker)',
            status: 'completed',
            conclusion: 'neutral',
            summary: 'Enforce Branch Merge  is disabled. To enable change the config file that is located at `.zeobot/config.yml`',
        })

    }

    isSourceFile(filename, toCheckExtensions) {
        const extension = filename.substring(filename.lastIndexOf('.') + 1)
        return toCheckExtensions.includes(extension)
    }

    isAllowedLicense(licenseType, allowedLicense) {
        return allowedLicense.includes(licenseType)
    }

    isAllowedCopyrightHolder(licenseCopyright, allowedCopyrightHolders) {
        return allowedCopyrightHolders.includes(licenseCopyright)
    }

    detectLicenseHeader(fileContents) {
        let licenseYear = null
        let licenseCopyright = null
        let licenseType = null
        const COPYRIGHT_REGEX = /\s*([*#]|\/\/) \s*Copyright (\d{4}(-\d{4})?) ([\w\s]+)\.?/
        const APACHE2_REGEX = new RegExp(
            'Licensed under the Apache License, Version 2.0',
        )
        const BSD3_REGEX = new RegExp(
            'Redistribution and use in source and binary forms, with or without',
        )
        const MIT_REGEX = new RegExp('Permission is hereby granted, free of charge,')

        fileContents.split(/\r?\n/).forEach(line => {
            const match = line.match(COPYRIGHT_REGEX)
            if (match) {
                if (match[3]) {
                    licenseYear = Number(match[3].substring(1))
                } else {
                    licenseYear = Number(match[2])
                }
                licenseCopyright = match[4]
            }

            if (line.match(APACHE2_REGEX)) {
                licenseType = 'Apache-2.0'
            } else if (line.match(MIT_REGEX)) {
                licenseType = 'MIT'
            } else if (line.match(BSD3_REGEX)) {
                licenseType = 'BSD-3'
            }
        })
        return {
            licenseCopyright,
            licenseType,
            licenseYear,
        }
    }

}

module.exports = LicenseChecker
