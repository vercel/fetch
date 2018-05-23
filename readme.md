# @zeit/fetch

[![Build Status](https://circleci.com/gh/zeit/fetch.png?style=shield&circle-token=20150f42468743f4b8cfb803681cd9a1847ce3f8)](https://circleci.com/gh/zeit/fetch) [![Greenkeeper badge](https://badges.greenkeeper.io/zeit/fetch.svg?token=b9813f73d47ef14f79b674c7cb6a00cd0a2f209727843104247b1ac4a9252470&ts=1527108437557)](https://greenkeeper.io/)

Opinionated `fetch` optimized for use inside microservices. Bundles:

- https://github.com/zeit/fetch-retry
- https://github.com/zeit/fetch-cached-dns
- https://github.com/node-modules/agentkeepalive

It automatically configures an `agent` via [agentkeepalive](https://github.com/node-modules/agentkeepalive),
if not provided, with the following settings:

| Name                         | Value |
|------------------------------|-------|
| `maxSockets`                 | 200   |
| `maxFreeSockets`             | 20    |
| `timeout`                    | 60000 |
| `freeSocketKeepAliveTimeout` | 30000 |

## How to use

```js
const fetch = require('@zeit/fetch')(require('some-fetch-implementation'))
```

If no fetch implementation is supplied, it will attempt to use peerDep `node-fetch`.
