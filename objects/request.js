let database = require('./config/connect.js'),
    register = require('./register'),
    user = require('./user.js'),
    chat = require('./chat.js'),
    update = require('./update');
let os = require('os');
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
        socket.on('like', (data) => this.user.likes.handleLikes(data, socket, this.db, sess, allUsers));
        socket.on('login', (res) => this.user.dologin(res, this.db, sess, io, socket, allUsers, io));
        socket.on('locUp', (res) => this.user.update_coords(res, this.db, sess, socket)); // not sure of the place
        socket.on('notif', (data) => update.deleteNotif(this.db, sess, socket, data));
        socket.on('userDisconnect', () => this.user.userDisconnect(io, sess, socket, allUsers));
        socket.on('Register', (data, fn) => this.register.registerHandling(data, socket, fn, allUsers, io, sess));
        // socket.on('getTags', async (fct) => {
        //     let [results, fields] = await this.db.query("SELECT tag_name FROM tags");
        //     fct(results);
        // });
        // socket.on('ResearchUsers', async (opt, fct) => {
        //     try {
        //         console.log(opt);
        //         let [req, lol] = await this.db.query("SELECT * FROM location WHERE login = ?", [sess.data.login]);
                // console.log(opt, req);
                // let [results, fields] = await this.db.execute("SELECT * from users INNER JOIN location ON location.login = users.login  " +
                //     "WHERE users.orientation IN (?, ?, ?) " +
                //     "AND (st_distance_sphere(POINT(location.lon, location.lat), POINT(?, ?)) / 1000) < ? AND " +
                //     "users.sexe IN (?, ?, ?, ?) AND JSON_CONTAINS(users.tags, json_array(?)) AND (users.age >= ? AND users.age <= ?);",
                //     [opt.hetero, opt.bi, opt.trans, opt.gay, opt.distance, req[0].lon, req[0].lat, opt.M, opt.F, opt.T, JSON.stringify(opt.tags), opt.min, opt.max]);
                // fct(results);
            // } catch (e) {
            //     console.log(e);
            // }
        // });
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