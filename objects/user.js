let bcrypt = require('bcrypt');

class User {
    constructor(props) {
        this.socket = null;
        this.sess = null;
        this.data = {login: "motherfcker",
        password: '',
        email: '',
        valid: '',
        notif: '',
        sexe: '',
        bio: '',
        orientation: ''};
    }

    async dologin(res, db) {
        const [results, fields] = await db.con.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);
        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                    if (this.sess){
                        this.sess.userId = results[0].id;
                        console.log(this.sess.userId);
                    }
                }
                else
                    this.socket.emit('logpass');
            });
        }
        else
            this.socket.emit('loglog');
    }

    updateSocket(socket){
        this.socket = socket;
    }
    updateSession(session){
            this.sess = session;
        }
}

module.exports = User;

