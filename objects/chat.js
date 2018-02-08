let like = require('./likes');

class Chat {

    handleChat(data, socket, db, sess, allUsers){
        switch (data.type){
            case 'newMsg':
                Chat.handleNewMsg(data, socket, db, sess, allUsers);
                break ;
            case 'chatList':
                Chat.updateList(data, sess);
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
        let login  = sess.data.login;
        let login2 = data.from;

        db.execute(sql, [login, 'message', 'Vous avez recu un nouveau message de la part de ' + login2]);
        sql = 'UPDATE chat SET messages = JSON_MERGE((SELECT messages FROM(SELECT messages FROM chat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)) as lol), ?) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)';
        db.execute(sql, [login, login2, login2, login, JSON.stringify({from: login2, msg: data.msg}), login, login2, login2, login ]).catch(e => console.log(e));
        // console.log(data);
    }

    static updateList(data, sess){
        sess.data.chat = data.chatList;
        sess.save();
    }
}

module.exports = Chat;