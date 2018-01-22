let database = require('./config/connect.js'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    user = require('./user.js');

class Controller {
    constructor(props) {
        let io = require('socket.io').listen(props);
        this.user = new user();
        console.log("constructor");
        // io.on('connection', async (socket) =>{
        //     database.createConnection('matcha').then((res) => {
        //         this.db = res;
        //         this.socketEvents(socket);
        //     }).catch((e) => console.log(e));
        // });
    }

    socketEvents(socket){
        console.log(this);
        socket.on('login', () => console.log('caca')
        );
    }
}

module.exports = Controller;