# Prettifier

> A GitHub App built with [Probot](https://github.com/probot/probot) that automatically prettifies code in pull requests using [Prettier](https://prettier.io/).

## Usage

Install the app by visiting [the app page](https://github.com/apps/probot-prettifier). You can choose which repositories it will run on from the app settings page.

![Example commit history](https://user-images.githubusercontent.com/8850830/50480173-54ae4500-09d2-11e9-9197-e52fc2608d16.png)

## Config

Create a file `.github/prettifier.yml` with your config:

```
commitMessage: "Prettify Code"

printWidth: 100
tabWidth: 2
useTabs: false
semi: true
singleQuote: true
jsxBracketSameLine: true
jsxSingleQuote: false
trailingComma: "es5"
bracketSpacing: true
arrowParens: "avoid"
```

`commitMessage` defaults to `Prettify Code` but you can change this to whatever you want. 

The rest of the settings come from [Prettier's options](https://prettier.io/docs/en/options.html) which is what this app uses. Please refer to their documentation to find a full list and explanation of the options.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how Prettifier could be improved, or want to report a bug, open an issue! I'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2018 Shubham Jain <shu8@users.noreply.github.com>