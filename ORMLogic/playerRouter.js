const { Player } = require('./model')
const { Router } = require('express')
const route = new Router()
const bcrypt = require('bcrypt')


route.get('/player', (req, res, next) =>
  Player.findAll()
    .then(players => res.json(players))
    .catch(error => next(error))
)

route.post('/player', async (req, res, next) => {
  try {
    let { playerName, password } = req.body
    password = bcrypt.hashSync(password, 10)
    const player = await Player.create({playerName, password})
    res.json(player)
  } catch (err) {
    res.send(err)
    next(err)
  }
})

route.get('/player/:id', (req, res, next) =>
  Player.findByPk(req.params.id)
    .then(player => res.json(player))
    .catch(error => next(error))
)

route.put(
  '/player/:id',
  (request, response, next) => {
    let { playerName, password } = request.body
    password = bcrypt.hashSync(request.body.password, 10)
    Player
      .findByPk(request.params.id)
      .then(player => player.update({ playerName, password }))
      .then(player => response.send(player))
      .catch(next)
  }
)

route.delete(
  '/player/:id',
  (request, response, next) => {
    Player
      .destroy({
        where: {
          id: request.params.id
        }
      })
      .then(number => number ? response.send('Row is deleted'
      ) : response.send('Something wrong'))
      .catch(next)
  }
)


module.exports = route
