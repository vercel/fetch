const { HttpsAgent } = require('agentkeepalive');
const setupFetchRetry = require('@zeit/fetch-retry');
const setupFetchCachedDns = require('@zeit/fetch-cached-dns');

module.exports = setup;

let defaultGlobalAgent;

function getDefaultGlobalAgent() {
  return defaultGlobalAgent = defaultGlobalAgent || new HttpsAgent({
    maxSockets: 200,
    maxFreeSockets: 20,
    timeout: 60000,
    freeSocketKeepAliveTimeout: 30000 // free socket keepalive for 30 seconds
  });
}

function wrapDefaultGlobalAgent(fetch) {
  return /* async */ function fetchWithGlobalAgent(url, opts = {}, ...args) {
    opts.agent = opts.agent || getDefaultGlobalAgent();
    return fetch(url, opts, ...args);
  };
}

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch');
  }
  fetch = setupFetchCachedDns(fetch);
  fetch = setupFetchRetry(fetch);
  return fetch;
}
