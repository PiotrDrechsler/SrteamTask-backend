const gravatar = require('gravatar')

const { Streamer } = require('../models/streamer.js')

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

const removeStreamer = async _id => {
  try {
    return Streamer.findByIdAndDelete({ _id })
  } catch (err) {
    console.log(err)
  }
}

const updateStreamer = async (_id, newContact) => {
  const updatedStreamer = await Streamer.findByIdAndUpdate(_id, newContact)
  return updatedStreamer
}

const updateStatusStreamer = async (_id, platform) => {
  const update = { platform }
  const updatedStreamer = await Streamer.findByIdAndUpdate(_id, update, {
    new: true
  })
  return updatedStreamer
}

module.exports = {
  listStreamers,
  getStreamerById,
  removeStreamer,
  createStreamer,
  updateStreamer,
  updateStatusStreamer
}
