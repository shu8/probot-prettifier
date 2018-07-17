/*jshint esversion:6*/
var beautify = require('js-beautify').js_beautify;

module.exports = function(app) {
    app.on('pull_request', async function(context) {
        const config = await context.config('prettifier.yml');

        if (context.payload.sender.type === 'Bot') return;

        let owner = context.payload.pull_request.head.user.login,
            repo = context.payload.pull_request.head.repo.name,
            number = context.payload.number;

        context.github.pullRequests.getFiles({
            owner: owner,
            repo: repo,
            number: number,
            per_page: 100
        }).then(function(files) {
            files = files.data;
            for (let f = 0; f < files.length; f++) {
                let filenameSplit = files[f].filename.split('.');

                if (filenameSplit[filenameSplit.length - 1] !== 'js') return; //not a JS file

                context.github.repos.getContent({
                    owner: owner,
                    repo: repo,
                    path: files[f].filename,
                    ref: context.payload.pull_request.head.ref
                }).then(function(file) {
                    let fileContentsBase64 = file.data.content.trim(),
                        fileContentsAscii = new Buffer(fileContentsBase64, 'base64').toString('ascii'),
                        prettyFileContentsAscii = config ? beautify(fileContentsAscii, config.js) : beautify(fileContentsAscii),
                        prettyFileContentsBase64 = new Buffer(prettyFileContentsAscii).toString('base64');

                    if (fileContentsAscii === prettyFileContentsAscii) return; //if already pretty, no update needed

                    context.github.repos.updateFile({
                        owner: owner,
                        repo: repo,
                        path: files[f].filename,
                        message: 'Prettify code',
                        content: prettyFileContentsBase64,
                        sha: files[f].sha,
                        branch: context.payload.pull_request.head.ref
                    });
                });
            }
        });
    });
};