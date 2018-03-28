# fetch-cached-dns

A decorator on top of `fetch` that caches the DNS query of the `hostname` of the passed URL.

## How to use

```js
const fetch = require('fetch-cached-dns')(require('node-fetch'))
```

Since this implementation is implementing redirects we are providing an `onRedirect` extra 
option to the `fetch` call that gets called with the response object and the options that
will be used for the next request. This allows to access the request from outside and to
modify the options.

*NOTE: if the fetch implementation is not supplied, it will attempt to use peerDep `node-fetch`*
