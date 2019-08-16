const Sequelize = require('sequelize')
const db = require('../db')


const Player = db.define('player', {
  playerName: {type:Sequelize.STRING, unique: true},
  password: Sequelize.STRING
})

const Room = db.define('room', {
  name: {type:Sequelize.STRING,unique:true},
  board_size: Sequelize.INTEGER,
  status: Sequelize.STRING,
  turn: Sequelize.INTEGER,
  winner: Sequelize.INTEGER
})

const Message = db.define('message', {
  userName: Sequelize.STRING,
  text: Sequelize.STRING
})

const Move = db.define('move',{
  x:Sequelize.INTEGER,
  y:Sequelize.INTEGER
})

Message.belongsTo(Room)
Room.hasMany(Message)
Player.belongsTo(Room)
Room.hasMany(Player)
Move.belongsTo(Player)
Player.hasMany(Move)

module.exports = { Player, Room, Message, Move }