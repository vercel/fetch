const setupFetchRetry = require('@zeit/fetch-retry');
const setupFetchCachedDns = require('@zeit/fetch-cached-dns');

module.exports = setup;

function setup(fetch) {
  if (!fetch) {
    fetch = require('node-fetch');
  }
  fetch = setupFetchCachedDns(fetch);
  fetch = setupFetchRetry(fetch);
  return fetch;
}
