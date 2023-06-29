const express = require('express')
const contactRouter = require('./streamers')
const usersRouter = require('./users')

const router = express.Router()

router.use('/api/streamers', contactRouter)
router.use('/api/users', usersRouter)

module.exports = router
