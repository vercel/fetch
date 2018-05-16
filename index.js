const {parse: parseUrl} = require('url');
const HttpAgent = require('agentkeepalive');
const debug = require('debug')('@zeit/fetch');
const setupFetchRetry = require('@zeit/fetch-retry');
const setupFetchCachedDns = require('@zeit/fetch-cached-dns');

const {HttpsAgent} = HttpAgent;

const AGENT_OPTS = {
	maxSockets: 200,
	maxFreeSockets: 20,
	timeout: 60000,
	freeSocketKeepAliveTimeout: 30000 // free socket keepalive for 30 seconds
};

let defaultHttpGlobalAgent;
let defaultHttpsGlobalAgent;

function getDefaultHttpGlobalAgent() {
	return (defaultHttpGlobalAgent =
		defaultHttpGlobalAgent ||
		(debug('init http agent'), new HttpAgent(AGENT_OPTS)));
}

function getDefaultHttpsGlobalAgent() {
	return (defaultHttpsGlobalAgent =
		defaultHttpsGlobalAgent ||
		(debug('init https agent'), new HttpsAgent(AGENT_OPTS)));
}

function getAgent(url) {
	return /^https/.test(url)
		? getDefaultHttpsGlobalAgent()
		: getDefaultHttpGlobalAgent();
}

function setupZeitFetch(fetch) {
	return function zeitFetch(url, opts = {}) {
		if (!opts.agent) {
			// Add default `agent` if none was provided
			opts.agent = getAgent(url);
		}

		opts.redirect = 'manual';
		opts.headers = new fetch.Headers(opts.headers);
		// Workaround for node-fetch + agentkeepalive bug/issue
		opts.headers.set('host', opts.headers.get('host') || parseUrl(url).host);

		// Convert Object bodies to JSON
		if (opts.body && typeof opts.body === 'object' && !Buffer.isBuffer(opts.body)) {
			opts.body = JSON.stringify(opts.body);
			opts.headers.set('Content-Type', 'application/json');
			opts.headers.set('Content-Length', Buffer.byteLength(opts.body));
		}

		// Check the agent on redirections
		opts.onRedirect = (res, redirectOpts) => {
			redirectOpts.agent = getAgent(res.headers.get('Location'));
		};

		debug('%s %s', opts.method || 'GET', url);
		return fetch(url, opts);
	};
}

function setup(fetch) {
	if (!fetch) {
		fetch = require('node-fetch');
	}

	fetch = fetch.default || fetch

	if (typeof fetch !== 'function') {
		throw new Error(
			"fetch() argument isn't a function; did you forget to initialize your @zeit/fetch import?"
		);
	}

	fetch = setupFetchCachedDns(fetch);
	fetch = setupFetchRetry(fetch);
	fetch = setupZeitFetch(fetch);
	return fetch;
}

module.exports = setup;
