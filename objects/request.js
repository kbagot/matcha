let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');
class Controller {
    constructor(props) {
        let io = require('socket.io').listen(props);

        console.log('trollrolol');
        this.sess = null;
        this.user = new user();
        this.register = new register();
        database.createConnection('matcha').then((res)=> {
            this.db = res;
            this.register.db = res;
            io.on('connection', async (socket) => {
                this.user.socket = socket;
                this.register.socket = socket;
                this.socketEvents(socket);
            });
        });
    }


   socketEvents(socket) {

       socket.on('login', (res) => {
           console.log(res);
               this.user.dologin(res, this.db);
               this.user.update_coords(res);
            }
        );
        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data));
        socket.on('validRegister', (data) => this.register.registerCheck(data));
    }

    updateSession(session){
        this.user.sess = session;
    }
}

module.exports = Controller;