let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js'),
    chat = require('./chat.js'),
    update = require('./update');
let     os = require('os');
let allUsers = [];

class Controller {
    constructor(props) {
        this.sess = {};
        this.chat = new chat();
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
        socket.on('chat', (data) => this.chat.handleChat(data, socket, this.db, sess, allUsers));
        socket.on('like', (data) => this.user.likes.handleLikes(data, socket, this.db, sess));
        socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, allUsers, io));
        socket.on('locUp', (res) => this.user.update_coords(res, this.db, sess, socket)); // not sure of the place
        socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, allUsers));
        socket.on('Register', (data, fn) => this.register.registerHandling(data, socket, fn));
        // socket.on('changeRegister', (data) => this.register.registerErrorHandling(data, socket));
        // socket.on('validRegister', (data) => this.register.registerCheck(data, socket));
        // socket.on('getTags', async (fct) => {
        //     let [results, fields] = await this.db.query("SELECT tag_name FROM tags");
        //     fct(results);
        // } );
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
                    io.emit('allUsers', allUsers);
                    update.refreshUser(this.db, sess, socket);
                })
                .catch((e) => console.log(e));
        });
    }
}

module.exports = Controller;