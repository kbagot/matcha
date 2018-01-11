var database = require('./config/database'),
    db = new database();
var controller = require('./request');

var User = function() {
    this.controller = new controller();
    this.name = "User";
};

module.exports = User;

