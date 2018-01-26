let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');
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
       if (sess.data)
           socket.emit('user', sess.data);
       socket.on('login', (res) => {
         this.user.dologin(res, this.db, sess, socket));
         this.user.update_coords(res);
       };
       socket.on('userDisconnect', () =>{
           sess.data = undefined;
           sess.save();
           socket.emit("userDisconnect", "");
       });
       socket.on('changeRegister', (data) => this.register.registerErrorHandling(data, socket));
       socket.on('validRegister', (data) => this.register.registerCheck(data, socket));
       socket.on('unmount', () => console.log("react unmount"));
    }

}

module.exports = Controller;