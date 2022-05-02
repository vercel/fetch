const { createServer } = require('http');
const listen = require('async-listen').default;
const { dnsCachedUrl } = require('./util');
const cachedDNSFetch = require('./index')(require('node-fetch'));

/**
 * Using `localtest.me` to use DNS to resolve to localhost
 * http://readme.localtest.me/
 */

test('works with localtest.me', async () => {
  const server = createServer((req, res) => {
    res.end(JSON.stringify({ url: req.url, headers: req.headers }));
  });

  await listen(server);
  const { port } = server.address();

  try {
    const host = `localtest.me:${port}`;
    const res = await cachedDNSFetch(`http://${host}`);
    const body = await res.json();
    expect(res.url).toBe(`http://${host}/`);
    expect(res[dnsCachedUrl]).toBe(`http://127.0.0.1:${port}/`);
    expect(body.url).toBe(`/`);
    expect(body.headers.host).toBe(host);
  } finally {
    server.close();
  }
});

test('works with absolute redirects', async () => {
  const serverA = createServer((req, res) => {
    res.setHeader('Location', `http://localtest.me:${portB}`);
    res.statusCode = 302;
    res.end();
  });
  const serverB = createServer((req, res) => {
    // ensure the Host header is properly re-written upon redirect
    res.end(req.headers.host);
  });

  await listen(serverA);
  await listen(serverB);
  const portA = serverA.address().port;
  const portB = serverB.address().port;

  try {
    const res = await cachedDNSFetch(`http://localtest.me:${portA}`);
    expect(res.url).toBe(`http://localtest.me:${portB}/`);
    expect(res[dnsCachedUrl]).toBe(`http://127.0.0.1:${portB}/`);
    expect(await res.status).toBe(200);
    expect(await res.text()).toBe(`localtest.me:${portB}`);
  } finally {
    serverA.close();
    serverB.close();
  }
});

test('works with relative redirects', async () => {
  let count = 0;
  const server = createServer((req, res) => {
    if (count++ === 0) {
      res.setHeader('Location', `/foo`);
      res.statusCode = 302;
      res.end();
    } else {
      res.end(
        JSON.stringify({
          url: req.url,
          headers: req.headers,
        }),
      );
    }
  });
  await listen(server);
  const { port } = server.address();

  try {
    const host = `localtest.me:${port}`;
    const res = await cachedDNSFetch(`http://${host}`);
    expect(count).toBe(2);
    expect(res.url).toBe(`http://${host}/foo`);
    expect(res[dnsCachedUrl]).toBe(`http://127.0.0.1:${port}/foo`);
    expect(await res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe(`/foo`);
    expect(body.headers.host).toBe(host);
  } finally {
    server.close();
  }
});

test('works with `headers` as an Object', async () => {
  const server = createServer((req, res) => {
    res.end(req.headers['x-vercel']);
  });

  await listen(server);
  const { port } = server.address();

  try {
    const res = await cachedDNSFetch(`http://localtest.me:${port}`, {
      headers: {
        'X-Vercel': 'geist',
      },
    });
    expect(await res.text()).toBe('geist');
  } finally {
    server.close();
  }
});

test('works with `onRedirect` option to customize opts', async () => {
  let count = 0;

  const server = createServer((req, res) => {
    if (count === 0) {
      res.setHeader('Location', `/foo`);
      res.statusCode = 302;
      res.end();
    } else {
      res.end(req.url);
    }
    count++;
  });

  await listen(server);
  const { port } = server.address();

  try {
    const options = {
      onRedirect: jest.fn((res, opts) => {
        opts.randomOption = true;
      }),
    };

    await cachedDNSFetch(`http://localtest.me:${port}`, options);
    expect(options.onRedirect.mock.calls.length).toBe(1);
    const [res, opts] = options.onRedirect.mock.calls[0];
    expect(res.status).toEqual(302);
    expect(opts.headers).toBeDefined();
    expect(opts.randomOption).toBe(true);
  } finally {
    server.close();
  }
});
