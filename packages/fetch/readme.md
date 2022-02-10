# @vercel/fetch

[![Build Status](https://github.com/vercel/fetch/workflows/Node%20CI/badge.svg)](https://github.com/vercel/fetch/actions?workflow=Node+CI)

Opinionated `fetch` optimized for use inside microservices. Bundles:

-   https://github.com/vercel/fetch-retry
-   https://github.com/vercel/fetch-cached-dns
-   https://github.com/node-modules/agentkeepalive

It automatically configures an `agent` via [agentkeepalive](https://github.com/node-modules/agentkeepalive),
if not provided, with the following settings:

| Name                         | Value |
| ---------------------------- | ----- |
| `maxSockets`                 | 200   |
| `maxFreeSockets`             | 20    |
| `timeout`                    | 60000 |
| `freeSocketKeepAliveTimeout` | 30000 |

## How to use

JavaScript

```js
const fetch = require('@vercel/fetch')(require('some-fetch-implementation'));
```

TypeScript

```typescript
import createFetch from '@vercel/fetch';
import * as fetch from 'some-fetch-implementation';
const fetch = createFetch(fetch);
```

If no fetch implementation is supplied, it will attempt to use peerDep `node-fetch`.
