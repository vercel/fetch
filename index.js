const retry = require('async-retry');
const debug = require('debug')('fetch-retry');

// retry settings
const MIN_TIMEOUT = 10;
const MAX_RETRIES = 3;
const FACTOR = 5;

module.exports = setup;

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch');
  }

  function fetchRetry(url, opts = {}) {
    const retryOpts = Object.assign({
      // timeouts will be [ 10, 50, 250 ]
      minTimeout: MIN_TIMEOUT,
      retries: MAX_RETRIES,
      factor: FACTOR,
    }, opts.retry);

    if (opts.onRetry) {
      retryOpts.onRetry = error => {
        opts.onRetry(error, opts);
        if (opts.retry && opts.retry.onRetry) {
          opts.retry.onRetry(error);
        }
      }
    }

    return retry(async (bail, attempt) => {
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
    }, retryOpts)
  }

  for (const key of Object.keys(fetch)) {
    fetchRetry[key] = fetch[key];
  }
  fetchRetry.default = fetchRetry;

  return fetchRetry;
}
