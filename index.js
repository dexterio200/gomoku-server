const Sse = require('json-sse')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

const playerFactory = require('./ORMLogic/playerRouter')
const moveFactory = require('./ORMLogic/moveRouter')
const roomFactory = require('./ORMLogic/roomRouter')
const messageFactory = require('./ORMLogic/messageRouter')
const login = require('./auth/router')
const { Room, Player, Message, Move } = require('./ORMLogic/model')

const port = process.env.PORT || 5000
const app = express()

const stream = new Sse()

const updateStream = async () => {
  const rooms = await Room.findAll({
    include: [{
      model: Player,
      include: [Move]
    }, { model: Message }]
  })
  const data = JSON.stringify(rooms)
  stream.updateInit(data)
  stream.send(data)
}

const corsMiddleWare = cors()
const bodyParserMiddleWare = bodyParser.json()
app.use(corsMiddleWare)
app.use(bodyParserMiddleWare)
const moveRouter = moveFactory(updateStream)
const messageRouter = messageFactory(updateStream)
const playerRouter = playerFactory(updateStream)
const roomRouter = roomFactory(updateStream)
app.use(moveRouter)
app.use(messageRouter)
app.use(playerRouter)
app.use(roomRouter)
app.use(login)

app.get(
  '/stream',
  async (request, response) => {
    const rooms = await Room.findAll({
      include: [{
        model: Player,
        include: [Move]
      }, { model: Message }]
    })
    const data = JSON.stringify(rooms)
    stream.updateInit(data)
    stream.init(request, response)
  }
)

app.listen(port, _ => { console.log(`Server is listening on port ${port}`) })

console.log('updateStream test:', updateStream)

module.exports = updateStream

