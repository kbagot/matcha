let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js'),
    chat = require('./chat.js'),
    research = require('./research.js'),
    profil = require('./profil.js'),
    update = require('./update'),
    loadhome = require('./loadhome');
let os = require('os');
let allUsers = [];
const likes = require('./likes.js');

class Controller {
    constructor(props) {
        this.sess = {};
        this.chat = new chat();
        this.user = new user();
        this.register = new register();
        this.research = new research();
        this.loadhome = new loadhome();
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
        socket.on('like', (data, refresh) => likes.handleLikes(data, socket, this.db, sess, allUsers, io));
        socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, allUsers, io));
        socket.on('locUp', (res, respond) => user.update_coords(res, this.db, sess, respond));
        socket.on('notif', (data) => update.handleNotif(this.db, sess, socket, data));
        socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, allUsers));
        socket.on('profil', (data, setState) => profil.mainHandler(this.db, sess, socket, data, io, setState, allUsers));
        socket.on('Register', (data, fn) => this.register.registerHandling(data, socket, fn, allUsers, io, sess));
        socket.on('getTags', (fct) => this.getTags(fct));
        socket.on('ResearchUsers', async (opt, from) => await this.research.request(opt, this.db, sess, socket, from));
        socket.on('HomeUsers', async (opt, name) => await this.loadhome.request(opt, this.db, sess, socket, name));

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

    async checkHash(hash){
        let SQL = "SELECT login FROM users WHERE hash = ?";
        const [rows] = await this.db.execute(SQL, [hash]);

        SQL= "UPDATE users SET hash = NULL WHERE hash = ?";
        await this.db.execute(SQL, [hash]);

        if (rows[0]) {
            return rows[0].login
        } else {
            return false;
        }
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