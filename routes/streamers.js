const express = require('express')

const { auth } = require('../auth/auth')

const streamerController = require('../controllers/streamers')

const router = express.Router()

router.get('/', auth, streamerController.list)

router.post('/', auth, streamerController.create)

router.get('/:id', auth, streamerController.getById)

router.delete('/:id', auth, streamerController.remove)

router.put('/:id/vote', auth, streamerController.vote)

module.exports = router
