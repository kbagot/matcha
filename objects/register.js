const md5 = require('md5');
const nodemailer = require('nodemailer');
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

class Register {
    registerHandling(data, socket, fn, allUsers, io, sess){
        const conditional = {
            change: this.registerErrorHandling.bind(this),
            submit: this.registerCheck.bind(this),
            edit: this.editSubmit.bind(this),
            loginEdit: Register.changeLogin.bind(this),
            resetPassword: Register.resetPassword.bind(this),
            resetChange: () => {
                let error = null;

                if (!Register.checkEmail(data.value)){
                    error = data.value.length ? "Entrez une adresse email valide." : null;
                }
                if (fn){
                    fn(error);
                }
            }
        };

        if (conditional[data.type]) {
            conditional[data.type](data.value, socket, sess, allUsers, io);
        }
    }


    static async resetPassword (data, socket, sess){
        const sql = "UPDATE users SET hash = ? WHERE email = ?";
        const hash = md5(uniqid());
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'matcha987654321',
                pass: 'matcha123456789'
            }
        });
        const mail ={
            from: "matcha@gmail.com",
            to: data.email,
            subject: 'Matcha reset password.',
            text: 'Bonjour,\nVeuillez cliquer sur ce lien afin de pouvoir reinitialiser votre mot de passe: \nhttps://' + data.ip + ':8081/resetPassword/'+hash
        };

        transporter.sendMail(mail);

        this.db.execute(sql , [hash , data.email]);
    }

    async   registerErrorHandling(data, socket){
        const valid = ['login', 'email', 'password', 'first', 'last', 'age'].indexOf(data[1]) !== -1;

        if (valid) {
            try {
                let error = null;
                let change = data[1] === 'login' || data[1] === 'email';
                const sql = "SELECT " + this.db.escapeId(data[1]) + " FROM `users` WHERE " + this.db.escapeId(data[1]) + " = ?";
                const [rows, fields] = await this.db.execute(sql, [data[0][data[1]]]);

                if ([rows][0][0] && change) {
                    error = (data[1] === 'login' ? 'Ce ' : 'Cet ') + data[1] + " existe deja.";
                }
                else {
                    let result = data[0][data[1]];

                    switch (data[1]) {
                        case 'password':
                            if (!Register.checkPassword(result)) {
                                error = result.length ? "Minimum: 6 caracteres, 1 chiffre, 1 minuscule et 1 majuscule." : null;
                            }
                            break;
                        case 'last':
                        case 'first':
                        case 'login':
                            if (result.length) {
                                if (!Register.checkLogin(result)) {
                                    if (data[1] === 'login') {
                                        error = "Choisissez un login.";
                                    } else {
                                        error = "Veuillez entrez votre " + (data[1] === 'last' ? 'nom' : 'prenom') + ".";
                                    }
                                }
                            }
                            else {
                                error = null;
                            }
                            break;
                        case 'email':
                            if (!Register.checkEmail(result)) {
                                error = result.length ? "Entrez une adresse email valide." : null;
                            }
                            break;
                        case 'age':
                            if (result < 18 || result > 99) {
                                error = "Vous devez avoir entre 18 et 99 ans.";
                            }
                            break;
                    }
                }
                socket.emit('registerError', {error: error, type: data[1]});
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    async registerCheck(data, socket){
        if (Register.checkAge(data.age) && Register.checkEmail(data.email) && Register.checkLogin(data.login) &&
            Register.checkPassword(data.password) && Register.checkOrientation(data.orientation) && Register.checkLogin(data.last)
            && Register.checkLogin(data.first) && Register.checkSexe(data.sexe) && Register.checkBio(data.bio) && await this.uniqueInput(data)){
            try {
                    let password = await bcrypt.hash(data.password, 10);
                    let req = "INSERT INTO users(login, last, first, password, email, sexe, bio, orientation, tags, age, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const uniqTag = [];
                    let tags = data.tags.map((val, index) => {
                        if (uniqTag.indexOf(val.value.trim()) === -1){
                            uniqTag.push(val.value.trim());
                        }
                        if (val.className)
                            Register.addTags(this.db, val.value);
                    });
                    let date = new Date();
                    date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                    data.first = data.first[0].toUpperCase() + data.last.slice(1);
                    data.last = data.last[0].toUpperCase() + data.last.slice(1);
                    await this.db.execute(req, [data.login, data.last, data.first, password, data.email, data.sexe, data.bio,
                        data.orientation, JSON.stringify(uniqTag), data.age, date]);

                    req = "INSERT INTO visit VALUES ((SELECT id FROM users WHERE login = ?), '{}')";
                    this.db.execute(req, [data.login]);

            } catch (e) {
                console.log(e);
            }
        }
        else {
            let str = "Desole une erreure est survenue lors de l'inscription, veuillez recommencer.";
            socket.emit('registerError', {error: str, type: "global"});
        }
    }

    async editSubmit(data, socket, sess, allUsers, io){
        if (data[3]){
            let sql = "SELECT login FROM users WHERE hash = ?";

            const [rows] = await this.db.execute(sql, [data[2]]);

            if (rows.length){
                data[2] = rows[0].login;
                sql = "UPDATE users SET hash = ? WHERE login = ?";
                this.db.execute(sql, [null, data[2]]);
            }
        }
        const functions = {
            login: Register.checkLogin,
            email: Register.checkEmail,
            password: Register.checkPassword
        };
        const values = {
            login: {login: data[0], email: ''},
            email: {login: '', email: data[0]},
            password: {login: '', email: ''}
        };
        let res;
        let error = false;

        const valid = ['login', 'password', 'email'];

        if (data[1] && functions[data[1]] && functions[data[1]](data[0]) && await this.uniqueInput(values[data[1]]) && valid.indexOf(data[1]) !== -1){
            try {
                let sql = `UPDATE users SET ${this.db.escapeId(data[1])} = ? WHERE login = ?`;
                let password = await bcrypt.hash(data[0], 10);

                await this.db.execute(sql , [data[1] === 'password'? password : data[0], data[2]]);
                 if (data[1] !== 'password'){
                    sess.data[data[1]] = data[0];
                    sess.save();
                    if (data[1] === 'login') {
                        allUsers[allUsers.findIndex(elem => elem.login === data[2])].login = data[0];
                        io.emit("refresh", {type: "loginEdit", value: {new: data[0], old: data[2]}, allUsers: allUsers});
                    }
                    socket.emit('user', sess.data);
                }
                res = {msg: data[1] + " modifie avec succes.", type: 'success'};
            } catch (e) {
                error = true;
                console.log(e);
            }
        } else {
            res = {error: "Desole une erreure est survenue lors de la modification, veuillez reessayer.", type:'global'};
        }
        if (!error)
           socket.emit('registerError', res);
    }

    async uniqueInput(data) {
        try {
            const [rows, fields] = await this.db.execute("SELECT login, email FROM users WHERE login = ? OR email = ?", [data.login, data.email]);
            return ![rows][0][0];
        }
        catch (e) {
            console.log(e);
        }
    }

    static async addTags(db, ntag) {
        try {
            const [rows, fields] = await db.execute("REPLACE INTO tags (tag_name) VALUES (?);", [ntag.trim()]);
            return rows[0];
        } catch (err) {
            console.log(err);
        }
    }

    static changeLogin(data, socket, sess){
        if (sess.data.login !== data.new){
            const array = ['match', 'notif', 'chat'];

            for (let elem of array){
                if (sess.data[elem]) {
                    sess.data[elem].forEach((node, index) => {

                        if (node.login === data.old) {
                            sess.data[elem][index].login = data.new;
                        }
                    });
                }
            }
            sess.save();
            socket.emit('user', sess.data);
        }
    }

    static checkBio(bio){
        return (bio && typeof bio === typeof "" && bio.length <= 200) || bio === '';
    }

    static checkSexe(sexe){
        return ['M', 'F', 'T'].indexOf(sexe) !== -1 && sexe.length === 1;
    }

    static checkOrientation(orientation){
        return ['m', 'f', 'trans', 'bi'].indexOf(orientation) !== -1 && orientation.length < 5;
    }

    static checkAge(age){
        return age >= 18 && age <= 99 && Number.isInteger(Number(age));
    }

    static checkEmail(str) {
        return typeof str === typeof "" && str.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) && str.length <= 40;
    }

    static checkLogin(str) {
        return typeof str === typeof "" && str.replace(/\s/g, '').length && str.replace(/\s/g, '').length <= 25;
    }

    static checkPassword(str) {
        return typeof str === typeof "" && str.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/) && str.length <= 25;
    }
}

module.exports = Register;