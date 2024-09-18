const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
// connect to db
mongoose
  .connect('mongodb+srv://zihadul708:01882343242@nodetuts.xnfrv.mongodb.net/')
  .then(() => console.log('Mongodb Connect'))
  .catch((error) => console.log(error))

const app = express()

const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: 'http://localhost:5173/',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],

    allowedHeaders: [
      'Content-Type',
      'Athorization',
      'Cache-control',
      'Expires',
      'Pragma',
    ],
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
