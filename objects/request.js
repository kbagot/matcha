let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');
let     os = require('os');

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


   socketEvents(socket) {
       // if (this.user && this.user.sess && this.user.sess.data){
       //     socket.emit('user', this.user.sess.data);
       // }
       let sess = socket.handshake.session;
       if (sess.data) {
           socket.emit('user', sess.data);
       }
       socket.on('locUp', (res) => {
            console.log(res);
           console.log('salut greg');
             this.user.update_coords(res, this.db, sess, socket);
       }); // not sure of the place
       socket.on('login', (res) => {
         this.user.dologin(res, this.db, sess, socket);
       });
       socket.on('userDisconnect', () =>{
           sess.destroy();
           socket.emit("userDisconnect", "");
       });
       socket.on('changeRegister', (data) => this.register.registerErrorHandling(data, socket));
       socket.on('validRegister', (data) => this.register.registerCheck(data, socket));
       socket.on('unmount', () => console.log("react unmount"));
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

}


module.exports = Controller;