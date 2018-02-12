class Update {
    static async refreshUser(db, sess, socket){
        try {
            await Update.getMatch(db, sess);
            await Update.getNotif(db, sess);
            await Update.getMsg(db, sess);
        } catch (e) {
            console.log(e);
        }
        socket.emit('user', sess.data);
    }

    static getMatch(db, sess){
        return (new Promise((resolve, reject) => {
            let sql = "SELECT  (CASE u1 WHEN ? THEN u2 ELSE u1 END) AS user FROM (SELECT user1 AS u1, user2 AS u2 FROM likes WHERE (user1=? OR user2=?) AND matcha=true) AS results";
            let login = sess.data.login;

            db.execute(sql, [login, login, login])
                .then(([rows]) => {
                    rows.forEach((elem) => {
                        if (!sess.data.match){
                            sess.data.match = [elem.user];
                        } else if (sess.data.match.indexOf(elem.user) === -1) {
                            sess.data.match.push(elem.user);
                        }
                        sess.save(() => resolve());
                    });
                })
                .catch((e) => reject(e));
        }));
    }

    static async getMsg(db, sess){
        return new Promise(async (resolve, reject) => {
            try {
                let sql = "SELECT messages, `from` FROM chat WHERE (user1 = ? OR user2 = ?) AND `from` != ?";
                let [rows] = await db.execute(sql, [sess.data.login, sess.data.login, sess.data.login]);

                rows.forEach((elem) => JSON.parse(elem.messages).forEach((msg) => Update.updateMsg(elem.from, sess, msg)));
            } catch (e) {
                console.log(e);
            }
            resolve();
        });

    }

    static async getNotif(db, sess){
        return (new Promise(async (resolve, reject) => {
            try {
                let sql = "SELECT type, `from` FROM notif WHERE login = ?";
                let [rows] = await db.execute(sql, [sess.data.login]);

                sess.data.notif = rows;
                sess.save(() => resolve());
            } catch (e) {
                reject(e);
            }
        }));

    }

    static updateMsg(login, sess, msg){
        if (!sess.data.message){
            sess.data.message = {[login]: [msg]};
        } else {
            let old = sess.data.message[login];

            if ((old && old.indexOf(msg) === -1) || !old) {
                if (!old) {
                    old = [msg];
                } else {
                    old.push(msg);
                }
                sess.data.message = Object.assign({}, sess.data.message, {[login]: old});
            }
        }
        sess.save();
    }
}

module.exports = Update;