const { createClient } = require('redis')

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let client
let connectingPromise = null

async function getRedisClient() {
  if (client?.isOpen) return client
  if (connectingPromise) return connectingPromise

  client = createClient({ url: REDIS_URL })
  connectingPromise = client
    .connect()
    .then(() => {
      console.log('Redis connected:', REDIS_URL)
      connectingPromise = null
      return client
    })
    .catch((err) => {
      console.warn('Redis connection failed:', err.message)
      connectingPromise = null
      return null
    })

  return connectingPromise
}

module.exports = { getRedisClient }
