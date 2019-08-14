const Sse = require('json-sse')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const playerRouter = require('./ORMLogic/playerRouter')
const moveRouter = require('./ORMLogic/moveRouter')
const login = require('./auth/router')
const roomRouter= require('./ORMLogic/roomRouter')
const messageRouter = require('./ORMLogic/messageRouter')
const { Room, Player, Message, Move } = require('./ORMLogic/model')

const port = process.env.PORT || 5000
const app = express()

const corsMiddleWare = cors()
const bodyParserMiddleWare = bodyParser.json()
app.use(corsMiddleWare)
app.use(bodyParserMiddleWare)
app.use(messageRouter)
app.use(playerRouter)
app.use(roomRouter)
app.use(moveRouter)
app.use(login)


const stream = new Sse()

app.get(
  '/stream',
  async (request, response) => {
    const rooms = await Room.findAll({
      include: [{
        model: Player,
        include: [Move]
      },{model:Message}]
    })
    const data = JSON.stringify(rooms)
    stream.updateInit(data)
    stream.init(request, response)
  }
)

 async function updateStream(){
  const rooms = await Room.findAll({
    include: [{
      model: Player,
      include: [Move]
    },{model:Message}]
  })
  const data = JSON.stringify(rooms)
  stream.updateInit(data)
  stream.send(data)
}

app.listen(port, _ => { console.log(`Server is listening on port ${port}`) })

module.exports = {updateStream}

