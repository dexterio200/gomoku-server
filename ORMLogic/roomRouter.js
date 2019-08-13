const { Room, Message, Player } = require('./model')
const { Router } = require('express')
const router = new Router()
const {updateStream} = require('../index')

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

    const rooms = await Room.findAll({
      include: [Player]
    })

    updateStream(req, res)
    res.send(rooms)
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
  console.log(room)
  if (room.players.length > 1) {
    let firstPlayerToMove = ''
    Math.random() > 0.5 ? firstPlayerToMove = room.players[0].id : firstPlayerToMove = room.players[1].id
    await room.update({ status: 'started', turn: firstPlayerToMove })
    updateStream(req, res)
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
  console.log(room)
  const player = await Player.findByPk(req.body.playerId)
  if (room.players.length < 2 && room.status === 'await') {
    await player.update({ roomId:room.id })
    res.status(200).send(`Player ${player.playerName} joined`)
  }
  else {
    res.status(405).send('room is full or game started')
  }
})


router.delete('/room/delete/:id', async (req, res) => {
  await Room.destroy({ where: { id: req.params.id } })
    .then(number => {
      res.send(`${number} record delete`)
    }
    )
    .catch(err => console.error(err))
})

module.exports = router