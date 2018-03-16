class Loadhome {
    async request(opt, db, sess, socket) {
        try {
            if (opt && opt.length !== 0) {
                let [maxspop] = await db.query("SELECT MAX(spop) AS maxspop FROM users");
                let [req] = await db.query("SELECT * FROM users INNER JOIN location ON location.logid = users.id WHERE users.id = ?", [sess.data.id]);

                let sort = '';
                let inserts = '';
                if (opt === 'star') {
                    sort = " ORDER BY pop DESC LIMIT 20";
                    inserts = [maxspop[0].maxspop / 100, req[0].lon, req[0].lat];
                } else {
                    if (!opt || opt.length === 0)
                        opt = '';
                    inserts = [maxspop[0].maxspop / 100, req[0].lon, req[0].lat, opt];
                    sort = ` WHERE users.id IN (?) ORDER BY FIELD(users.id, ${opt})`;
                }
                let sql = "SELECT users.login, users.last, users.first, users.age, users.sexe, users.bio, users.orientation, " +
                    "users.tags, ROUND(users.spop / ?) AS respop, users.date, location.city, location.country, " +
                    "location.zipcode, img.imgid, users.id, likes.user1, likes.user2, likes.matcha, users.spop as pop," +
                    "(st_distance_sphere(POINT(lon, lat), POINT(?, ?)) / 1000) AS distance " +
                    " from users INNER JOIN location ON location.logid = users.id " +
                    "LEFT JOIN img ON img.userid = users.id AND (img.profil = 1) " +
                    "LEFT JOIN likes ON ((likes.user2 = " + req[0].id + "" +
                    " AND likes.user1 = users.id) OR (likes.user1 = " + req[0].id + " AND likes.user2 = users.id))" +
                    sort;
                sql = db.format(sql, inserts);
                let [results] = await db.query(sql);

                socket.emit('ReceiveUsersHome', results);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = Loadhome;