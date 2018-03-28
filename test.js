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

test('works with absolute redirects', async () => {
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

test('works with relative redirects', async () => {
  let count = 0
  const server = createServer((req, res) => {
    if (count === 0) {
      res.setHeader('Location', `/foo`)
      res.statusCode = 302
      res.end()
    } else {
      res.end(req.url)
    }
    count++
  })

  await listen(server)
  const { port } = server.address()

  const res = await cachedDNSFetch(`http://localtest.me:${port}`)
  expect(count).toBe(2)
  expect(await res.status).toBe(200)
  expect(await res.text()).toBe(`/foo`)

  server.close()
})

test('works with `headers` as an Object', async () => {
  const server = createServer((req, res) => {
    res.end(req.headers['x-zeit'])
  })

  await listen(server)
  const { port } = server.address()

  const res = await cachedDNSFetch(`http://localtest.me:${port}`, {
    headers: {
      'X-Zeit': 'geist'
    }
  })
  expect(await res.text()).toBe('geist')
  server.close()
})

test('works with `onRedirect` option to customize opts', async () => {
  let count = 0

  const server = createServer((req, res) => {
    if (count === 0) {
      res.setHeader('Location', `/foo`)
      res.statusCode = 302
      res.end()
    } else {
      res.end(req.url)
    }
    count++
  })

  await listen(server)
  const { port } = server.address()

  const options = {
    onRedirect: jest.fn((res, opts) => {
      opts.randomOption = true
    })
  }

  await cachedDNSFetch(`http://localtest.me:${port}`, options)
  expect(options.onRedirect.mock.calls.length).toBe(1)
  const [res, opts] = options.onRedirect.mock.calls[0]
  expect(res.status).toEqual(302)
  expect(opts.headers).toBeDefined()
  expect(opts.randomOption).toBe(true)

  server.close()
})
