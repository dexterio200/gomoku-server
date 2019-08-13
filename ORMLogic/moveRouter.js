const { Move,Room, Player } = require('./model')
const { Router } = require('express')
const route = new Router()
const {stream} = require('../index')

route.post('/move', async (req, res) => {

  const { userId, x, y, roomId } = req.body
  const room = await Room.findByPk(roomId, {
    include: [{ model: Player, include: [{ model: Move }] }]
  })

  if(room.status==="started" && room.turn===userId){
    await Move.create(userId,x,y)
  }
  res.send(room)
  // updateStream(req,res)
})


const winningValidation=(x,y)=>{
    return false //to be implemented
}

module.exports = route

// const updateStream = (req, res) => {
//   const rooms = await Room.findAll({
//     include: [[Message], [Player]]
//   })
//   const data = JSON.stringify(rooms)
//   stream.updateInit(data)
//   stream.init(req, res)
// }