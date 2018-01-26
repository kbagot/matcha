let     express = require('express');
let     ipAdress;
let     http = require('http');
let     app = express();
let     session = require('express-session');
let     bodyParser = require('body-parser');
let     server = http.createServer(app);
let     io = require('socket.io').listen(server);
let     req = require('./objects/request');
let     controller = new req(server);
let     setup = require('./objects/config/setup.js');
let     set = new setup();
let     os = require('os');
let     expressSession = session({
    secret : 'w3ll3w',
    name : 'Session',
    resave: false, // uselles ??
    saveUninitialized: 'false' //usefull ?
});
let     send = null;
io.on("connection", (socket) => {
    expressSession(socket.handshake, {}, (err) =>{
            if (err){
                console.log(err);
            }
            console.log(socket.handshake.address);
            controller.socketEvents(socket);
        });
});


app.use(expressSession)
        .use(express.static('./src/style'))
        .use(express.static('./objects'))
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
            extended: true
        }))
        .get("/setup", (req, res, next) => {
            set.setDatabase();
             res.redirect("/");
            res.end();
        })
        .get("/", function (req, res, next){
            // console.log(req.session);
            console.log("server");
            res.sendFile(__dirname + '/src/index.html');
        })
        .get("/dist/index_bundle.js", function(req, res, next){
            res.sendFile(__dirname + '/dist/index_bundle.js');
        })
        .use(function(req, res, next){
            res.writeHead(404, {"Content-Type" : "text/html"});
            res.write("<p>404 Not Found</p>");
            res.end();
        });

server.listen(8081);
