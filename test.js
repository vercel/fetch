const {createServer} =  require('http');
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
