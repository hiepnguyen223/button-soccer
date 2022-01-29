const express = require('express');
const ejs = require('ejs');
const app = express();
const {cloudinaryConfig, storage} = require("./cloudinary");
const cloudinary =  require("cloudinary").v2;
const multer = require("multer");
const cookieParser = require('cookie-parser');
const server = require("http").Server(app);
const cors = require('cors');

const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});

server.listen(process.env.PORT || 8001);

//register view engine
app.set('view engine', 'ejs');

//cors
var allowlist = ['https://tower.hiepnguyen.site']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
app.use(cors(corsOptionsDelegate))

//middleware & static files
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/play", (req, res) => {
    res.render("game");
})

app.get("/join", (req, res) => {
    const {roomId} = req.query;

    res.render("join", {avatar: req.cookies.avatar, roomId: roomId});
})

app.get("/remote", (req, res) => {
    const {name} = req.query;
    res.render("remote", {avatar: req.cookies.avatar, name: name});
})

app.post("/room", (req, res) => {
    const {roomId, password} = req.query;
    const {type, message} = authSoccerRoom(roomId, password);
    if(type === "error") {
        res.status(400).json({type, message});
    } else {
        res.json({type: 'success'});
    }
})

app.post("/avatar", upload.single('avatar'),  (req, res) => {
    const avatar = handleAvatar(req?.file?.path);
    // res.cookie("avatar", avatar);
    res.json({avatar: avatar});
})

// app.get("/tower", (req, res) => {
//     res.render("tower/home")
// })

// app.get("/tower/game", (req, res) => {
//     res.render("tower/game");
// })

// app.get("/tower/join", (req, res) => {
//     res.render("tower/join");
// })

// app.get("/tower/remote", (req, res) => {
//     res.render("tower/remote");
// })

//404 not found
app.get('*', function(req, res){
    res.status(404).render('404');
});

const roomList = {};
const playerList = {};
const masterList = {};

io.on('connection', async (socket) => {
    const {type, roomId, name, password, avatar} = socket.handshake.query;
    if(type === 'join') {
        const {type, messsage} = authSoccerRoom(roomId, password);
        if(type === 'error') {
            socket.emit('join', {type, messsage});
        } else {
            socket.join(roomId);
            playerList[socket.id] = {roomId: roomId};
            if(roomList[roomId].countBlue <= roomList[roomId].countRed) {
                socket.emit('join', {type: 'success', team: 'blue'});
                const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'blue'};
                io.to(roomList[roomId].masterId).emit("join", currentPlayer);
                roomList[roomId].playerList.push(currentPlayer);
                playerList[socket.id]["obj"] = currentPlayer;
                ++roomList[roomId].countBlue;
            } else {
                socket.emit('join', {type: 'success', team: 'red'});
                const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'red'};
                io.to(roomList[roomId].masterId).emit("join", currentPlayer); 
                roomList[roomId].playerList.push(currentPlayer);
                playerList[socket.id]["obj"] = currentPlayer;
                ++roomList[roomId].countRed;
            }
        }
    }

    if(type === 'create') {
        const roomId = randomId().toString();
        roomList[ roomId] = {masterId: socket.id, playerList: [], countBlue: 0, countRed: 0, isPlayed: false};
        socket.emit('create', {roomId: roomId});
        masterList[socket.id] =roomId;
    }

    socket.on('move', (args) => {   
        if(!roomList[playerList[socket.id]]) return;
        io.to(roomList[playerList[socket.id].roomId].masterId).emit("move", {socketId: socket.id, move: args});
    })

    socket.on('shoot', () => {
        if(!roomList[playerList[socket.id]]) return;
        io.to(roomList[playerList[socket.id].roomId].masterId).emit('shoot', {socketId: socket.id})
    })

    socket.on('changeteam', (args) => {
        const roomId = playerList[socket.id].roomId;
        if(playerList[socket.id].obj.team === 'blue') {
            ++roomList[roomId].countRed;
            --roomList[roomId].countBlue;
            playerList[socket.id].obj.team = 'red';
        } else {
            ++roomList[roomId].countBlue;
            --roomList[roomId].countRed;
            playerList[socket.id].obj.team = 'blue';
        }
        io.to(roomList[roomId].masterId).emit("changeteam", playerList[socket.id].obj);
    })

    socket.on('startgame', () => {
        io.to(masterList[socket.id]).emit('startgame');
        roomList[masterList[socket.id]].isPlayed = true;
    })

    socket.on('endgame', () => {
        io.to(masterList[socket.id]).emit('endgame');
        roomList[masterList[socket.id]].isPlayed = false;
    })

    socket.on('test', () => {
        console.log("loop")
    })

    socket.on('disconnect', () => {
        if(masterList[socket.id]) {
            io.to(masterList[socket.id]).emit('status', {type: 'error', message: 'The owner has left the room'});
            delete roomList[masterList[socket.id]];
            delete masterList[socket.id];
        } 

        if(playerList[socket.id]) {
            if(!roomList[playerList[socket.id].roomId]) return;
            io.to(roomList[playerList[socket.id].roomId].masterId).emit('status', {type: 'leave', socketId: socket.id});
            roomList[playerList[socket.id].roomId].playerList = roomList[playerList[socket.id].roomId].playerList.filter((player) => player.socketId !== socket.id);
            if(playerList[socket.id].obj.team === 'blue') {
                --roomList[playerList[socket.id].roomId].countBlue;
            } else {
                --roomList[playerList[socket.id].roomId].countRed;
            }
            delete playerList[socket.id];
        }
    })
})

const randomId = () => {
    const listChar = "abcdefghijklmnopqrstuvwxyz0123456789";
    while (true) {
        let roomId = "";
        const lengthList = listChar.length;
        for(let i = 0; i<6; i++) {
            roomId += listChar[Math.floor(Math.random() * lengthList)];
        }
        if(!roomList[roomId]) {
            return roomId;
        }
    }
}

const authSoccerRoom = (roomId, password) => {
    if(roomList[roomId]) {
        if(roomList[roomId].password && roomList[roomId].password !== password) {
            return {type: "error", message: "Wrong Password"};
        } else {
            if(roomList[roomId].countBlue + roomList[roomId].countRed === 12) {
                return {type: "error", message: "Room was enough people"};
            } else if(roomList[roomId].isPlayed){
                return {type: "error", message: "The game has already started"}
            } else {
                return {type: "success"};
            }
        }
    } else {
        return {type: "error", message: "Room does not exist"};
    }
}

const handleAvatar = (url) => {
    const newAvatar = url.substring(0, url.lastIndexOf(".")) + ".png"
    return newAvatar.replace("upload/", `upload/w_100,h_100,c_fill,r_max/`);
}
