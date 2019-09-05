const prettier = require("prettier");

module.exports = function (app) {
  app.on('pull_request', async function (context) {
    const config = prettier.resolveConfig.sync('prettifier.yml', {
      'config': '.github/prettifier.yml'
    }) || {};
    const commitMessage = config.commitMessage || 'Prettify Code';
    delete config.commitMessage;

    // Skip if change was due to a bot
    if (context.isBot) return;

    const owner = context.payload.pull_request.head.user.login;
    const repo = context.payload.pull_request.head.repo.name;
    const number = context.payload.number;

    const files = await context.github.paginate(
      context.github.pullRequests.getFiles({
        owner: owner,
        repo: repo,
        number: number,
      }), res => res.data);
    if (!files) return;
    console.log(files);

    for (let f = 0; f < files.length; f++) {
      const file = await context.github.repos.getContent({
        owner: owner,
        repo: repo,
        path: files[f].filename,
        ref: context.payload.pull_request.head.ref
      });
      if (!file) continue;

      // Pass in filename to let prettier deduce parser needed (using extension)
      config.filepath = files[f].filename;

      const fileContentsBase64 = file.data.content.trim();
      const fileContentsAscii = new Buffer(fileContentsBase64, 'base64').toString('ascii');
      const prettyFileContentsAscii = prettier.format(fileContentsAscii, config);
      const prettyFileContentsBase64 = new Buffer(prettyFileContentsAscii).toString('base64');

      // If already pretty, no update needed
      if (fileContentsAscii === prettyFileContentsAscii) continue;

      await context.github.repos.updateFile(context.repo({
        path: files[f].filename,
        message: commitMessage,
        content: prettyFileContentsBase64,
        sha: files[f].sha,
        branch: context.payload.pull_request.head.ref
      }));
    }
  });
};
