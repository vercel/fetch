# Fetch Monorepo

This fetch monorepo contains three packages:

- `@vercel/fetch`
- `@vercel/fetch-retry`
- `@vercel/fetch-cached-dns`

These packages are recommended to be used in Node.js environments. It aims to bring the familiarity of the Fetch API to the backend. There are future plans to make this project interoperable between both browser and server environments.

## Getting Started

`@vercel/fetch` bundles all packages inside this monorepo together into a super-powered [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) client. By default, this package will use its peer dependency [node-fetch](https://github.com/node-fetch/node-fetch), but it also supports other fetch implementations.

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
