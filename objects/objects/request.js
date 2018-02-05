let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js');
let     os = require('os');
let allUsers = [];

class Controller {
    constructor(props) {
        this.sess = {};
        this.user = new user();
        this.register = new register();
        database.createConnection('matcha').then((res) => {
            this.db = res;
            this.register.db = res;
        });
    }


    async socketEvents(socket, io) {
        let sess = socket.handshake.session;

        sess.socketid = socket.id;
        sess.save();
        if (sess.data) {
            this.triggerRefresh(io, socket, sess)
        }
        socket.on('like', (data) => this.user.likes.handleLikes(data, socket, this.db, sess));
        socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, allUsers, io));
        socket.on('locUp', (res) => this.user.update_coords(res, this.db, sess, socket)); // not sure of the place
        socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, allUsers));
        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data, socket));
        socket.on('validRegister', (data) => this.register.registerCheck(data, socket));
    }

    getServerIp() {
        return new Promise((resolve, reject) => {
            let res = os.networkInterfaces();
            for (let elem in res) {
                res[elem].forEach((data) => {
                    if (data.family === 'IPv4' && !data.internal) {
                        resolve(data.address);
                    }
                });
            }
            reject('No ip Found');
        });
    }

    triggerRefresh(io, socket, sess) {
        socket.emit('user', sess.data, () => {
            this.user.updateUsers(sess, allUsers)
                .then(() => {
                console.log("hello");
                    io.emit('allUsers', allUsers);
                    socket.emit('chatUsers', {type: 'chat', chat: sess.data.chat});
                })
                .catch((e) => console.log(e));
        });
    }

    static updateChat(socket, sess, db) {
        let sql = "SELECT  (CASE u1 WHEN ? THEN u2 ELSE u1 END) FROM (SELECT user1 AS u1, user2 AS u2 FROM likes WHERE (user1=? OR user2=?) AND matcha=true) AS results";
        let login = sess.data.login;

        db.execute(sql, [login, login, login])
            .then((res) => {
                socket.emit('test', res);
            });

    }

}
module.exports = Controller;