const express = require('express')
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require('../../controllers/shop/favorites-controller')

const router = express.Router()

router.post('/add', addFavorite)
router.delete('/remove/:favoriteId', removeFavorite)
router.get('/list', getFavorites)
router.get('/check/:productId', checkFavorite)

module.exports = router
