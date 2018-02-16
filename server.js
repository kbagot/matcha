let     fs = require('fs');
let     express = require('express');
let     options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    // passphrase: 'matcha',
};
let     https = require('https');
let     app = express();
let     cookieParser = require('cookie-parser');


let     session = require('express-session');
let     bodyParser = require('body-parser');
let     server = https.createServer(options, app).listen(8081);
require('http').createServer(app).listen(8080);
let     io = require('socket.io').listen(server);
let     req = require('./objects/request');
let     controller = new req();
let     setup = require('./objects/config/connect.js');
let     MySQLStore = require('express-mysql-session')(session);

let     expressSession = session({
    secret : 'w3ll3w',
    name : 'Session',
    secure: true,
    resave: true,
    httpOnly: true,
    saveUninitialized: false,
    store: new MySQLStore({
        user: 'root',
        password: '',
        database: 'matcha',
        checkExpirationInterval: 900
    })
});

app.use(expressSession)
        .use(cookieParser())
        .use(express.static('./src/style'))
        .use(express.static('./objects'))
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
            extended: true
        }))
        // .enable('trust proxy')
        .get("/setup", async (req, res, next) => {
            let     set = new setup(await setup.createConnection());

            set.seedUsers();
            res.redirect("/");
            res.end();
        })

  .get("/", async function (req, res, next){
            let ip = await controller.getServerIp();

            if (req.secure) {
                if (req.session.data)
                    console.log(req.session.data.match);
            req.session.ip = req.connection.remoteAddress.split(":").pop();
            if (req.cookies.login === "true" && !req.session.data){
                res.cookie('error', true);
            }
            res.cookie('ip', ip);
            res.sendFile(__dirname + '/src/index.html');
            } else {
                res.redirect('https://'+ ip + ':8081');
            }
        })
        .get("/dist/index_bundle.js", function(req, res, next){
            res.sendFile(__dirname + '/dist/index_bundle.js');
        })
        .use(function(req, res, next){
            res.writeHead(404, {"Content-Type" : "text/html"});
            res.write("<p>404 Not Found</p>");
            res.end();
        });


io.on("connection", (socket) => {
    expressSession(socket.handshake, {}, (err) =>{
        if (err){
            console.log(err);
        }
        controller.socketEvents(socket, io);
    });
});
