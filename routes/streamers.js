const express = require('express')

const { auth } = require('../auth/auth')
const {
  listStreamers,
  getStreamerById,
  createStreamer,
  removeStreamer,
  updateStreamer,
  updateStatusStreamer
} = require('../controllers/streamers')
const { streamerValidationSchema } = require('../models/streamer')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await listStreamers()
    res.status(200).json(contacts)
  } catch {
    return res.status(500).send('Something went wrong')
  }
})

router.post('/', auth, async (req, res) => {
  const { error } = streamerValidationSchema.validate(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }
  try {
    const { name, description, platform } = req.body
    const streamer = await createStreamer(name, description, platform)
    return res.status(200).json(streamer)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Something went wrong!')
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    if (id.length !== 24) {
      return res.status(400).send('Wrong id provided')
    }
    const contact = await getStreamerById(id)
    if (!contact) {
      return res.status(404).send('Contact not found')
    }
    res.status(200).json(contact)
  } catch {
    return res.status(500).send('Something went wrong')
  }
})

router.delete('/:id', auth, async (req, res) => {
  const contactId = req.params.id
  try {
    const removed = await removeStreamer(contactId)
    if (removed) {
      return res.status(200).send('Contact deleted')
    } else {
      return res.status(404).send('Contact not found')
    }
  } catch (err) {
    return res.status(500).send('Something went wrong')
  }
})

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).send('Id is required to perform update')
  }
  const { error } = streamerValidationSchema.validate(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }
  const contact = getStreamerById(id)
  if (!contact) {
    return res.status(404).send('Contact not found')
  }
  try {
    updateStreamer(id, req.body)
    return res.status(200).send('Contact sucessfully updated!')
  } catch {
    return res.status(500).send('Something went wrong!')
  }
})

router.patch('/:contactId/favorite', auth, async (req, res) => {
  try {
    const { contactId: _id } = req.params
    const { favorite } = req.body
    if (favorite === undefined) {
      return res.status(400).send('Missing field favorite')
    }
    const favoriteValue = Boolean(favorite)
    const updatedContact = await updateStatusStreamer(_id, favoriteValue)
    return res.status(200).send(updatedContact)
  } catch (err) {
    return res.status(404).send('Contact not found')
  }
})

module.exports = router
