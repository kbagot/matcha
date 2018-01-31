let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');
let     os = require('os');
let chatUsers = [];

class Controller {
    constructor(props) {
        this.sess = {};
        this.user = new user();
        this.register = new register();
        database.createConnection('matcha').then((res)=> {
            this.db = res;
            this.register.db = res;
            });
    }


   async socketEvents(socket, io) {
       let sess = socket.handshake.session;

       if (sess.data) {
           this.triggerRefresh(io, socket, sess)
       }
       socket.on('chatUsers', () => console.log("hey"));
       socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, chatUsers, io));
       socket.on('locUp', (res) => this.user.update_coords(res, this.db, sess, socket)); // not sure of the place
       socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, chatUsers));
       socket.on('changeRegister', (data) => this.register.registerErrorHandling(data, socket));
       socket.on('validRegister', (data) => this.register.registerCheck(data, socket));
    }

    getServerIp(){
        return new Promise((resolve, reject) => {
            let res = os.networkInterfaces();
            for (let elem in res){
                res[elem].forEach((data) =>{
                    if (data.family === 'IPv4' && !data.internal){
                        resolve(data.address);
                    }
                });
            }
            reject('No ip Found');
        });
    }

    triggerRefresh(io, socket, sess){
        socket.emit('user', sess.data);
        this.user.updateUsers(sess.data.login, chatUsers)
            .then(() => io.emit('chatUsers', chatUsers))
            .catch(() => null);
    }

}


module.exports = Controller;