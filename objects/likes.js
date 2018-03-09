let update = require('./update.js');
const profil = require('./profil.js');

class Likes{

    static async handleLikes(data, socket, db, sess, allUsers, io){

        switch(data.type){
            case 'Add':
                await Likes.addLike(data.login, socket, db, sess, io);
                Likes.sendNotif(db, data.login, socket, allUsers);
                break;
            case 'Remove':
                await Likes.removeLike(data.login, socket, db, sess, io);
                Likes.sendNotif(db, data.login, socket, allUsers);
                break ;
            case 'addMatch':
                Likes.addMatchList(socket, db, sess, data.login, false);
                break;
            case 'delMatch':
                Likes.deleteMatchList(socket, db, sess, data.login, false);
                break ;
            case 'refresh':
                update.getNotif(db, sess).then(() => socket.emit('user', sess.data));
                break ;
        }

    }


    static refreshProfil(db, sess, socket, id, io){
        io.emit(sess.data.id, null);
        profil.sendProfil(db, sess, socket, {id: id}, io);
    }


    static addLike(user, socket, db, sess, io){
        let id = sess.data.id;
        let sql;

        Likes.likeExist(user.id, sess, db)
            .then(async (res) => {
                if (!res)
                {
                    sql = "INSERT INTO likes(user1, user2) VALUES (?, ?)";
                    await db.execute(sql, [id, user.id]);
                    sql = "UPDATE users SET spop=spop+50 WHERE id = ?";
                    await db.execute(sql, [id]);
                    Likes.addNotif(db, sess, 'like', user.id, id);
                    socket.emit('user', sess.data);
                } else if (!res.matcha && Number(res.user1) !== id){
                    Likes.addMatchList(socket, db, sess, user, true);
                    Likes.addNotif(db, sess, 'match', user.id, id);
                    sql = "INSERT INTO chat(user1, user2, history) SELECT ?, ? , '[]' " +
                        "WHERE NOT EXISTS (SELECT user1 FROM chat WHERE (user1= ? AND user2=?) OR (user1=? AND user2=?))"
                        + " LIMIT 1";
                    db.execute(sql, [user.id, id, user.id, id, id, user.id])
                        .catch(e => console.log(e));
                    sql = "UPDATE likes SET matcha=true WHERE (user1=? AND user2=?) OR (user1=? AND user2=?); " ;
                    await db.execute(sql, [user.id, id, user.id, id]);
                    sql = "UPDATE users SET spop=spop+50 WHERE id = ? OR id = ?";
                    await db.execute(sql, [user.id, id]);
                }
                Likes.refreshProfil(db, sess, socket, user.id, io);
            })
            .catch((e) => console.log(e));
    }

    static removeLike(user, socket, db, sess, io){
        let id = sess.data.id;
        let sql;

        Likes.likeExist(user.id, sess, db)
            .then(async (res) =>{
            if (res && res.matcha){
                Likes.deleteMatchList(socket, db, sess, user, true);
                Likes.addNotif(db, sess, 'unmatch', user.id, id);
                sql = "UPDATE users SET spop=spop-100 WHERE id = ?";
                await db.execute(sql, [sql, [user.id]]);
                sql = "UPDATE likes SET matcha=false ,user1= (CASE WHEN user1=? THEN ? ELSE ? END)," +
                    " user2= (CASE WHEN user2=? THEN ? ELSE ? END) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
                await db.execute(sql, [id, user.id, user.id, user.id, id, id, user.id, id, id, user.id]);
           } else {
                Likes.addNotif(db, sess, 'unlike', user.id, id);
                socket.emit('user', sess.data);
                sql = "UPDATE users SET spop=spop-50 WHERE id = ? OR id = ?";
                await db.execute(sql, [user.id, id]);
                sql = "DELETE FROM likes WHERE user1=? AND user2=?";
                await db.execute(sql, [id, user.id]);
           }
           Likes.refreshProfil(db, sess, socket, user.id, io);
        })
            .catch((e) => console.log(e));
    }


    static sendNotif(db, user, socket, allUsers){
        if (allUsers.findIndex(elem => elem.login === user.login) !== -1){
            Likes.findSocket(db, user.id)
                .then(res => {
                    res.forEach(id => {
                        socket.to(id).emit('match', {type: 'refresh'});
                    });
                })
        }
    }

    static likeExist(userId, sess, db){
        return new Promise((resolve, reject) => {
            let sql = "SELECT user1, user2, matcha FROM likes WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
            let id = sess.data.id;

            db.execute(sql, [userId, id, id, userId])
                .then(([rows, fields]) => {
                    resolve(rows[0])
                })
                .catch((e) => reject(e));
        });
    }

    static findSocket(db, userId){
        return new Promise((resolve, reject) => {
            let sql = "SELECT data FROM sessions";
            let res = [];

            db.execute(sql).then(([rows, fields]) => {
                for (let elem of rows){
                    let cookie = JSON.parse(elem.data);

                    if (cookie.data && cookie.data.id === Number(userId)) {
                        res.push(cookie.socketid);
                    }
                }
                resolve(res);
            });
        }) ;
    }

    static addNotif(db, sess, type, userId, id){
        let sql =  "INSERT INTO notif SET type = ?, login = ?, `from` = ?";

        db.execute(sql, [type, userId, id]);
    }

    static addMatchList(socket, db, sess, user, refresh){
        if (!sess.data.match || (sess.data.match && sess.data.match.indexOf(user) === -1))
        {
            if (!sess.data.match){
                sess.data.match = [user];
            } else {
                sess.data.match.push(user);
            }
            sess.save(() => {
                socket.emit('user', sess.data);
                if (refresh) {
                    Likes.findSocket(db, user.id).then((res) => {
                        for (let elem of res) {
                            socket.to(elem).emit('match', {type: 'addMatch', login: {login: sess.data.login, id: sess.data.id}});
                        }
                    });
                }
            });
        }
    }

    static deleteMatchList(socket, db, sess, user, refresh){
        let index;

        if (sess.data.chat && (index = sess.data.chat.findIndex(elem => elem.login === user.login) !== -1)){
            sess.data.chat.splice(index, 1);
        }

        if (sess.data.match && (index = sess.data.match.findIndex(elem => elem.login === user.login)) !== -1){
            sess.data.match.splice(index, 1);
            sess.save(() => {
                socket.emit('user', sess.data);
                if (refresh) {
                    Likes.findSocket(db, user.id).then((res) => {
                        for (let elem of res) {
                            socket.to(elem).emit('match', {type: 'delMatch', login: {login: sess.data.login, id: sess.data.id}});
                        }
                    });
                }
            });
        }
    }
}

module.exports = Likes;