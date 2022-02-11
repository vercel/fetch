const assert = require('assert');
const {createServer} = require('http');
const AbortController = require('abort-controller');
const setup = require('./index');

const { ResponseError } = setup;
const retryFetch = setup();

test('retries upon 500', async () => {
  let i = 0
  const server = createServer((req, res) => {
    if (i++ < 2) {
      res.writeHead(500);
      res.end();
    } else {
      res.end('ha');
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      try {
        const {port} = server.address();
        const res = await retryFetch(`http://127.0.0.1:${port}`);
        expect(await res.text()).toBe('ha');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
    server.on('error', reject);
  });
});

test('resolves on >MAX_RETRIES', async () => {
  const server = createServer((req, res) => {
    res.writeHead(500);
    res.end();
  });

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      try {
        const {port} = server.address();
        const res = await retryFetch(`http://127.0.0.1:${port}`, {
          retry: {
            retries: 3
          }
        });
        expect(res.status).toBe(500);
        return resolve();
      } finally {
        server.close();
      }
    });
    server.on('error', reject);
  });
});

test('accepts a custom onRetry option', async () => {
  const server = createServer((req, res) => {
    res.writeHead(500);
    res.end();
  });

  return new Promise((resolve, reject) => {
    const opts = {
      onRetry: jest.fn(),
      retry: {
        retries: 3
      }
    }

    server.listen(async () => {
      try {
        const {port} = server.address();
        const res = await retryFetch(`http://127.0.0.1:${port}`, opts);
        expect(opts.onRetry.mock.calls.length).toBe(3);
        expect(opts.onRetry.mock.calls[0][0]).toBeInstanceOf(ResponseError);
        expect(opts.onRetry.mock.calls[0][1]).toEqual(opts);
        expect(res.status).toBe(500);
        return resolve();
      } finally {
        server.close();
      }
    });
    server.on('error', reject);
  });
})

test('handles the Retry-After header', async () => {
  const server = createServer((req, res) => {
    res.writeHead(429, { 'Retry-After': 1 });
    res.end();
  });

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      const {port} = server.address();
      try {
        const startedAt = Date.now();
        const res = await retryFetch(`http://127.0.0.1:${port}`, {
          retry: {
            minTimeout: 10,
            retries: 1
          }
        });
        expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1010);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
    server.on('error', reject);
  });
});

test('stops retrying when the Retry-After header exceeds the maxRetryAfter option', async () => {
  const server = createServer((req, res) => {
    res.writeHead(429, { 'Retry-After': 21 });
    res.end();
  });

  return new Promise((resolve, reject) => {
    const opts = {
      onRetry: jest.fn(),
    }

    server.listen(async () => {
      const {port} = server.address();
      try {
        const startedAt = Date.now();
        const res = await retryFetch(`http://127.0.0.1:${port}`, opts);
        expect(opts.onRetry.mock.calls.length).toBe(0);
        expect(res.status).toBe(429);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
    server.on('error', reject);
  });
});

test.skip('stops retrying when fetch throws `ERR_UNESCAPED_CHARACTERS` error', async () => {
  const opts = {
    onRetry: jest.fn(),
  }

  let err;
  try {
    await retryFetch(`http://127.0.0.1/\u0019`, opts);
  } catch (_err) {
    err = _err;
  }

  assert(err);
  assert.equal(err.message, 'Request path contains unescaped characters');
  assert.equal(opts.onRetry.mock.calls.length, 0);
});

test("don't retry if the request was aborted after timeout", async () => {
  const timeout = 50;
  const responseAfter = 100;
  const server = createServer((req, res) => {
    setTimeout(() => {
      res.end('ha');
    }, responseAfter);
  });

  const controller = new AbortController();
  const timeoutHandler = setTimeout(() => {
    controller.abort();
  }, timeout);

  const opts = {
    onRetry: jest.fn(),
    signal: controller.signal,
  };

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      try {
        const { port } = server.address();
        await retryFetch(`http://127.0.0.1:${port}`, opts);
        resolve();
      } catch (err) {
        expect(opts.onRetry.mock.calls.length).toBe(0);
        resolve();
      } finally {
        server.close();
        clearTimeout(timeoutHandler);
      }
    });
    server.on('error', reject);
  });
});
