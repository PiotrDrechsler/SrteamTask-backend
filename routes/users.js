const express = require('express')

const { auth } = require('../auth/auth')
const userController = require('../controllers/users')

const router = express.Router()

router.post('/signup', userController.signup)

router.post('/verify', userController.verify)

router.get('/verify/:verificationToken', userController.send)

router.post('/login', userController.login)

router.get('/logout', auth, userController.logout)

router.get('/current', auth, userController.current)

router.patch('/avatars', auth, userController.update)

module.exports = router
