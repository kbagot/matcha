const fs = require('mz/fs');
const uniqid = require('uniqid');

class Profil {
    static mainHandler(db, sess, socket, data){
        const menu = {
            upload: Profil.handleUpload,
            getImages: Profil.sendImages,
            getProfil: Profil.sendProfil
        };

        if (menu[data.type]){
            menu[data.type](db, sess, socket, data);
        }
    }

    static async sendProfil(db, sess, socket, data){
        const sql = "SELECT id, login, last, first, age, sexe, bio, orientation, tags, date FROM users  WHERE id = ?";
    }

    static async handleUpload(db, sess, socket, data){
        if (await fs.exists('img') && sess.data.img.length < 5){
            let id = `${uniqid()}.${data.ext}`;
            let sql = "INSERT INTO img SET userid= ?, imgid = ?, profil= ?";
            let profil = sess.data.img[0].imgid === `nopic${sess.data.sexe}.jpg`;

            await fs.writeFile(`img/${id}`, data.img, 'base64');
            await db.execute(sql, [sess.data.id, id, profil]);

        }
    }

    static async sendImages(db, sess, socket, data){
        const sql = "SELECT imgid, profil FROM img WHERE userid= ? ORDER BY profil DESC";
        const [rows] = await db.execute(sql, [data.profil]);

        if (rows[0]){
            socket.emit('img', rows);
        } else {
            // socket.emit('img', {imgid:})
        }
        console.log(rows);
    }
}

module.exports = Profil;