let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');

class Controller {
    constructor(props) {
        console.log('trollrolol');
        let io = require('socket.io').listen(props);
        this.user = new user(props);
        this.register = new register();
        database.createConnection('matcha').then((res)=> {
            this.db = res;
            io.on('connection', async (socket) => {
                this.user.updateSocket(socket);
                this.socketEvents(socket);
            });
        });
        io.on('connection', async (socket) => {
            this.user.updateSocket(socket);
            database.createConnection('matcha').then((res) => {
                this.db = res;
                this.register.updateConnection({socket: socket, db: this.db});
                this.socketEvents(socket);
            }).catch((e) => console.log(e));
        });
    }


   socketEvents(socket) {
       socket.on('login', (res) => {
               this.user.dologin(res, this.db);
            }
        );

        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data));
        socket.on('validRegister', (data) => this.register.registerCheck(data));
    }
}

module.exports = Controller;