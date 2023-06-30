const gravatar = require('gravatar')

const { Streamer } = require('../models/Streamer.js')

const listStreamers = async () => {
  const streamers = await Streamer.find()
  return streamers
}

const createStreamer = async (name, description, platform, imageURL) => {
  const createImage = gravatar.url(name, { d: 'robohash', s: '250' })
  const streamer = new Streamer({
    name,
    description,
    platform,
    imageURL: createImage
  })
  streamer.save()
  return streamer
}

const getStreamerById = async _id => {
  const streamer = await Streamer.findOne({ _id })
  return streamer
}

const getStreamerByName = async name => {
  const streamer = await Streamer.findOne({ name })
  return streamer
}

const removeStreamer = async _id => {
  try {
    return Streamer.findByIdAndDelete({ _id })
  } catch (err) {
    console.log(err)
  }
}

const updateStreamerCounter = async _id => {
  const updatedStreamer = await Streamer.findByIdAndUpdate(
    _id,
    { $inc: { counter: 1 } },
    { new: true }
  )

  return updatedStreamer
}

module.exports = {
  listStreamers,
  createStreamer,
  getStreamerById,
  getStreamerByName,
  removeStreamer,
  updateStreamerCounter
}
