# fetch

Opinionated `fetch` optimized for use inside microservices. Bundles:

- https://github.com/zeit/fetch-retry
- https://github.com/zeit/fetch-cached-dns

## How to use

```js
const fetch = require('@zeit/fetch')(require('node-fetch'))
```

*NOTE: if the fetch implementation is not supplied, it will attempt to use peerDep `node-fetch`*
