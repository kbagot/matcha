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
        // console.log(this.socket);
        const [results, fields] = await db.con.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);
        // console.log(results); // results contains rows returned by server
        // console.log(fields);
        // console.log(err);
        if (results[0]) {
            console.log('LOGIN');
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                    console.log(this.sess);
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
            this.data.password = "test";
        }
}

module.exports = User;

