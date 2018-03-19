class Research {
    async request(opt, db, sess, socket, from) {
        try {
            let [req] = await db.query("SELECT * FROM users INNER JOIN location ON location.logid = users.id WHERE users.id = ?", [sess.data.id]);
            let usertag = '';
            let ordertag = '';
            let results = [];

            if (req[0].tags && req[0].tags.length !== 0)
                req[0].tags.map((elem) => {
                    usertag += ', JSON_CONTAINS(tags, \'[\"' + elem + '\"]\') AS `' + elem + '` ';
                    ordertag += '\'' + elem  + '\'' + '+';
                });
            let matchorder = '';
            if (ordertag && opt.match)
                matchorder = 'ORDER BY ' + ordertag + '0' + ' DESC';
            if (opt.dofirstmatch) {
                let i = 0;
                const j = ['spop', 'tags', 'distance'];
                if (req[0].orientation === 'm') {
                    if (req[0].sexe === 'M') {
                        opt['M'] = 'M';
                        opt['bi'] = 'bi';
                        opt['m'] = 'm';
                    }
                    else if (req[0].sexe === 'F') {
                        opt['M'] = 'M';
                        opt['bi'] = 'bi';
                        opt['f'] = 'f';
                    }
                    else if (req[0].sexe === 'T') {
                        opt['M'] = 'M';
                        opt['trans'] = 'trans';
                    }
                } else if (req[0].orientation === 'f'){
                    if (req[0].sexe === 'M') {
                        opt['F'] = 'F';
                        opt['bi'] = 'bi';
                        opt['m'] = 'm';
                    }
                    else if (req[0].sexe === 'F') {
                        opt['F'] = 'F';
                        opt['bi'] = 'bi';
                        opt['f'] = 'f';
                    }
                    else if (req[0].sexe === 'T') {
                        opt['F'] = 'F';
                        opt['trans'] = 'trans';
                    }
                } else if (req[0].orientation === 'bi') {
                    opt['M'] = 'M';
                    opt['F'] = 'F';
                    if (req[0].sexe === 'T')
                        opt['trans'] = 'trans';
                    else {
                        opt['bi'] = 'bi';
                        opt[req[0].sexe.toLowerCase()] = req[0].sexe.toLowerCase();
                    }
                } else if (req[0].orientation === 'trans') {
                    if (req[0].sexe === 'T')
                        opt['trans'] = 'trans';
                    else
                        opt[req[0].sexe.toLowerCase()] = req[0].sexe.toLowerCase();
                    opt['T'] = 'T';
                }
                opt.distance = '50';
                opt.tags = req[0].tags; // TODO reducteur de tags pour match
                opt.spop = req[0].spop;
                while (results.length < 25 && i < 3) {
                    results = await Research.doRequest(opt, db, req, usertag, ordertag, matchorder);
                    opt[j[i]] = '';
                    i++;
                }
            } else
                results = await Research.doRequest(opt, db, req, usertag, ordertag, matchorder);
            opt.result = results;
            socket.emit('ReceiveUsers', opt, from);

        } catch (e) {
            console.log(e);
        }
    }

    static async doRequest(opt, db, req, usertag, ordertag, matchorder) {
        try {
            let order = '';
            let cnt = 0;
            for (let i in opt.order) {
                if (opt.order[i]) {
                    if (cnt === 0)
                        order += 'ORDER BY ';
                    if (cnt !== 0)
                        order += ',';
                    if (ordertag && i === 'tags') {
                        order += ordertag + '0' + ' ' + opt.order.tags; //add ordertag to order
                    }
                    else
                        order += i + ' ' + opt.order[i];
                    cnt++;
                }
            }
            if (opt.match)
                order = [matchorder, matchorder = order][0];
            if (!opt.distance)
                opt.distance = '20000';
            if (!opt.min)
                opt.min = '18';
            if (!opt.max)
                opt.max = '99';
            if (!opt.tags)
                opt.tags = [];
            if (!opt.m && !opt.f && !opt.bi && !opt.trans) {
                opt.m = 'm';
                opt.f = 'f';
                opt.bi = 'bi';
                opt.trans = 'trans';
            }
            if (!opt.M && !opt.F && !opt.T) {
                opt.M = 'M';
                opt.F = 'F';
                opt.T = 'T';
            }

            let minpop = '';
            let maxpop = '';
            let [maxspop] = await db.query("SELECT MAX(spop) AS maxspop FROM users");

            if ('spop' in opt && opt.spop) {
                minpop = Math.round(((opt.spop / maxspop[0].maxspop) * 100) - 30);
                maxpop = Math.round(((opt.spop / maxspop[0].maxspop) * 100) + 30);
            }
            else {
                minpop = 0;
                maxpop = 100;
            }

            let sql = "SELECT * FROM (SELECT users.login, users.first, users.last, users.age, users.sexe, users.bio, users.orientation, " +
                "users.tags, ROUND(users.spop / ?) AS respop, UNIX_TIMESTAMP(users.date) AS date, location.city, location.country, location.zipcode, img.imgid, users.id, likes.user1, likes.user2, likes.matcha, users.spop AS spop," +
                "(st_distance_sphere(POINT(lon, lat), POINT(?, ?)) / 1000) AS distance " + // TODO  care  maybe  have to be * looking on match result
                usertag +
                " from users INNER JOIN location ON location.logid = users.id LEFT JOIN img ON img.userid = users.id AND (img.profil = 1) " +
                "LEFT JOIN likes ON ((likes.user2 = " + req[0].id + " AND likes.user1 = users.id) OR (likes.user1 = " + req[0].id + " AND likes.user2 = users.id))" +
                //"(user1=? AND user2=?) OR (user1=? AND user2=?)" +
                " HAVING orientation IN (?, ?, ?, ?)" +
                "AND distance < ? AND " +
                "sexe IN (?, ?, ?) AND JSON_CONTAINS(tags, ?)" +
                "AND (age >= ? AND age <= ?) AND (respop >= " + minpop + " AND respop <= " + maxpop + ")" + order + " LIMIT " + opt.resultLength + " , 25) AS res " + matchorder;

            // " (SELECT likes.user1, likes.user2, likes.matcha FROM likes, users WHERE (likes.user1 = users.id OR likes.user2 = users.id) AND users.id = " + req[0].id + ") "
            let inserts = [maxspop[0].maxspop / 100, req[0].lon, req[0].lat, opt.m, opt.f, opt.bi, opt.trans, opt.distance, opt.M, opt.F, opt.T, JSON.stringify(opt.tags), opt.min, opt.max];
            sql = db.format(sql, inserts);
            let [results] = await db.query(sql);
            return (results);
        } catch (e) {
            console.log(e);
        }
    }
}


module.exports = Research;