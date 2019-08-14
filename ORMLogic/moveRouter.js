const { Move, Room, Player } = require('./model')
const { Router } = require('express')

const winningValidation = (x, y) => {
  return false //to be implemented
}

function factory (updateStream) {
  const router = new Router()

  router.post('/move', async (req, res) => {
    const { playerId, x, y, roomId } = req.body
    let room = await Room.findByPk(roomId, { include: [{ model: Player }] })

    if (room.status === "started" && room.turn == playerId) {
      await Move.create({ playerId, x, y })
      const nextPlayer = room.players.find(
        (player) => player.id != playerId)
      await room.update({ turn: nextPlayer.id })
    }
    room = await Room.findByPk(roomId, {
      include: [{ model: Player, include: [{ model: Move }] }]
    })
    updateStream()
    res.send(room)
  })

  router.delete('/move/delete', async (req, res) => {
    const { playerId } = req.body
    Move.delete({ where: playerId })
  })
  return router
}

module.exports = factory