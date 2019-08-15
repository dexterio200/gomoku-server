const { Move, Room, Player } = require('./model')
const { Router } = require('express')

//map user moves to an array of 8 direction according to the current falling piece
const mapUserMoveToArray = async (currentPlayerId, xCoord, yCoord) => {
  const moves = await Move.findAll({ where: { playerId: currentPlayerId } })
  const coordinates = moves.map(move => {
    return { x: parseInt(move.x), y: parseInt(move.y) }
  })
  //console.log('move test', coordinates)
  let horizentalForward = []
  let horizentalBackWard = []
  let verticalUpward = []
  let verticalDownward = []

  let diagonalLeftDownward = []
  let diagonalRightUpward = []
  let diagonalLeftUpward = []
  let diagonalRightDownward = []

  for (let i = 1; i < 5; i++) {
    horizentalBackWard.push(coordinates.some((coord) => coord.x === parseInt(xCoord) - i && coord.y === parseInt(yCoord)))
    horizentalForward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) + i && coord.y === parseInt(yCoord)))
    verticalUpward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) && coord.y === parseInt(yCoord) + i))
    verticalDownward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) && coord.y === parseInt(yCoord) - i))
    diagonalLeftDownward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) - i && coord.y === parseInt(yCoord) - i))
    diagonalRightUpward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) + i && coord.y === parseInt(yCoord) + i))
    diagonalLeftUpward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) - i && coord.y === parseInt(yCoord) + i))
    diagonalRightDownward.push(coordinates.some((coord) => coord.x === parseInt(xCoord) + i && coord.y === parseInt(yCoord) - i))
  }

  horizentalBackWard.reverse()
  horizentalBackWard.push(true)
  const horizental = horizentalBackWard.concat(horizentalForward)

  verticalDownward.reverse()
  verticalDownward.push(true)
  const verticle = verticalDownward.concat(verticalUpward)

  diagonalLeftDownward.reverse()
  diagonalLeftDownward.push(true)
  const diagonalFromBlToTr = diagonalLeftDownward.concat(diagonalRightUpward)

  diagonalLeftUpward.reverse()
  diagonalLeftUpward.push(true)
  const diagonalFromTlToBr = diagonalLeftUpward.concat(diagonalRightDownward)
  console.log('horizental', horizental, 'verticle', verticle, 'diagonalFromBlToTr',
    diagonalFromBlToTr, 'diagonalFromTlToBr', diagonalFromTlToBr)
  const y = consecutiveCheckOnWining([horizental, verticle, diagonalFromBlToTr, diagonalFromTlToBr])
  
}


const consecutiveCheckOnWining = (movesArrays) => {
  let win = true
  movesArrays.map((arrayOfMoves) => {
    for (let q = 0; q < 5; q++) {
      for (let i = q; i < 5 + q; i++) {
        win = win && arrayOfMoves[i]
      }
      
      if (win) return win
      else win = !win
    }
  })
  return movesArrays.some(a=>a.includes(true))
}

const checkOccupied = async (x, y, room) => {
  const { players } = room
  const moves = {}
  await players.map(playerId => {
    Move.findByPk(playerId)
  })
}

function factory(updateStream) {
  const router = new Router()
  router.post('/move', async (req, res) => {
    const { playerId, x, y, roomId } = req.body
    let room = await Room.findByPk(roomId, { include: [{ model: Player }] })

    if (room.status === "started" && room.turn == playerId) {
      await Move.create({ playerId, x, y })
      const nextPlayer = room.players.find((player) => player.id != playerId)
      await room.update({ turn: nextPlayer.id })
      if (mapUserMoveToArray(playerId, x, y)) {
        room.update({ winner: playerId, status: 'await', turn: null })
        // reinit board
        const players = await Player.findAll({ where: { roomId } })
        const ids = players.map(player => player.id)
        const count = await Move.destroy({ where: { playerId: ids } })
        res.send('Deleted', { count })
      }
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