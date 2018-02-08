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

        db.execute(sql, [sess.data.login, 'message', 'Vous avez recu un nouveau message de la part de ' + data.from]);
        console.log(data);
    }

    static updateList(data, sess){
        sess.data.chat = data.chatList;
        sess.save();
    }
}

module.exports = Chat;