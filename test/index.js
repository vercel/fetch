const assert = require('assert');
const toBuffer = require('raw-body');
const listen = require('async-listen');
const {createServer} = require('http');
const fetch = require('../index')();

exports.retriesUponHttp500 = async () => {
	let i = 0;
	const server = createServer((req, res) => {
		if (i++ < 2) {
			res.writeHead(500);
			res.end();
		} else {
			res.end('ha');
		}
	});
	await listen(server);
	const {port} = server.address();

	const res = await fetch(`http://127.0.0.1:${port}`);
	const resBody = await res.text();
	server.close();
	assert.equal(resBody, 'ha');
};

exports.worksWithHttps = async () => {
	const res = await fetch('https://vercel.com');
	assert.equal(res.headers.get('Server'), 'Vercel');
};

/**
 * We know that http://zeit.co redirects to https so we can use it
 * as a test to make sure that we switch the agent when the it
 * happens
 */
exports.switchesAgentsOnRedirect = async () => {
	const res = await fetch('http://vercel.com');
	assert.equal(res.url, 'https://vercel.com/');
};

exports.supportsBufferRequestBody = async () => {
	const server = createServer(async (req, res) => {
		const body = await toBuffer(req);
		assert(Buffer.isBuffer(body));
		assert.equal(body.toString(), 'foo');
		res.end(JSON.stringify({body: body.toString()}));
	});
	await listen(server);
	const {port} = server.address();

	const res = await fetch(`http://127.0.0.1:${port}`, {
		method: 'POST',
		body: Buffer.from('foo')
	});
	const body = await res.json();
	server.close();
	assert.deepEqual(body, {body: 'foo'});
};

exports.errorContext = async () => {
	let err;
	const url = `http://127.0.0.1/\u0019`;
	try {
		await fetch(url);
	} catch (_err) {
		err = _err;
	}
	assert(err);
	assert.equal(err.code, 'ERR_UNESCAPED_CHARACTERS');
	assert.equal(err.url, url);
	assert.equal(err.opts.redirect, 'manual');
};
