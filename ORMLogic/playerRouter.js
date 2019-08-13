const {Player} = require('./model')
const { Router } = require('express')
const route = new Router()


route.get('/player', (req, res, next) =>
  Player.findAll()
    .then(players => res.json(players))
    .catch(error => next(error))
)

route.post('/player', (req, res, next) =>
  Player.create(req.body)
    .then(player => res.json(player))
    .catch(error => next(error))
    )

route.get('/player/:id', (req, res, next) =>
  Player.findByPk(req.params.id, { include: [Team] })
    .then(player => res.json(player))
      .catch(error => next(error))
    )


route.put(
  '/player/:id',
  (request, response, next) => {
    Player
      .findByPk(req.params.id)
      .then(player => player.update(request.body))
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
