const {createServer} =  require('http');
const retryFetch = require('./index')();

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
      const {port} = server.address();
      try {
        const res = await retryFetch(`http://127.0.0.1:${port}`);
        expect(await res.text()).toBe('ha');
        server.close();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    server.on('error', reject);
  });
});

test('fails on >MAX_RETRIES', async () => {
  const server = createServer((req, res) => {
    res.writeHead(500);
    res.end();
  });

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      const {port} = server.address();
      try {
        await retryFetch(`http://127.0.0.1:${port}`);
      } catch (err) {
        expect(await err.status).toBe(500);
        server.close();
        return resolve();
      }
      reject(new Error('must fail'));
    });
    server.on('error', reject);
  });
});
