/* Notes

-postgres 'select' function needs '' when comparing WHERE name = 'name u looking for'

*/

const express = require('express')
const app = express();
const session = require('express-session') //npm install express-session
const path = require('path')
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

const http = require('http').Server(app);
const io = require('socket.io')(http)

const PORT = process.env.PORT || 5000

/////////////////////////Heroku Datasbase connection////////////////////
 const{Pool} = require('pg')
 var pool = new Pool({
   user:"wgenxayxlhlmqa",
   password:"edf88fec7889bc8cd246202f4847e739f2fe8dd672be3e2b2d11d20a4cc78ecd",
   host:"ec2-54-235-163-246.compute-1.amazonaws.com",
   port:5432,
   database:"ddsaml5s5nb13m",
   ssl:true
 })
////////////////////////////////////////////////////////////////////////


/////////////////////////Local Datasbase connection//////////////////////

// const{Pool} = require('pg')
// var pool = new Pool({
//   user:"postgres",
//   password:"", //Enter your pass here
//   host:"localhost",
//   port:5432,
//   database:"" //enter your own database name here
// })

////////////////////////////////////////////////////////////////////////

//////////////////////////DEFAULT STUFF//////////////////////////////////
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
////////////////////////////////////////////////////////////////////////

/////////////////////////////ADDED CONTENT////////////////////////////////
app.engine('html', require('ejs').renderFile);
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
/////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'public/login.html'));}); //allows for login page right away

///////////////////////////Chat Room Code//////////////////////////////
io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

});

const server = http.listen(PORT, function() {
    console.log('listening on *:' + PORT);
});
///////////////////////////////////////////////////////////////////////


app.post('/login', (req, res) => {
	var username = req.body.user_name;
	var password = req.body.pass;
	if (username && password) {
		pool.query(`select * from users where username = '${username}' and password = '${password}'`, (error, results) => {
			if (results.rows.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/home');
			}
			else {
				//res.send('Incorrect Username and/or Password!');
				var results = {'result':'You have entered an invalid Username and/or Password!'};
				res.render('pages/fail',results);
			}
			res.end();
		});
	} else {
		//res.send('Please enter Username and Password!');
		var results = {'result':'Please enter Username and Password!'};
		res.render('pages/fail',results);
		res.end();
	}
});

app.post('/signup', (req, res) => {
	var username = req.body.signupUser;
	var password = req.body.signupPass;
	if (username && password) {
		pool.query(`select * from users where username = '${username}'`, (error, results) => {
			if (results.rows.length <= 0) {
				pool.query(`insert into users VALUES('Random', '${username}','${password}','hi','bye',0,100);`, (error, results) => {
					if(error){
						res.send('Something went wrong!');
						var results = {'result':'Something went wrong!'};
						//res.render('pages/fail',results);

					}
				});
				req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/home');
			}
			else {
				//res.send('Username is already taken!');
				var results = {'result':'Username is already taken!'};
				res.render('pages/fail',results);

			}

		});
	} else {
		//res.send('Please enter Username and Password!');
		var results = {'result':'Please enter Username and Password!'};
		res.render('pages/fail',results);
		res.end();
	}
});

const queryWrapper = (statement) => {

    return new Promise((resolve, reject) => {

        db.query(statement, (err, result) => {
            if(err)
                return reject(err);

            resolve(result);
        });

    });

};

app.get('/home', async (req, res) =>  {
	if (req.session.loggedin) {
		const client = await pool.connect();
		const indv_stat = await client.query(`
		SELECT *
		FROM (SELECT * FROM stats
	 	ORDER BY wins
	 	LIMIT 5)S1
		CROSS JOIN
		(SELECT username as u2, wins as w2, loss as l2, kills as k2, deaths as d2
		from stats
		WHERE username = '${req.session.username}')S2
		CROSS JOIN
		(SELECT type from users
		WHERE username = '${req.session.username}')U2
		`);
		//const indv_stats = { 'indv_stats': (indv_stat) ? indv_stat.rows : null};
		// const top_stat = client.query(`SELECT * FROM stats ORDER BY wins limit 10;`);
		// if (PORT == null || PORT == ""){
		// 	PORT=8080;
		// }
		// let list = []
		res.render('pages/home', {
			'indv_stats':(indv_stat) ? indv_stat.rows : null,
			'connection':PORT
		});
		// res.end();
	}
});
app.use(express.static(__dirname + '/game'));
app.post('/play', (req,res) => {
	res.sendFile( __dirname + "/game/" + "index.html" );
});

app.get('/logout', (req,res) => {
    req.session.destroy(function(err) {
        if(err){
            res.send("Logout error!");
        }
        else{
            res.redirect('/');
        }
    })
});

app.get('/weather',async (req,res)=>{
	var exclude = "?exclude=minutely,hourly,daily,alerts,flags"
	const api_url = `https://api.darksky.net/forecast/5b2b11b4a6e6971c833905cf737ad208/49.2488,122.9805`+exclude;
	const weather_response = await fetch(api_url);
	const data = await weather_response.json();
	const wind ={
		wind: data.currently.windSpeed
	};
	console.log(wind);
	res.json(wind);	
});


 //app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
