const fs = require('mz/fs');
const uniqid = require('uniqid');
const likes = require('./likes.js');
const register = require('./register.js');
const NodeGeocoder = require('node-geocoder');

class Profil {
    static mainHandler(db, sess, socket, data, io, setState, allUsers){
        const menu = {
            upload: Profil.handleUpload,
            getImages: Profil.sendImages,
            getProfil: Profil.sendProfil,
            imgDel: Profil.deleteImage,
            profilImg: Profil.setProfilImg,
            editProfil: Profil.editProfil,
            visit: Profil.addVisit,
            block: Profil.addBlock,
            report: Profil.addReport
        };

        if (menu[data.type]){
            menu[data.type](db, sess, socket, data, io, setState, allUsers);
        }
    }

    static addReport(db, sess, socket, data, io){
        const sql = "INSERT INTO report VALUES (?)";

        db.execute(sql, [data.data.id]);
    }

    static async addBlock(db, sess, socket, data, io, setState, allUsers){
        if (!sess.data.block || (sess.data.id !== data.data.id && sess.data.block.indexOf(data.data.id) === -1)){
            const sql = sess.data.block ? "UPDATE block SET list = JSON_MERGE((SELECT list FROM (SELECT list FROM block WHERE userid = ?) AS lol), ?) WHERE userid = ?" : "INSERT INTO block VALUES(? , ?)";


            likes.handleLikes({type: 'Remove', login: {id: data.data.id, login: data.data.login}}, socket, db, sess, allUsers, io);
            if (!sess.data.block){
                await db.execute(sql, [sess.data.id, [data.data.id]]);
                sess.data.block = [data.data.id];
            } else {
                await db.execute(sql, [sess.data.id, `[${data.data.id}]`, sess.data.id]);
                sess.data.block.push(data.data.id);
            }
            sess.save();
            socket.emit("user", sess.data);
        }
    }

    static async addVisit(db, sess, socket, data, io, setState, allUsers){
        const sql = "SELECT JSON_CONTAINS((SELECT list FROM block WHERE userid=?), ?, '$') AS blocked";
        const [blocked] = await db.execute(sql, [data.data.id, `${sess.data.id}`]);


        if (data.data.id !== sess.data.id && blocked[0].blocked !== 1) {
            let sql = `UPDATE visit SET visits = (JSON_SET((SELECT visits FROM (SELECT visits FROM visit WHERE userid = ?) AS lol), '$."${sess.data.id}"', ? )) WHERE userid = ?`;

            db.execute(sql, [data.data.id, Date.now(), data.data.id]);
            sql =  "INSERT INTO notif SET login = ?, type = 'visit', `from` = ?";
            db.execute(sql, [data.data.id, sess.data.id]);
            likes.sendNotif(db, data.data, socket, allUsers);
        }
    }

    static cleanProfil(profil){
        Object.keys(profil).map(elem => {
            const orientation = register.checkOrientation(profil[elem]);
            const sexe = register.checkSexe(profil[elem]);
            const age = register.checkAge(profil[elem]);

            if (profil[elem] === null || ['edit', 'city', 'country'].indexOf(elem) !== -1 || (elem === 'orientation' && !orientation) || (elem === 'sexe' && !sexe) || elem === 'age' && !age){
                delete profil[elem];
            } else if (elem === 'tags'){
                profil[elem] = profil[elem].map((node, index) => profil[elem][index] = node.value);
            }
        });

        return profil;
    }

    static addTags(db, tags){
        if (tags) {
            tags.map(async (elem) => {
                if (elem.className) {
                    register.addTags(db, elem.value);
                }
            });
        }
    }

    static async changeLocation(db, profil, sess){
        if (profil.city){
            const city = profil.city ? profil.city.trim() : "";
            const country = profil.country ? profil.country.trim() : "";
            const options = {
                provider: 'google',
                httpAdapter: 'https',
                apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI',
                formatter: null
            };
            const geocoder = NodeGeocoder(options);
            let res = await geocoder.geocode(city +" "+ country);
            if ((res = res[0])) {
                const entry = {
                    lat: res.latitude ? res.latitude : 0,
                    lon: res.longitude ? res.longitude : 0,
                    city: res.city ? res.city : res.extra.neighborhood,
                    country: res.country ? res.country : '',
                    zipcode: res.zipcode ? res.zipcode : res.countryCode
                };
                const sql = "UPDATE location SET lat = ?, lon = ?, city = ?, country = ?, zipcode = ? WHERE logid = ?";

                await db.execute(sql, [...Object.values(entry), sess.data.id]);
            }
        }
    }

    static async changeProfilPic(sess, sexe){
        if (sexe && sess.data.img.findIndex(elem => elem.imgid === `nopic.png`) !== -1){
            sess.data.img = [{imgid: `nopic.png`, profil: 'true'}];
        }
    }

