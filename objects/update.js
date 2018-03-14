class Update {
    static async refreshUser(db, sess, socket) {
        try {
            await Update.getMatch(db, sess);
            await Update.getNotif(db, sess);
            await Update.getAllChatLog(db, sess, socket);
            await Update.getImages(db, sess);
        } catch (e) {
            console.log(e);
        }
        socket.emit('user', sess.data);
    }

    static async getImages(db, sess){
        const sql = "SELECT imgid, profil FROM img WHERE userid = ? ORDER BY profil DESC";

        try {
            const [rows] = await db.execute(sql, [sess.data.id]);

            rows.forEach(elem => elem.profil = elem.profil === 1);
            if (rows[0]) {
                sess.data.img = rows;
            } else {
                sess.data.img = [{imgid: `nopic.png`, profil: true}];
            }
            sess.save();
        } catch (e){
            console.log(e);
        }
    }

    static getMatch(db, sess){
        return (new Promise((resolve, reject) => {
            let sql = "SELECT  (SELECT login FROM users WHERE id = (CASE u1 WHEN ? THEN u2 ELSE u1 END)) AS login, " +
                "(SELECT imgid FROM img WHERE userid = (CASE u1 WHEN ? THEN u2 ELSE u1 END) AND profil = 1) as imgid, " +
                "(CASE u1 WHEN ? THEN u2 ELSE u1 END) AS id " +
                "FROM (SELECT user1 AS u1, user2 AS u2 FROM likes WHERE (user1=? OR user2=?) AND matcha=true) AS results";
            let id = sess.data.id;

            db.execute(sql, [id, id, id, id, id])
                .then(([rows]) => {
                    rows.forEach((elem) => {
                        if (!sess.data.match) {
                            sess.data.match = [elem];
                        } else if (sess.data.match.findIndex(node => node.login === elem.login) === -1) {
                            sess.data.match.push(elem);
                        }
                        sess.save();
                    });
                    resolve();
                })
                .catch((e) => reject(e));
        }));
    }

    static getNotif(db, sess, visit) {
        return (new Promise(async (resolve, reject) => {
            try {
                let sql = "SELECT notif.id, type, `from`, `read`, users.login AS login FROM notif INNER JOIN users ON notif.from = users.id WHERE notif.login = ?";
                let [rows] = await db.execute(sql, [sess.data.id]);


                sess.data.notif = rows;
                if (visit){
                    sql = "SELECT visits FROM visit WHERE userid = ?";
                    [rows] = await db.execute(sql, [sess.data.id]);
                    sess.data.visits = rows[0].visits;
                }
                sess.save(() => resolve());
            } catch (e) {
                reject(e);
            }
        }));
    }

    static getAllChatLog(db, sess, socket) {
        return new Promise(async (resolve, reject) => {
            let sql = "SELECT history, CASE WHEN user1=? THEN user2 ELSE user1 END AS id FROM chat WHERE user1 = ? OR user2 = ?";
            let login = sess.data.id;

            try {
                let [rows] = await db.execute(sql, [login, login, login]);
                let obj = {};

                rows.forEach(elem => {
                    let history = JSON.parse(elem.history);
                    if (history) {
                        obj = Object.assign({}, obj, {[elem.id]: history});
                    }
                });
                socket.emit('chat', {type: 'allChatLog', log: obj});
                resolve();
            } catch (e) {
                reject();
            }
        });
    }

    static getChatLog(db, data, sess, socket) {
        if (data.history === undefined || !data.history.length) {
            let sql = "SELECT history FROM chat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
            let login = data.login.id;
            let login2 = sess.data.id;

            db.execute(sql, [login, login2, login2, login])
                .then(([rows]) => {
                    if (rows[0]) {
                        socket.emit("chat", {type: 'chatLog', id: login, log: rows[0].history});
                    }
                });
        }
    }

    static async updateNotif(db, data, sess) {
        if (sess.data.notif) {
            sess.data.notif = sess.data.notif.filter(elem => ((elem.type === 'message' && Number(elem.from) !== Number(data.login.id)) || elem.type !== 'message'));
            sess.save();
            let sql = "DELETE FROM notif WHERE login = ? AND type = ? AND `from` = ?";

            await db.execute(sql, [sess.data.id, 'message', data.login.id]);
        }
    }

    static async handleNotif(db, sess, socket, data){
        const type = {
            delete: Update.deleteNotif.bind(this),
            read: Update.readNotif.bind(this)
        };

        await type[data.type](db, sess, socket, data.data);
        socket.emit('user', sess.data);
    }

    static async readNotif(db, sess, socket, data){
        let sql = "UPDATE notif INNER JOIN users ON users.id = notif.login SET notif.read = true WHERE users.login =  ?";

        sess.data.notif.map(elem => elem.read = true);
        await db.execute(sql, [sess.data.login]);
    }

    static async deleteNotif(db, sess, socket, data){
        if (sess.data.notif){
            let sql = "DELETE FROM notif WHERE id = ?";

            await db.execute(sql, [data]);
            sess.data.notif = sess.data.notif.filter((elem) => elem.id !== Number(data));
            sess.save();
        }
    }

    static async openChat(db, data, sess, socket) {
        Update.getChatLog(db, data, sess, socket);
        await Update.updateNotif(db, data, sess);
    }

    add_score_pop(db, sess, type) {
        const val = {
            like: 20,
            match: 80
        };
        let sql = "UPDATE users SET spop = spop + ???? WHERE id = ?";
        db.execute(sql, [val[type], sess.data.id]);
    }
}

module.exports = Update;