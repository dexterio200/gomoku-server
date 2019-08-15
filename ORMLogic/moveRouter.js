const { Move, Room, Player } = require('./model')
const { Router } = require('express')

const winningValidation = (x, y) => {
  return false //to be implemented
}

// const checkOccupied = async (x, y, room) => {
//   const { players } = room
//   const moves
//  await players.map(playerId => { 
//      await Move.findByPk(playerId)
//    })
// }

function factory(updateStream) {
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
    try {
      const { playerId } = req.body
      const numOfRoomDeleted = await Move.destroy({ where: playerId })
      res.send(`${numOfRoomDeleted} record deleted`)
    } catch (err) {
      console.error(err)
      res.status(500).send('something wrong with removing move record')
    }
  })
  return router
}

module.exports = factory