    static async editProfil(db, sess, socket, data, io){
        let profil = data.data;
        let sql;
        let empty;

        Profil.changeProfilPic(sess, profil.sexe);
        Profil.addTags(db, profil.tags);
        await Profil.changeLocation(db, data.data, sess);
        profil = Profil.cleanProfil(profil);
        empty = Object.values(profil);
        sql = {
            age: profil.age && profil.age >=18 && profil.age <= 99 && profil.age !== sess.data.age ? ' age = ? ' : null,
            last: profil.last && profil.last !== sess.data.last? ' last = ? ' : null,
            first: profil.first && profil.first !== sess.data.first ? ' first = ? ' : null,
            bio: profil.bio && profil.bio !== sess.data.bio ? ' bio = ? ' : null,
            sexe: profil.sexe && profil.sexe !== sess.data.sexe ? ' sexe = ? ' : null,
            orientation: profil.orientation  && profil.orientation !== sess.data.orientation ? ' orientation = ? ' : null,
            tags: profil.tags && profil.tags !== sess.data.tags ? 'tags = ? ' : null
        };

        if (empty[0]) {
            const query = "UPDATE users SET " +Object.values(sql).filter(elem => elem ).join() + "WHERE id = ?";

            await db.execute(query, [...empty, sess.data.id]);
            Object.assign(sess.data, profil);
            sess.save();
        }
        io.emit(sess.data.id, null);
        socket.emit('user', sess.data);
    }

    static async setProfilImg(db, sess, socket, data, io){
        const sql = "UPDATE img SET profil = (CASE WHEN profil='1' THEN '0' WHEN profil='0' THEN '1' END) WHERE userid=? AND (imgid = ? OR profil = 1)";
        const oldProfil = sess.data.img.findIndex(elem => elem.profil === true);
        const newProfil = sess.data.img.findIndex(elem => elem.imgid === data.img.imgid);

        await db.execute(sql, [sess.data.id, data.img.imgid]);

        sess.data.img[oldProfil] = sess.data.img.splice(newProfil, 1, sess.data.img[oldProfil])[0];
        sess.data.img[oldProfil].profil = true;
        sess.data.img[newProfil].profil = false;
        sess.save();
        socket.emit('user', sess.data);
        io.emit(sess.data.login, sess.data.img);
    }

    static async deleteImage(db, sess, socket, data, io){
        const profil = data.img.profil ? " AND profil ='1'" : "";
        let sql = "DELETE FROM img WHERE imgid = ? AND userid = ?" + profil;

        await db.execute(sql, [data.img.imgid, sess.data.id]);
        if (data.img.profil){
            sql = "UPDATE img SET profil = 1 WHERE userid = ? LIMIT 1";
           await db.execute(sql, [sess.data.id]);
        }
        if (sess.data.img.length === 1){
            sess.data.img = [{imgid: `nopic.png`, profil: true}];
        } else {
            const index = sess.data.img.findIndex(elem => elem.imgid === data.img.imgid);

            sess.data.img.splice(index, 1);
            sess.data.img[0].profil = true;
        }
        sess.save();
        io.emit(sess.data.login, sess.data.img);
    }

    static async sendProfil(db, sess, socket, data, io, setState){
        const sql = "SELECT users.id, users.login, users.last, users.first, users.age, ROUND(users.spop / ?) AS respop, users.sexe, users.bio, users.orientation, users.tags, users.spop as pop, users.date, location.city, location.country, location.zipcode, likes.user1, likes.user2, img.imgid, " +
            "(SELECT st_distance_sphere((SELECT POINT(lon, lat) FROM location WHERE logid = ?), (SELECT POINT(lon, lat) FROM location WHERE logid = ?)) / 1000) AS distance " +
            "FROM users LEFT JOIN img ON img.userid = users.id AND img.profil = '1' LEFT JOIN likes ON ((likes.user1 = ? AND likes.user2 = users.id) OR (likes.user1 = users.id AND likes.user2 = ?)) INNER JOIN location ON location.logid = users.id  WHERE users.id = ?";
        let [maxspop] = await db.query("SELECT MAX(spop) AS maxspop FROM users");
        const [rows] = await db.execute(sql, [(maxspop[0].maxspop /100), data.id, sess.data.id, sess.data.id, sess.data.id, data.id]);

        if (rows[0]){
            if (setState) {
                setState(rows[0]);
            } else {
                io.emit(data.id, rows[0]);
            }
        }
    }

    static async handleUpload(db, sess, socket, data, io){
        if (await fs.exists('img') && sess.data.img.length < 5){
            const id = `${uniqid()}.${data.ext}`;
            const sql = "INSERT INTO img SET userid= ?, imgid = ?, profil= ?";
            const profil = sess.data.img[0].imgid === `nopic.png`;
            const newPic = {imgid: id, profil: profil};

            await fs.writeFile(`img/${id}`, data.img, 'base64');
            await db.execute(sql, [sess.data.id, id, profil]);

            if (profil){
                sess.data.img = [newPic];
            } else {
                sess.data.img.push(newPic);
            }
            sess.save();
            socket.emit('user', sess.data);

            io.emit(sess.data.login, sess.data.img);

        }
    }

    static async sendImages(db, sess, socket, data, io){
        const sql = "SELECT imgid, profil FROM img WHERE userid= ? ORDER BY profil DESC";
        const [rows] = await db.execute(sql, [data.profil.id]);

        rows.forEach(elem => elem.profil = elem.profil === 1);
        if (rows[0]){
            io.emit(data.profil.login, rows);
        } else {
            io.emit(data.profil.login, [{imgid: `nopic.png`, profil: true}]);
        }
    }
}

module.exports = Profil;