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

const commands_list = {
    // commands list
    'command': 'BotCommands.Commands.List',
    'commands': 'BotCommands.Commands.List',
    'commands list': 'BotCommands.Commands.List',
    'command list': 'BotCommands.Commands.List',
    'view command list': 'BotCommands.Commands.List',
    // set action
    'set': 'BotCommands.ForceSet.Begin',
    'bip': 'BotCommands.ForceSet.Checks',
    'ccs': 'BotCommands.ForceSet.Checks',
    'ebm': 'BotCommands.ForceSet.Checks',
    'lc': 'BotCommands.ForceSet.Checks',
    'to': 'BotCommands.ForceSet.Between',
    'pass': 'BotCommands.ForceSet.Action',
    'fail': 'BotCommands.ForceSet.Action',
    // status check
    'do a status check': 'BotCommands.StatusCheck',
    'status check': 'BotCommands.StatusCheck',
    'check status': 'BotCommands.StatusCheck',
    // add contributors
    'add': 'BotCommands.AddContributor.Action',
    // pr close
    'close pr': 'BotCommands.PR.Close',
    'close pull request': 'BotCommands.PR.Close',
    'close this pr': 'BotCommands.PR.Close',
    'close this pull request': 'BotCommands.PR.Close',
    'close this pull_request': 'BotCommands.PR.Close',
    'close pull_request': 'BotCommands.PR.Close',
    // pr open
    'open pr': 'BotCommands.PR.Open',
    'open pull request': 'BotCommands.PR.Open',
    'open this pr': 'BotCommands.PR.Open',
    'open this pull request': 'BotCommands.PR.Open',
    'open this pull_request': 'BotCommands.PR.Open',
    'open pull_request': 'BotCommands.PR.Open',
    // bip
    // set
    'set bip': 'BotCommands.BIP.Set',
    'set as bip': 'BotCommands.BIP.Set',
    'add bip label': 'BotCommands.BIP.Set',
    'add bip': 'BotCommands.BIP.Set',
    // unset
    'un-bip': 'BotCommands.BIP.Delete',
    'unbip': 'BotCommands.BIP.Delete',
    'set as work done': 'BotCommands.BIP.Delete',
    'delete bip label': 'BotCommands.BIP.Delete',
    'delete bip': 'BotCommands.BIP.Delete',
    // branch delete
    'delete branch': 'BotCommands.Branch.Delete',
    'delete br': 'BotCommands.Branch.Delete',
    // branch re-open
    'open branch': 'BotCommands.Branch.Open',
    're-open branch': 'BotCommands.Branch.Open',
    'reopen branch': 'BotCommands.Branch.Open',
    'open br': 'BotCommands.Branch.Open',
    'reopen br': 'BotCommands.Branch.Open',
    're-open br': 'BotCommands.Branch.Open',
    // to-do
    // mark as to-do
    'mark as a todo task': 'BotCommands.TodoTask.Mark',
    'mark todo': 'BotCommands.TodoTask.Mark',
    'mark todo task': 'BotCommands.TodoTask.Mark',
    'todo this': 'BotCommands.TodoTask.Mark',
    'todo it': 'BotCommands.TodoTask.Mark',
    // unmark as to-do
    'unmark todo task': 'BotCommands.TodoTask.Unmark',
    'unmark todo': 'BotCommands.TodoTask.Unmark',
    'un-todo': 'BotCommands.TodoTask.Unmark',
    'delete todo': 'BotCommands.TodoTask.Unmark',
    'todo unmark': 'BotCommands.TodoTask.Unmark',
    'todo delete': 'BotCommands.TodoTask.Unmark',
}

module.exports = {
    commands_list,
}