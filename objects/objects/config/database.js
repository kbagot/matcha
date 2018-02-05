class Database {
    constructor(props) {
        this.host = "localhost";
        this.port = "3306";
        this.user = "root";
        this.password = "";
        this.multipleStatements = true;
        this.database = props ? props : null;
    }
}

module.exports = Database;
