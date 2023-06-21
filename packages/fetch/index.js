const { URLSearchParams, parse: parseUrl } = require('url');
const HttpAgent = require('agentkeepalive');
const debug = require('debug')('@vercel/fetch');
const setupFetchRetry = require('@vercel/fetch-retry');
const setupFetchCachedDns = require('@vercel/fetch-cached-dns');

const AGENT_OPTIONS = {
  maxSockets: 200,
  maxFreeSockets: 20,
  timeout: 60000,
  freeSocketTimeout: 30000,
  freeSocketKeepAliveTimeout: 30000, // free socket keepalive for 30 seconds
};

let defaultHttpGlobalAgent;
let defaultHttpsGlobalAgent;

function getDefaultHttpGlobalAgent(agentOpts) {
  return (defaultHttpGlobalAgent =
    defaultHttpGlobalAgent ||
    (debug('init http agent'), new HttpAgent(agentOpts)));
}

function getDefaultHttpsGlobalAgent(agentOpts) {
  return (defaultHttpsGlobalAgent =
    defaultHttpsGlobalAgent ||
    (debug('init https agent'), new HttpAgent.HttpsAgent(agentOpts)));
}

function getAgent(url, agentOpts) {
  return /^https/.test(url)
    ? getDefaultHttpsGlobalAgent(agentOpts)
    : getDefaultHttpGlobalAgent(agentOpts);
}

function setupVercelFetch(fetch, agentOpts = {}) {
  return async function vercelFetch(url, opts = {}) {
    if (!opts.agent) {
      // Add default `agent` if none was provided
      opts.agent = getAgent(url, { ...AGENT_OPTIONS, ...agentOpts });
    }

    opts.redirect = 'manual';
    opts.headers = new fetch.Headers(opts.headers);
    // Workaround for node-fetch + agentkeepalive bug/issue
    opts.headers.set('host', opts.headers.get('host') || parseUrl(url).host);

    // Convert Object bodies to JSON if they are JS objects
    if (
      opts.body &&
      !(opts.body instanceof URLSearchParams) &&
      typeof opts.body === 'object' &&
      !Buffer.isBuffer(opts.body)
    ) {
      opts.body = JSON.stringify(opts.body);
      opts.headers.set('Content-Type', 'application/json');
      opts.headers.set('Content-Length', Buffer.byteLength(opts.body));
    }

    // Check the agent on redirections
    opts.onRedirect = (res, redirectOpts) => {
      redirectOpts.agent = getAgent(res.headers.get('Location'));
    };

    try {
      debug('%s %s', opts.method || 'GET', url);
      return await fetch(url, opts);
    } catch (err) {
      err.url = url;
      err.opts = opts;
      throw err;
    }
  };
}

function setup(fetch, options) {
  if (!fetch) {
    fetch = require('node-fetch');
  }

  const fd = fetch.default;
  if (fd) {
    // combines "fetch.Headers" with "fetch.default" function.
    // workaround for "fetch.Headers is not a constructor"
    fetch = Object.assign((...args) => fd(...args), fd, fetch);
  }

  if (typeof fetch !== 'function') {
    throw new Error(
      "fetch() argument isn't a function; did you forget to initialize your `@vercel/fetch` import?",
    );
  }

  fetch = setupFetchCachedDns(fetch);
  fetch = setupFetchRetry(fetch);
  fetch = setupVercelFetch(fetch, options);
  return fetch;
}

module.exports = setup;
