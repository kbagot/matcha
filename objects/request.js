let database = require('./config/connect.js'),
    crypto = require('crypto'),
    user = require('./user.js');

class Controller {
    constructor(props) {
        let io = require('socket.io').listen(props);
        console.log("constructor");
        io.on('connection', async (socket) => {
            this.user = new user({socket: socket});
            database.createConnection('matcha').then((res) => {
                this.db = res;
                this.socketEvents(socket);
            }).catch((e) => console.log(e));
        });
    }

   socketEvents(socket) {
       socket.on('login', (res) => {
               this.user.dologin(res, this.db);
               console.log(this.user.data);
            }
        );
    }
}

module.exports = Controller;