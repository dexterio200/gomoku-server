const { Message, Room, Player } = require('./model')
const { Router } = require('express')


function factory (updateStream) {
const router = new Router()

router.post('/message', async (req, res) => {
  const { playerName, message, roomId } = req.body
  const text = await Message.create({ userName: playerName, text: message, roomId })
  res.json(text)
})

router.delete('/message/delete/:id', async (req, res) => {
  try {
    const message = await Message.destroy({ where: { roomId: req.params.id } })
    res.send(`Message of room ${req.params.id} is deleted`)
  } catch (err) {
    next(err)
    res.status(500).send(message)
  }
})
  return router
}

module.exports = factory