const Joi = require('joi')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const streamer = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['Twitch', 'YouTube', 'TikTok', 'Kick', 'Rumble'],
    required: true
  },
  counter: {
    type: Number,
    default: 0
  }
})

const Streamer = mongoose.model('streamer', streamer)

const streamerValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().required(),
  imageURL: Joi.string(),
  platform: Joi.string()
    .valid('Twitch', 'YouTube', 'TikTok', 'Kick', 'Rumble')
    .required(),
  counter: Joi.number().integer().min(0)

})

module.exports = { Streamer, streamerValidationSchema }
