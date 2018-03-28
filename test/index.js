const { createServer } = require('http')
const fetch = require('../index')()

exports.retriesUponHttp500 = () => {
  let i = 0
  const server = createServer((req, res) => {
    if (i++ < 2) {
      res.writeHead(500)
      res.end()
    } else {
      res.end('ha')
    }
  })

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      const { port } = server.address()
      try {
        const res = await fetch(`http://127.0.0.1:${port}`)
        const resBody = await res.text()
        server.close()
        if (resBody === 'ha') {
          resolve()
        } else {
          reject(resBody)
        }
      } catch (err) {
        reject(err)
      }
    })
    server.on('error', reject)
  })
}

exports.worksWithHttps = async () => {
  const res = await fetch('https://zeit.co')
  const resText = await res.text()

  if (!resText.includes('Now')) {
    throw new Error("Doesn't work with https")
  }
}

exports.switchesAgentsOnRedirect = async () => {
  const server = createServer((req, res) => {
    res.writeHead(302, { Location: `https://127.0.0.1` })
    res.end('done')
  })

  return new Promise((resolve, reject) => {
    server.listen(async () => {
      const { port } = server.address()
      try {
        await fetch(`http://127.0.0.1:${port}`)
        server.close()
      } catch (err) {
        if (/SSL/.test(err.message)) {
          resolve()
        } else {
          reject(err)
        }
      }
    })
    server.on('error', reject)
  })
}
