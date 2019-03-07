# fetch-retry [![CircleCI](https://circleci.com/gh/zeit/fetch-retry.svg?style=svg)](https://circleci.com/gh/zeit/fetch-retry)

A layer on top of `fetch` (via [node-fetch](https://www.npmjs.com/package/node-fetch))
with sensible defaults for retrying to prevent common errors.

## How to use

`fetch-retry` is a drop-in replacement for `fetch`:

```js
const fetch = require('@zeit/fetch-retry')(require('node-fetch'))

module.exports = async () => {
  const res = await fetch('http://localhost:3000')
  console.log(res.status);
}
```

Make sure to `yarn add @zeit/fetch-retry` in your main package.

Note that you can pass [retry options](https://github.com/zeit/async-retry) to using `opts.retry`.
We also provide a `opts.onRetry` which is a customized version of `opts.retry.onRetry` and passes
not only the `error` object in each retry but also the current `opts` object.

## Rationale

Some errors are very common in production (like the underlying `Socket`
yielding `ECONNRESET`), and can easily and instantly be remediated
by retrying.

The default behavior of `fetch-retry` is to attempt retries **10**, **50**
and **250** milliseconds (a total of 3 retires) after
a *network error* or *5xx* error occur.

The idea is to provide a sensible default: most applications should
continue to perform correctly with a worst case scenario of a given
request having an additional 250ms overhead. 

On the other hand, most applications that use `fetch-retry` instead of
vanilla `fetch` should see lower rates of common errors and fewer 'glitches'
in production.

## Tests

To run rests, execute

```console
npm test
```
