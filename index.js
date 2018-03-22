const HttpAgent = require('agentkeepalive')
const debug = require('debug')('@zeit/fetch')
const setupFetchRetry = require('@zeit/fetch-retry')
const setupFetchCachedDns = require('@zeit/fetch-cached-dns')
const { parse: parseUrl } = require('url')

const { HttpsAgent } = HttpAgent

module.exports = setup

const AGENT_OPTS = {
  maxSockets: 200,
  maxFreeSockets: 20,
  timeout: 60000,
  freeSocketKeepAliveTimeout: 30000 // free socket keepalive for 30 seconds
}

let defaultHttpGlobalAgent
let defaultHttpsGlobalAgent

function getDefaultHttpGlobalAgent() {
  return (defaultHttpGlobalAgent =
    defaultHttpGlobalAgent ||
    (debug('init http agent'), new HttpAgent(AGENT_OPTS)))
}

function getDefaultHttpsGlobalAgent() {
  return (defaultHttpsGlobalAgent =
    defaultHttpsGlobalAgent ||
    (debug('init https agent'), new HttpsAgent(AGENT_OPTS)))
}

function setupZeitFetch(fetch) {
  return function zeitFetch(url, opts = {}, ...args) {
    // Add default `agent` if none was provided
    if (!opts.agent) {
      opts.agent = /^https/.test(url)
        ? getDefaultHttpsGlobalAgent()
        : getDefaultHttpGlobalAgent()
    }

    // Convert Object bodies to JSON
    if (opts.body && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body)
      opts.headers = new fetch.Headers(opts.headers)
      opts.headers.set('Content-Type', 'application/json')
      opts.headers.set('Content-Length', Buffer.byteLength(opts.body))
      // Workaround for node-fetch + agentkeepalive bug/issue
      opts.headers.set('host', parseUrl(url).host)
    } else {
      // Workaround for node-fetch + agentkeepalive bug/issue
      opts.headers = new fetch.Headers(opts.headers)
      opts.headers.set('host', parseUrl(url).host)
    }

    debug('%s %s', opts.method || 'GET', url)
    return fetch(url, opts, ...args)
  }
}

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch')
  }

  if (typeof fetch !== 'function') {
    throw new Error(
      "fetch() argument isn't a function; did you forget to initialize your @zeit/fetch import?"
    )
  }

  fetch = setupFetchCachedDns(fetch)
  fetch = setupFetchRetry(fetch)
  fetch = setupZeitFetch(fetch)
  return fetch
}
