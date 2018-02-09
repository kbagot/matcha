let like = require('./likes');

class Chat {
    handleChat(data, socket, db, sess, allUsers){
        switch (data.type){
            case 'newMsg':
                Chat.handleNewMsg(data, socket, db, sess, allUsers);
                break ;
            case 'chatList':
                Chat.updateList(data, sess, socket);
                break ;
            case 'unreadMsg':
                Chat.unreadMsg(data, socket, db, sess);
        }
    }

    static handleNewMsg(data, socket, db, sess, allUsers){
        if (allUsers && allUsers.indexOf(data.login) !== -1){
            like.findSocket(db, data.login)
                .then(res => {
                    res.forEach((id) => {
                        socket.to(id).emit("chat", {type: 'newMsg', login: sess.data.login, msg: data.msg});
                    })
                });
        } else {
            console.log(data.login + "Offline");
        }
    }

    static unreadMsg(data, socket, db, sess){
        let sql = "INSERT INTO notif (login, type, notif) VALUES (?, ?, ?);";
        let sql2 = 'UPDATE chat SET messages = JSON_MERGE((SELECT messages FROM(SELECT messages FROM chat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)) as lol), ?) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)';
        let login  = sess.data.login;
        let login2 = data.from;

        db.execute(sql, [login, 'message', 'Vous avez recu un nouveau message de la part de ' + login2])
            .then(() => db.execute(sql2, [login, login2, login2, login, JSON.stringify({[login2]: data.msg}), login, login2, login2, login ]))
            .then(() => db.query("SELECT * FROM notif;SELECT * FROM chat"))
            .then(([rows]) => console.log(rows));
    }

    static updateList(data, sess, socket){
        if (!sess.data.chat){
            sess.data.chat = [data.login];
        } else {
            let index = sess.data.chat.indexOf(data.login);

            if (index === -1) {
                sess.data.chat.push(data.login);
            } else {
                sess.data.chat.splice(index, 1);
            }
        }
        sess.save();
        socket.emit('user', sess.data);
    }
}

module.exports = Chat;