/* eslint-env jest*/
const { createServer } = require('http')
const cachedDNSFetch = require('./index')()

test('works with localhost', async () => {
  const server = createServer((req, res) => {
    res.end('ha')
  })

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      const { port } = server.address()
      try {
        const res = await cachedDNSFetch(`http://127.0.0.1:${port}`)
        expect(await res.text()).toBe('ha')
        server.close()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
    server.on('error', reject)
  })
})
