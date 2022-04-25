const express = require('express');
const session = require('express-session');
const db = require('./db');
const path = require('path');
const { fstat, readFileSync } = require('fs');

/** @type {Express} */
const app = express();
/** @type {http.Server} */
const server = require('http').Server(app);

app.use(session({secret: 'secret',resave: true,saveUninitialized: true}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let pages = ["home","join","scout","analyze","monitor"];

for(let pageName of pages){
	app.get(`/${pageName}/style.css`, function(_,res){res.sendFile(__dirname + `/pages/${pageName}/style.css`)});
	app.get(`/${pageName}/script.js`, function(_,res){res.sendFile(__dirname + `/pages/${pageName}/script.js`)});
}

app.get(`/scout/`, function(req,res){
	if(!req.session.roomName?.length){
		res.redirect('/monitor#mustSelectRoom');
		return;
	}
	if(!db.data.rooms[req.session.roomName]){
		res.redirect('/monitor#roomDoesNotExist');
		return;
	}
	res.send(readFileSync('pages/scout/index.html', {encoding:'utf-8'}).replace(/<DATA\/>/, "<script id=\"__temp__\">const DATA = " + JSON.stringify(db.data.rooms[req.session.roomName].steps) + ";setTimeout(_=>{document.getElementById(\"__temp__\").parentElement.removeChild(document.getElementById(\"__temp__\"))},0)</script>"));
});
app.get(`/analyze/`, function(_,res){
	if(!req.session.roomName?.length){
		res.redirect('/monitor#mustSelectRoom');
		return;
	}
	if(!db.data.rooms[req.session.roomName]){
		res.redirect('/monitor#roomDoesNotExist');
		return;
	}
	res.send(readFileSync('pages/analyze/index.html', {encoding:'utf-8'}).replace(/<DATA\/>/, "<script id=\"__temp__\">const DATA = " + JSON.stringify(db.data.rooms[req.session.roomName].steps) + ";setTimeout(_=>{document.getElementById(\"__temp__\").parentElement.removeChild(document.getElementById(\"__temp__\"))},0)</script>"));
});

//These pages should clear the room name
app.get(`/home/`, function(req,res){
	req.session.roomName = '';
	res.sendFile(__dirname + `/pages/home/index.html`)
});
app.get('/join/', function(req,res){
	req.session.roomName = '';
	res.sendFile(__dirname + '/pages/join/index.html');
})
app.get('/monitor/', function(req,res){
	req.session.roomName = '';
	res.sendFile(__dirname + '/pages/monitor/index.html');
})

app.get('/', function(req,res){res.redirect('/home')});

app.post('/join/action', function(req, res) {
	let {roomName, roomCode} = req.body;
	console.log(db.data, db.data.rooms);
	if (db.data.rooms[roomName]?.roomCode == roomCode){
		req.session.roomName = roomName;
		res.redirect(`/scout#${roomName}`);
	} else {
		res.redirect('/join#invalidCode')
	}
	res.end();
});
app.post('/monitor/action', function(req, res) {
	let {roomName,roomCode,action} = req.body;
	switch(action){
		case "CREATE":
			if(db.data.rooms[roomName]){
				res.redirect('/monitor#roomNameTaken');
				return;
			}
			if(/[^A-Za-z0-9_]/g.test(roomName) || roomName.length == 0){
				res.redirect('/monitor#badRoomName');
				return;
			}
			db.data.rooms[roomName] = {roomCode: roomCode, data:{}, steps:[]};
			db.saveData();
			res.redirect(`/analyze#${roomName}`);
			return;
		case "SCOUT":
			if(!db.data.rooms[roomName]){
				res.redirect('/monitor#roomDoesNotExist');
				return;
			}
			if(db.data.rooms[roomName].roomCode != roomCode){
				res.redirect('/monitor#invalidRoomCode');
				return;
			}
			req.session.roomName = roomName;
			res.redirect(`/scout#${roomName}`);
			return;
		case "ANALYZE":
			if(!db.data.rooms[roomName]){
				res.redirect('/monitor#roomDoesNotExist');
				return;
			}
			if(db.data.rooms[roomName].roomCode != roomCode){
				res.redirect('/monitor#invalidRoomCode');
				return;
			}
			res.redirect(`/analyze#${roomName}`);
			return;
		case "DELETE":
			if(!db.data.rooms[roomName]){
				res.redirect('/monitor#roomDoesNotExist');
				return;
			}
			if(db.data.rooms[roomName].roomCode != roomCode){
				res.redirect('/monitor#invalidRoomCode');
				return;
			}
			delete db.data.rooms[roomName];
			db.saveData();
			res.redirect(`/monitor#roomDeleted`);
			return;
	}
});

app.get('/')

app.post('/analyze/action', function(req, res) {
	//TODO: implement stuff
});

app.post('/scout/action', function(req, res) {
	let j = req.body;
	let roomDat = db.data.rooms[req.session.roomName];
	if(!roomDat.data[j.team]) roomDat.data[j.team] = [];
	roomDat.data[j.team].push(j.data);
	db.saveData();
});



server.listen(3000, '0.0.0.0');

console.log("Started server");