const { Room, Message, Player } = require('./model')
const { Router } = require('express')
const router = new Router()
const { stream } = require('../index')

router.post('/room', (req, res, next) => {
  try {
    const { userId, name, board_size } = req.body
    const player = Player.findByPk(userId)
    const room = await Room.create({
      name,
      board_size,
      status: 'await'
    })

    player.update({ roomId: room.id }) //Update Room ID to database

    const rooms = await Room.findAll({
      include: [[Message], [Player]]
    })

    const data = JSON.stringify(rooms)
    stream.updateInit(data)
    stream.init(req, res)
    response.send(room)
  }
  catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

router.put('/room/start:id', (req, res, next) => {
  const room = await Room.findByPk(req.param.id)
  if (room.Player.length > 1) {
    const firstPlayerToMove = ''
    Math.random() > 0.5 ? firstPlayerToMove = room.Player[0].id : firstPlayerToMove = room.Player[1].id
    await room.update({ status: 'started', turn: firstPlayerToMove })
    updateStream(req, res)
    res.send('Game Started')
  }
  else (res.send('cannot start game, not enough player joined'))
}
)

router.put('/room/join:id', (req, res, next) => {
  const room = await Room.findByPk({ where: id === req.param.id })
  const player = await Player.findByPk(req.body.id)
  if (room.Player.length < 2 && room.status === 'await') {
    await player.update({ roomId })
  }
  else {
    res.status(405).send('room is full or game started')
  }
  updateStream(req, res)
})


router.delete('/room/delete:id', (req, res) => {
  Room.destory({ where: { id: req.param.id } })
    .then(number => {
      res.send(`${number} record delete`)
    }
    )
    .catch(err => console.error(err))
})

const updateStream = (req, res) => {
  const rooms = await Room.findAll({
    include: [[Message], [Player]]
  })
  const data = JSON.stringify(rooms)
  stream.updateInit(data)
  stream.init(req, res)
}

module.exports = router