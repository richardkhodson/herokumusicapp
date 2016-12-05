var express = require('express');
var router = express.Router();
var User = require('../databaseModel.js').User;

/* GET users listing. */
router.post('/login', function(req, res) {
  User.findOne({username: req.body.username}, function(err, user) {
    if(err) {
      res.status(400).send('Invalid Request');
    }
    else if(user === null ) {
      User.create(req.body, function(err, newUser) {
        res.json(newUser);
      });
    }
    else if(user.password !== req.body.password) {
      res.status(400).send('You have provided an incorrect Password');
    }
    else {
      res.json(user);
    }
  });
});

module.exports = router;
