/*jshint esversion:6*/
const prettier = require("prettier");
module.exports = function (app) {
  app.on('pull_request', async function (context) {
    const config = prettier.resolveConfig.sync('prettifierV2.yml', {
      'config': '.github/prettifierV2.yml'
    }) || {};

    if (context.payload.sender.type === 'Bot') return;

    const owner = context.payload.pull_request.head.user.login;
    const repo = context.payload.pull_request.head.repo.name;
    const number = context.payload.number;

    const files = await context.github.pullRequests.getFiles({
      owner: owner,
      repo: repo,
      number: number,
      per_page: 100
    });
    if (!files) return;
    console.log(files);

    files = files.data;
    for (let f = 0; f < files.length; f++) {
      const file = await context.github.repos.getContent({
        owner: owner,
        repo: repo,
        path: files[f].filename,
        ref: context.payload.pull_request.head.ref
      });
      if (!file) continue;

      const fileContentsBase64 = file.data.content.trim();
      const fileContentsAscii = new Buffer(fileContentsBase64, 'base64').toString('ascii');
      const prettyFileContentsAscii = prettier.format(fileContentsAscii, config);
      const prettyFileContentsBase64 = new Buffer(prettyFileContentsAscii).toString('base64');

      // If already pretty, no update needed
      if (fileContentsAscii === prettyFileContentsAscii) continue;

      context.github.repos.updateFile({
        owner: owner,
        repo: repo,
        path: files[f].filename,
        message: '[ProbotPrettifier] Prettify code',
        content: prettyFileContentsBase64,
        sha: files[f].sha,
        branch: context.payload.pull_request.head.ref
      });
    }
  });
};