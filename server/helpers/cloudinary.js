const cloudinary = require('cloudinary').v2
const multer = require('multer')

cloudinary.config({
  cloud_name: 'dynsi60i4',
  api_key: '174991288653128',
  api_secret: '-1LxHtvKcvSk4xx6LzdMen10emE',
})

const storage = new multer.memoryStorage()

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: 'auto',
  })

  return result
}

const upload = multer({ storage })

module.exports = { upload, imageUploadUtil }
