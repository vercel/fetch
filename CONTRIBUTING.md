# Contributing

Read about our [Commitment to Open Source](https://vercel.com/oss).

Before jumping into a PR be sure to search [existing PRs](https://github.com/vercel/fetch/pulls) or [issues](https://github.com/vercel/fetch/issues) for an open or closed item that relates to your submission.

## Developing

The development branch is `main`. This is the branch that all pull
requests should be made against.

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Create a new branch:
   ```
   git checkout -b MY_BRANCH_NAME
   ```
3. Install yarn:
   ```
   npm install -g yarn
   ```
4. Install the dependencies with:
   ```
   yarn
   ```
5. Make changes and run tests using:
   ```
   yarn test
   ```

> This repo is powered by [Turborepo](https://turborepo.org/). Running commands such as `test`, `build`, and `lint` from the project root will utilize caching techniques to maximize developer productivity.

## Testing

Each package has its own approach to testing. They can be executed independantly or as a group using `turbo`.

The easiest way to run the complete test suite is to run `yarn test` from the root of this repository.

## Linting

> 🏗 Coming Soon!
