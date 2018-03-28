# fetch-cached-dns

A decorator on top of `fetch` that caches the DNS query of the `hostname` of the passed URL.

## How to use

```js
const fetch = require('fetch-cached-dns')(require('node-fetch'))
```

Since this implementation is implementing redirects we are providing an `onRedirect` extra 
option to the `fetch` call that allows one to customize the redirect options just before it
happens.

*NOTE: if the fetch implementation is not supplied, it will attempt to use peerDep `node-fetch`*
