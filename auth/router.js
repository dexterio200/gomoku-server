const { Router } = require('express')
const { toJWT, toData } = require('./jwt')
const router = new Router()
const { Player } = require('../ORMLogic/model')
const bcrypt = require('bcrypt')

router.post('/login', (req, res) => {
  //console.log('username', req.body.email, 'password', req.body.password)
  const { playerName, password } = req.body
  if (!playerName || !password) {
    res.status(400).send({
      message: 'Please provide a valid email and password'
    })
  }
  else {
    Player
      .findOne({
        where: {
          playerName: req.body.playerName
        }
      })
      .then(entity => {
        if (!entity) {
          res.status(400).send({
            message: 'User with that email does not exist'
          })
        }
        if (bcrypt.compareSync(req.body.password, entity.password)) {
          res.json({
            jwt: toJWT({ playerId: entity.id }),
            playerId: entity.id,
            playerName: entity.playerName
          })
        }
        else {
          res.status(400).send({
            message: 'Password was incorrect'
          })
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({
          message: 'Something went wrong'
        })
      })
  }
})


module.exports = router