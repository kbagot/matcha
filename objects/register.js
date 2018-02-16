let bcrypt = require('bcrypt');

class Register {
    async registerErrorHandling(data, socket) {
        try {
            let error = null;
            let change = data[1] === 'login' || data[1] === 'email';
            const [rows, fields] = await this.db.execute("SELECT " + data[1] + " FROM `users` WHERE " + data[1] + " = ?", [data[0][data[1]]])

            if ([rows][0][0] && change) {
                error = (data[1] === 'login' ? 'Ce ' : 'Cet ') + data[1] + " existe deja.";
            }
            else {
                let result = data[0][data[1]];

                switch (data[1]) {
                    case 'password':
                        if (!Register.checkPassword(result)) {
                            error = result.length ? "Le mot de passe doit contenir au moins 6 caracteres." : null;
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
                }
            }
            socket.emit('registerError', {error: error, type: data[1]});
        }
        catch (e) {
            console.log(e);
        }
    }

    async registerCheck(data, socket) {
        if (Register.checkEmail(data.email) && Register.checkLogin(data.login) && Register.checkPassword(data.password) && await this.uniqueInput(data)) {
            try {
                data = Register.changeOrientation(data);
                try {
                    let password = await bcrypt.hash(data.password, 10);  //TODO    add  validation account  for avoid issue if no location dbentry for register user
                    let req = "INSERT INTO users(login, last, first, password, email, sexe, bio, orientation, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    let tags = data.tags.map(val => {
                        if (val.className)
                            this.addTags(val.value);
                            return val.value;
                    });
                    if (tags.length = '0')
                        tags = ['notag'];
                    await this.db.execute(req, [data.login, data.last, data.first, password, data.email, data.sexe, data.bio, data.orientation, JSON.stringify(tags)]);
                } catch (e) {
                    console.log(e);
                }
            } catch (e) {
                console.log(e);
            }
        }
        else {
            let str = "Desole une erreure est survenue lors de l'inscription, veuillez recommencer.";
            socket.emit('registerError', {error: str, type: "global"});
        }
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

    async addTags(ntag) {
        try {
            const [rows, fields] = await this.db.execute("REPLACE INTO tags (tag_name) VALUES (?);", [ntag]);
            return rows[0];
        } catch (err) {
            console.log(err);
        }
    }

    static changeOrientation(data) {
        if (data.sexe === data.orientation) {
            return Object.assign({}, data, {orientation: 'gay'});
        } else if (data.sexe !== data.orientation && data.orientation !== 'bi') {
            return Object.assign({}, data, {orientation: 'hetero'});
        } else {
            return data;
        }
    }


    static checkEmail(str) {
        return str.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    }

    static checkLogin(str) {
        return str.replace(/\s/g, '').length
    }

    static checkPassword(str) {
        return str.length >= 6;
    }

}

module.exports = Register;