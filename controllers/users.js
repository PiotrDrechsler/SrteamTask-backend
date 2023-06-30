const loginHandler = require('../auth/loginHandler')
const { userValidationSchema } = require('../models/User')
const {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserToken,
  verifyUser,
  sendUserVerificationEmail
} = require('../services/users')

const signup = async (req, res) => {
  const { error } = userValidationSchema.validate(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }
  try {
    const { password, email } = req.body
    const isEmailOccupied = await getUserByEmail(email)
    if (isEmailOccupied) {
      return res.status(409).send(`Email ${email} is already in use!`)
    }
    const user = await createUser(password, email)
    return res.status(201).json(user)
  } catch (err) {
    return res.status(500).send('Something went wrong POST!')
  }
}

const verify = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).send('Missing required filed mail')
  }
  try {
    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(404).send('User not found')
    }
    if (user.verify) {
      return res.status(400).send('Verification has already been passed')
    }
    await sendUserVerificationEmail(user.email, user.verificationToken)
    res.status(200).send('Verification email sent')
  } catch (err) {
    return res.status(500).send('Server error')
  }
}

const send = async (req, res, next) => {
  try {
    const { verificationToken } = req.params
    const user = await verifyUser(verificationToken)

    if (user) {
      return res.status(200).json({ message: 'Verification successful' })
    } else {
      return res.status(404).json({ message: 'Send verification link again' })
    }
  } catch (error) {
    next(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send('Email and password are required')
  }
  const user = await getUserByEmail(email)
  if (!user) {
    return res.status(400).send('User not found!!!')
  }
  if (!user.verify) {
    return res
      .status(401)
      .send(
        'Account is not verified. Please verify your account before logging in.'
      )
  }
  try {
    const token = await loginHandler(res, email, password)
    return res.status(200).send(token)
  } catch (err) {
    return res.status(401).send('Email or password is wrong')
  }
}

const logout = async (req, res) => {
  try {
    const { _id } = await req.user
    const user = await getUserById({ _id })
    if (!user) {
      return res.status(401).send('Not authorized')
    }
    await updateUserToken(_id)
    res.cookie(null)
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}

const current = async (req, res, next) => {
  const { id } = req.user
  const user = await getUserById(id)
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' })
  } else {
    const userData = {
      email: user.email
    }
    res.status(200).json(userData)
  }
}

module.exports = {
  signup,
  verify,
  login,
  logout,
  current,
  send
}
