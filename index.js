let fetch;

try {
  fetch = require('node-fetch');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND' && /node-fetch/.test(err.message)) {
    console.error('Could not find peer dependency `node-fetch`. ' +
      'Make sure it is installed: `yarn add node-fetch`');
  }
  throw err;
}

const retry = require('async-retry');
const debug = require('debug')('fetch-retry');

// retry settings
const MIN_TIMEOUT = 10;
const MAX_RETRIES = 3;
const FACTOR = 5;

const fetchRetry = (url, opts = {}, retryOpts) => (
  retry(async (bail, attempt) => {
    const {method = 'GET'} = opts;
    try {
      // this will be retried
      const res = await fetch(url, opts);
      debug('status %d', res.status);
      if (res.status >= 500 && res.status < 600) {
        const err = new Error(res.statusText);
        err.code = err.status = err.statusCode = res.status;
        err.url = url;
        throw err;
      } else {
        return res;
      }
    } catch (err) {
      debug(`${method} ${url} error (${err.status}). ${attempt < MAX_RETRIES ? 'retrying' : ''}`, err);
      throw err;
    }
  }, retryOpts || {
    // timeouts will be [ 10, 50, 250 ]
    minTimeout: MIN_TIMEOUT,
    retries: MAX_RETRIES,
    factor: FACTOR
  })
);

module.exports = fetchRetry;
