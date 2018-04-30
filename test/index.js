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

/**
 * We know that http://zeit.co redirects to https so we can use it
 * as a test to make sure that we switch the agent when the it
 * happens
 */
exports.switchesAgentsOnRedirect = async () => fetch(`http://zeit.co`)
