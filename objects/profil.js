const fs = require('mz/fs');
const uniqid = require('uniqid');

class Profil {
    static mainHandler(db, sess, socket, data, setState){
        const menu = {
            upload: Profil.handleUpload,
            getImages: Profil.sendImages,
            getProfil: Profil.sendProfil
        };

        if (menu[data.type]){
            menu[data.type](db, sess, socket, data, setState);
        }
    }

    static async sendProfil(db, sess, socket, data, setState){
        const sql = "SELECT users.id, users.login, users.last, users.first, users.age, users.sexe, users.bio, users.orientation, users.tags, users.date, location.city, location.country, location.zipcode, " +
            "(SELECT st_distance_sphere((SELECT POINT(lon, lat) FROM location WHERE logid = ?), (SELECT POINT(lon, lat) FROM location WHERE logid = ?))) AS distance " +
            "FROM users INNER JOIN location ON location.logid = users.id  WHERE users.id = ?";
        const [rows] = await db.execute(sql, [data.id, sess.data.id, data.id]);

        if (rows[0]){
            setState(rows[0]);
        }
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
        const [rows] = await db.execute(sql, [data.profil.id]);

        if (rows[0]){
            socket.emit('img', rows);
        } else {
            socket.emit('img', {imgid: `nopic${data.profil.sexe}.jpg`, profil: 1})
        }
        console.log(rows);
    }
}

module.exports = Profil;