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
       if (this.user && this.user.sess && this.user.sess.data){
           socket.emit('user', this.user.sess.data);
       }
       socket.on('login', (res) => {
               this.user.dologin(res, this.db);
            }
        );
        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data));
        socket.on('validRegister', (data) => this.register.registerCheck(data));
        socket.on('unmount', () => console.log("react unmount"));
    }

    updateSession(session){
        this.user.sess = session;
    }

}

module.exports = Controller;