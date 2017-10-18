# fetch-cached-dns

A decorator on top of `fetch` that caches the DNS query of the `hostname` of the passed URL.

## How to use

```js
const fetch = require('fetch-cached-dns')(require('node-fetch'))
```

*NOTE: if the fetch implementation is not supplied, it will attempt to use `node-fetch`*
