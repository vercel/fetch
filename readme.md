# Fetch Monorepo

This is the official Vercel fetch monorepo

## Getting Started

There are a variety of ways to use these packages. The core package `@vercel/fetch` bundles the remaining packages together into a super powered [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) client. By default this package will use its peer dependency [node-fetch](https://github.com/node-fetch/node-fetch), but it also supports other fetch implementations.

```js
// Basic Usage
import fetch from '@vercel/fetch';
```

```js
// Bring your own fetch implementation
import createFetch from '@vercel/fetch';
import fetchImpl from 'some-fetch-implementation';
const fetch = createFetch(fetchImpl);
```

## Contributing

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md)

## Code of Conduct

Please see our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
