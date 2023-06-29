const multer = require('multer')
const path = require('path')
const fs = require('fs/promises')
const Jimp = require('jimp')

const loginHandler = require('../auth/loginHandler')
const { userValidationSchema } = require('../models/user')
const {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserToken,
  updateUserAvatar,
  verifyUser,
  sendUserVerificationEmail
} = require('../services/users')

const storeImage = path.join(process.cwd(), 'tmp')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeImage)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
  limits: 1048576
})

const upload = multer({ storage })

const signup = async (req, res) => {
  const { error } = userValidationSchema.validate(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }
  try {
    const { password, email, subscription } = req.body
    const isEmailOccupied = await getUserByEmail(email)
    if (isEmailOccupied) {
      return res.status(409).send(`Email ${email} is already in use!`)
    }
    const user = await createUser(password, email, subscription)
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
    const token = await loginHandler(email, password)
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

const update =  upload.single('avatar'),
  async (req, res, next) => {
    try {
      const { email } = req.user
      const { path: temporaryName, originalname } = req.file
      const timestamp = Date.now()
      const datestamp = new Date(timestamp).toISOString().slice(0, 10)
      const fileName = path.join(
        storeImage,
`${email}-${datestamp}-${timestamp}-${originalname}`
      )
      await fs.rename(temporaryName, fileName)
      const img = await Jimp.read(fileName)
      await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName)
      const avatarURL = path.join(
        process.cwd(),
        'public/avatars',
				`${email}-${datestamp}-${timestamp}-${originalname}`
      )
      const cleanAvatarURL = avatarURL.replace(/\\/g, '/')
      const user = await updateUserAvatar(email, cleanAvatarURL)
      await fs.rename(
        fileName,
        path.join(
          process.cwd(),
          'public/avatars',
					`${email}-${datestamp}-${timestamp}-${originalname}`
        )
      )
      res.status(200).json(user)
    } catch (error) {
      next(error)
      return res.status(500).json({ message: 'Server error' })
    }
}
  



module.exports = {
  signup,
  verify,
  login,
  logout,
  current,
  update,
  send
 
  
}
