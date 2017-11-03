# @zeit/fetch

Opinionated `fetch` optimized for use inside microservices. Bundles:

- https://github.com/zeit/fetch-retry
- https://github.com/zeit/fetch-cached-dns
- https://github.com/node_modules/agentkeepalive

It automatically configures an `agent` via [agentkeepalive](https://github.com/node_modules/agentkeepalive),
if not provided, with the following settings:

- `maxSockets` `200`
- `maxFreeSockets` `20`
- `timeout` `60000`
- `freeSocketKeepAliveTimeout` `30000`

## How to use

```js
const fetch = require('@zeit/fetch')(require('some-fetch-implementation'))
```

If no fetch implementation is supplied, it will attempt to use peerDep `node-fetch`.
