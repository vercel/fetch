const retry = require('async-retry');
const debug = require('debug')('fetch-retry');

// retry settings
const MIN_TIMEOUT = 10;
const MAX_RETRIES = 5;
const FACTOR = 6;

module.exports = exports = setup;

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch');
  }

  async function fetchRetry(url, opts = {}) {
    const retryOpts = Object.assign({
      // timeouts will be [10, 60, 360, 2160, 12960]
      // (before randomization is added)
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

    try {
      return await retry(async (bail, attempt) => {
        const {method = 'GET'} = opts;
        try {
          // this will be retried
          const res = await fetch(url, opts);
          debug('status %d', res.status);
          if (res.status >= 500 && res.status < 600) {
            throw new ResponseError(res);
          } else {
            return res;
          }
        } catch (err) {
          const isRetry = attempt <= retryOpts.retries;
          debug(`${method} ${url} error (${err.status}). ${isRetry ? 'retrying' : ''}`, err);
          throw err;
        }
      }, retryOpts);
    } catch (err) {
      if (err instanceof ResponseError) {
        return err.res;
      }
      throw err;
    }
  }

  for (const key of Object.keys(fetch)) {
    fetchRetry[key] = fetch[key];
  }
  fetchRetry.default = fetchRetry;

  return fetchRetry;
}

class ResponseError extends Error {
  constructor(res) {
    super(res.statusText);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }

    this.name = this.constructor.name;
    this.res = res;

    // backward compat
    this.code = this.status = this.statusCode = res.status;
    this.url = res.url;
  }
}

exports.ResponseError = ResponseError;
