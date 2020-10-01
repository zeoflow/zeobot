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

 module.exports = `This issue has been reopened because the **\`{{ keyword }}\`** comment still exists in [**{{ filename }}**](https://{{ githubHost }}/{{ owner }}/{{ repo }}/blob/{{ sha }}/{{ filename }}), as of {{ sha }}.

---

###### If this was not intentional, just remove the comment from your code. You can also set the [\`reopenClosed\`](https://github.com/JasonEtco/todo#configuring-for-your-project) config if you don't want this to happen at all anymore.`
