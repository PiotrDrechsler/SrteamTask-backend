const {
  listStreamers,
  getStreamerById,
  getStreamerByName,
  createStreamer,
  removeStreamer,
  updateStreamerCounter
} = require('../services/streamers')
const { streamerValidationSchema } = require('../models/Streamer')

const list = async (req, res) => {
  try {
    const streamers = await listStreamers()
    res.status(200).json(streamers)
  } catch {
    return res.status(500).send('Something went wrong')
  }
}

const create = async (req, res) => {
  const { error } = streamerValidationSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  try {
    const { name, description, platform } = req.body

    const existingStreamer = await getStreamerByName(name)
    if (existingStreamer) {
      return res.status(400).send('Given name already exists in the database. Try another one.')
    }

    const streamer = await createStreamer(name, description, platform)
    return res.status(200).json(streamer)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Something went wrong!')
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    if (id.length !== 24) {
      return res.status(400).send('Wrong id provided')
    }
    const streamer = await getStreamerById(id)
    if (!streamer) {
      return res.status(404).send('Streamer not found')
    }
    res.status(200).json(streamer)
  } catch {
    return res.status(500).send('Something went wrong')
  }
}

const remove = async (req, res) => {
  const { id } = req.params
  try {
    const removed = await removeStreamer(id)
    if (removed) {
      return res.status(200).send('Streamer deleted')
    } else {
      return res.status(404).send('Streamer not found')
    }
  } catch (err) {
    return res.status(500).send('Something went wrong')
  }
}

const vote = async (req, res) => {
  try {
    const { id } = req.params
    if (id.length !== 24) {
      return res.status(400).send('Wrong ID provided')
    }
    const streamer = await getStreamerById(id)
    if (!streamer) {
      return res.status(404).send('Streamer not found')
    }
    await updateStreamerCounter(id)
    const updatedStreamer = await getStreamerById(id)
    res.status(200).json(updatedStreamer)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Something went wrong')
  }
}

module.exports = { list, create, getById, remove, vote }
