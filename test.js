/* eslint-env jest*/
const listen = require('async-listen')
const { createServer } = require('http')
const cachedDNSFetch = require('./index')(require('node-fetch'))

/**
 * Using `localtest.me` to use DNS to resolve to localhost
 * http://readme.localtest.me/
 */

test('works with localtest.me', async () => {
  const server = createServer((req, res) => {
    res.end('ha')
  })

  await listen(server)
  const { port } = server.address()

  const res = await cachedDNSFetch(`http://localtest.me:${port}`)
  expect(await res.text()).toBe('ha')
  server.close()
})

test('works with redirects', async () => {
  let portA
  let portB

  const serverA = createServer((req, res) => {
    res.setHeader('Location', `http://localtest.me:${portB}`)
    res.statusCode = 302
    res.end()
  })
  const serverB = createServer((req, res) => {
    // ensure the Host header is properly re-written upon redirect
    res.end(req.headers.host)
  })

  await listen(serverA)
  await listen(serverB)
  portA = serverA.address().port
  portB = serverB.address().port

  const res = await cachedDNSFetch(`http://localtest.me:${portA}`)
  expect(await res.status).toBe(200)
  expect(await res.text()).toBe(`localtest.me:${portB}`)

  serverA.close()
  serverB.close()
})
