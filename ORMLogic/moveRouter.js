const { Move,Room,Player } = require('./model')
const { Router } = require('express')
const route = new Router()
const {updateStream} = require('../index')

route.post('/move', async (req, res) => {
  const { playerId, x, y, roomId } = req.body
  let room = await Room.findByPk(roomId,{include:[{model:Player}]})

  if(room.status==="started" && room.turn==playerId){
    await Move.create({playerId,x,y})
    const nextPlayer = room.players.find((player)=>player.id!=playerId)
    console.log('nextPlayer',nextPlayer)
    const room_modified = await room.update({turn:nextPlayer.id})
    console.log("see here",room_modified)
  }
  room = await Room.findByPk(roomId,{
    include: [{ model: Player, include: [ {model:Move} ] }]
  })
  res.send(room)
})

route.delete('/move/delete',async(req,res)=>{
  const {playerId} = req.body
  Move.delete({where:playerId})
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