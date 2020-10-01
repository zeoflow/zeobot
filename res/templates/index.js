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
