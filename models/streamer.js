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
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  }
})

const Streamer = mongoose.model('streamer', streamer)

const streamerValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().required(),
  imageURL: Joi.string(),
  platform: Joi.string().required(),
  upvotes: Joi.number().integer().min(0),
  downvotes: Joi.number().integer().min(0)
})

module.exports = { Streamer, streamerValidationSchema }
