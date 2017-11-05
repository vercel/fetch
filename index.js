const { isIP } = require('net');
const { format, parse } = require('url');
const resolve = require('@zeit/dns-cached-resolve');

module.exports = setup;

function setup (fetch) {
  if (!fetch) {
    fetch = require('node-fetch');
  }

  async function fetchCachedDns(url, opts) {
    const parsed = parse(url);
    const ip = isIP(parsed.hostname);
    if (ip === 0) {
      if (!opts) opts = {};
      if (!opts.headers) opts.headers = {};
      if (!opts.headers.Host) {
        opts.headers.Host = parsed.host;
      }
      parsed.hostname = await resolve(parsed.hostname);
      url = format(parsed);
    }
    return fetch(url, opts);
  }

  for (const key of Object.keys(fetch)) {
    fetchCachedDns[key] = fetch[key];
  }

  fetchCachedDns.default = fetchCachedDns;

  return fetchCachedDns;
}
