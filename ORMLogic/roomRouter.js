const { Room, Message, Player, Move } = require('./model')
const { Router } = require('express')
const router = new Router()


function factory(updateStream) {
  router.post('/room', async (req, res, next) => {
    try {
      const { playerId, name, board_size } = req.body
      const player = await Player.findByPk(playerId)
      const room = await Room.create({
        name,
        board_size,
        status: 'await'
      })
      await player.update({ roomId: room.id }) //Update Room ID to database

      updateStream()

      console.log('room test:', room.dataValues)
      res.send(room)
    }
    catch (error) {
      console.error(error)
      res.json(error)
    }
  })

  router.put('/room/start/:id', async (req, res, next) => {
    const room = await Room.findByPk(req.params.id,
      {
        include:
          { model: Player }
      })
    if (room.players.length > 1 && room.status === 'await') {
      let firstPlayerToMove = ''
      Math.random() > 0.5 ? firstPlayerToMove = room.players[0].id : firstPlayerToMove = room.players[1].id
      await room.update({ status: 'started', turn: firstPlayerToMove })
      updateStream()
      res.send('Game Started')
    }
    else (res.send('cannot start game, not enough player joined'))
  }
  )

  router.put('/room/join/:id', async (req, res, next) => {
    const room = await Room.findByPk(req.params.id, {
      include:
        { model: Player }
    })
    const player = await Player.findByPk(req.body.playerId)
    if (room.players.length < 2 && room.status === 'await') {
      await player.update({ roomId: room.id })
      res.status(200).send(`Player ${player.playerName} joined`)
    }
    else {
      res.status(405).send('room is full or game started')
    }
    updateStream()
  })

  router.put('/room/leave/:id', async (req, res) => {
    const { playerId } = req.body
    //update room status
    const room = await Room.findByPk(req.params.id)
    await room.update({ turn: null, status: 'await' })
    //reinit board
    const players = await Player.findAll({ where: { roomId: room.id } })
    const ids = players.map(player => player.id)
    const count = await Move.destroy({ where: { playerId: ids } })
    //remove playerRoomId
    const player = await Player.findByPk(playerId)
    await player.update({ roomId: null })

    updateStream()

    res.send({ count })
  })


  router.delete('/room/delete/:id', async (req, res) => {
    await Room.destroy({ where: { id: req.params.id } })
      .then(number => {
        res.send(`${number} record delete`)
        updateStream()
      }
      )
      .catch(err => console.error(err))
  }
  )
  return router
}

module.exports = factory