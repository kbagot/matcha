class Register{
    constructor(props){
        this.socket = props.socket;
        this.db = props.db;
    }

    async   registerErrorHandling(data){
        try {
            let     error = null;
            const   [rows, fields] = await this.db.con.execute("SELECT "+data[1]+" FROM `users` WHERE "+data[1]+" = ?", [data[0][data[1]]])

            if ([rows][0][0] && data[1] !== 'password') {
                    error = (data[1] === 'login' ? 'Ce ' : 'Cet ') + data[1] + " existe deja.";
            }
            else{
                let result = data[0][data[1]];

                switch (data[1]){
                    case 'password':
                        if (Register.checkPassword(result)){
                            error = result.length ? "Le mot de passe doit contenir au moins 6 caracteres." : null;
                        }
                        break;
                    case 'login':
                        if (result.length) {
                            if (!Register.checkLogin(result)) {
                                error = "Choisissez un login.";
                            }
                        }
                        else{
                            error = null;
                        }
                        break;
                    case 'email':
                        if (!Register.checkEmail(result)){
                            error = result.length ? "Entrez une adresse email valide." : null;
                        }
                        break;
                }
            }
            this.socket.emit ('registerError', {error: error, type: data[1]});
        }
        catch(e){
            console.log(e);
        }
    }

    static checkEmail(str){
        return str.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    }

    static checkLogin(str){
        return str.replace(/\s/g, '').length
    }

    static checkPassword(str){
        return str.length <  6;

    }
}

module.exports = Register;