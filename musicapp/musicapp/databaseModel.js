var mongoose = require('mongoose');

module.exports = {
    User: mongoose.model('user', 
        {
            username : String,
            password : String
        })
};
