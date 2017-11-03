const HttpAgent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const setupFetchRetry = require('@zeit/fetch-retry')
const setupFetchCachedDns = require('@zeit/fetch-cached-dns')
const debug = require('debug')('@zeit/fetch')

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

function wrapDefaultGlobalAgent(fetch) {
  return /* async */ function fetchWithGlobalAgent(url, opts = {}, ...args) {
    opts.agent =
      opts.agent ||
      (/^https/.test(url)
        ? getDefaultHttpsGlobalAgent()
        : getDefaultHttpGlobalAgent())
    return fetch(url, opts, ...args)
  }
}

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch')
  }
  fetch = setupFetchCachedDns(fetch)
  fetch = setupFetchRetry(fetch)
  fetch = wrapDefaultGlobalAgent(fetch)
  return fetch
}
