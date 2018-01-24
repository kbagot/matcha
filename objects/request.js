let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');

class Controller {
    constructor(props) {
        console.log('trollrolol');
        let io = require('socket.io').listen(props.server);
        io.on('connection', async (socket) => {
            this.user = new user({socket: socket, sess: props.sess});
            database.createConnection('matcha').then((res) => {
                this.register = new register({socket: socket, db: res});
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

        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data));
        socket.on('validRegister', (data) => this.register.registerCheck(data));
    }
}

module.exports = Controller;