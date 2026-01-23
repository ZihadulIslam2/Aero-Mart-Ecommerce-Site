const Favorite = require('../../models/Favorite')

async function addFavorite(req, res) {
  try {
    const { productId } = req.body
    const userId = req.user?.id || req.body.userId

    if (!userId || !productId) {
      return res.status(400).json({ error: 'User and product required' })
    }

    const fav = await Favorite.findOneAndUpdate(
      { userId, productId },
      { userId, productId },
      { upsert: true, new: true }
    )

    res.json({ success: true, favorite: fav })
  } catch (err) {
    console.error('add favorite error', err)
    res.status(500).json({ error: 'Add favorite failed' })
  }
}

async function removeFavorite(req, res) {
  try {
    const { favoriteId } = req.params
    const userId = req.user?.id || req.body.userId

    if (!favoriteId) {
      return res.status(400).json({ error: 'Favorite ID required' })
    }

    await Favorite.findByIdAndDelete(favoriteId)
    res.json({ success: true })
  } catch (err) {
    console.error('remove favorite error', err)
    res.status(500).json({ error: 'Remove favorite failed' })
  }
}

async function getFavorites(req, res) {
  try {
    const userId = req.user?.id || req.query.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const favs = await Favorite.find({ userId }).populate('productId')
    res.json({ favorites: favs })
  } catch (err) {
    console.error('get favorites error', err)
    res.status(500).json({ error: 'Get favorites failed' })
  }
}

async function checkFavorite(req, res) {
  try {
    const { productId } = req.params
    const userId = req.user?.id || req.query.userId

    if (!userId || !productId) {
      return res.status(400).json({ error: 'User and product required' })
    }

    const fav = await Favorite.findOne({ userId, productId })
    res.json({ isFavorite: !!fav })
  } catch (err) {
    console.error('check favorite error', err)
    res.status(500).json({ error: 'Check favorite failed' })
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
}
