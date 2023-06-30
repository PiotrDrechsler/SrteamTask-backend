const bcrypt = require('bcrypt')

const { getUserByEmail, addUserToken } = require('../services/users')
const issueToken = require('./issueToken')

const cookieParams = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: 604800000 // 7 days
}

const loginHandler = async (res, email, incomingPassword) => {
  const user = await getUserByEmail(email)
  const userPassword = user.password
  const result = bcrypt.compareSync(incomingPassword, userPassword)
  if (result) {
    const token = issueToken(user)
    res.cookie('token', token, cookieParams)
    await addUserToken(user._id, token)
    return token
  } else {
    throw new Error('Invalid credentials')
  }
}

module.exports = loginHandler
