const { User, hashPassword } = require('../models/user')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

const serviceSecret = process.env.MAIL_SERVICE_SECRET
const userSecret = process.env.MAIL_USER_SECRET
const passSecret = process.env.MAIL_PASS_SECRET

const createUser = async (password, email, token) => {
  try {
    const hashedPassword = hashPassword(password)

    const user = new User({
      password: hashedPassword,
      email,
      verify: false,
      verificationToken: uuidv4(),
      token
    })

    await user.save()

    await sendUserVerificationEmail(user.email, user.verificationToken)

    return user
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getAllUsers = async () => {
  const users = await User.find()
  return users
}

const getUserById = async (_id) => {
  const user = await User.findOne({ _id })
  return user
}

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email })
  return user
}

const addUserToken = async (id, token) => {
  return User.findByIdAndUpdate(id, { token })
}

const updateUserToken = async (_id) => {
  return User.findOneAndUpdate(_id, { token: null })
}

const verifyUser = async (verificationToken) => {
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verify: true, verificationToken: null },
    { new: true }
  )
  return user
}

const sendUserVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: serviceSecret,
      auth: {
        user: userSecret,
        pass: passSecret
      }
    })

    const html = `
      <div>
        <h1>Hello There!</h1>
        <p>Please click <a href="http://localhost:3030/api/users/verify/${verificationToken}">here</a> to verify your account.</p>
        <p>Thank you for your support!</p>
      </div>
    `

    const info = await transporter.sendMail({
      from: { name: 'Piotr', address: 'example@example.com' },
      to: email,
      subject: 'Stream Task - Verify your account',
      html
    })

    if (info.rejected.length > 0) {
      throw new Error('Email does not exist')
    }

    const previewUrl = nodemailer.getTestMessageUrl(info)
    console.log(previewUrl)
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  addUserToken,
  updateUserToken,
  getUserByEmail,
  verifyUser,
  sendUserVerificationEmail
}
