let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js'),
    chat = require('./chat.js'),
    research = require('./research.js'),
    profil = require('./profil.js'),
    update = require('./update');
let os = require('os');
let allUsers = [];

class Controller {
    constructor(props) {
        this.sess = {};
        this.chat = new chat();
        this.user = new user();
        this.register = new register();
        this.research = new research();
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
        socket.on('like', (data, refresh) => this.user.likes.handleLikes(data, socket, this.db, sess, allUsers, refresh));
        socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, allUsers, io));
        socket.on('locUp', (res) => this.user.update_coords(res, this.db, sess, socket)); // not sure of the place
        socket.on('notif', (data) => update.handleNotif(this.db, sess, socket, data));
        socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, allUsers));
        socket.on('profil', (data, setState) => profil.mainHandler(this.db, sess, socket, data, io, setState));
        socket.on('Register', (data, fn) => this.register.registerHandling(data, socket, fn, allUsers, io, sess));
        socket.on('getTags', (fct) => this.getTags(fct));
        socket.on('ResearchUsers', async (opt, fct) => await this.research.request(opt, fct, this.db, sess));
    }

    async getTags(fct) {
        let [results, fields] = await this.db.query("SELECT tag_name FROM tags");
        fct(results);
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