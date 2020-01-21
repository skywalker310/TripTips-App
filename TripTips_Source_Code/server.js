var express = require('express')
var expressLayouts = require('express-ejs-layouts');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var request = require('request');
var app = express();

//Setting Up MySQL connection
var mysql = require("mysql");
var credentials = require('./config/key.json');
var HOST = credentials.host;
var USER = credentials.user;
var PASSWORD = credentials.password;
var DATABASE = credentials.database;
var con = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE
});

// Google API Key
var api_credentials = require('./config/googleapi.json');
var api_key = api_credentials.key;

con.connect(function (err) {
	if (err) {
		console.log("Error connecting to database");
	}
	else {
		console.log("Database successfully connected");
	}
});

// Embedded JavaScript (EJS)
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express Session
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Connect flash for notification messages
app.use(flash());

// Global Variables to define specific notification messages
app.use((req, res, next) => {
	// Notification for Registration Page
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg');

	// Notification for Passport Login Verification
	res.locals.error = req.flash('error');
	next();
});

// Routes
app.use('/', require('./routes/index'));

// Login/Register Endpoints routes (ex. /users/login)
app.use('/users', require('./routes/users'));

// Image
app.use(express.static('./public'));

//get user locations endpoint (works by sending userid)
//use this as reference "/getuserlocations?userid=<id>"
app.get("/getuserlocations", function (req, res) {
	var query = "SELECT * FROM locations WHERE UserID=" + con.escape(req.query.userid)
	console.log(req.query)
	con.query(query, function (err, rows, fields) {
		if (err) {
			console.log(err)
		}
		else {
			var loc_list = "";
			for (var i = 0; i < rows.length; i++) {
				loc_list += `<a onclick=viewLocation("modal-view",` + rows[i].locID + `)>
										<div class="row">
												<div class="col-lg">
														<div class="row">
																<div class="col-sm-6">
																		<h3>Location ` + (i+1) + `:</h3><p>`+ rows[i].locName + `</p>
																		<h3>Address:</h3><p>`+ rows[i].locAddress + `</p>
																		<p id="locID" style="display:none;">`+ rows[i].locID + `</p>
																		<p id="locLon" style="display:none;">`+ rows[i].locLon + `</p>
																		<p id="locLat" style="display:none;">`+ rows[i].locLat + `</p>
																		<h3>Location Type:</h3><p>`+ rows[i].locType + `</p>
																		<h3>Location Price:</h3><p>`+ rows[i].locPrice + `</p>
																</div>
														</div>
												</div>
										</div>
										</a>
										<hr>`
			}
			res.write(loc_list);
			res.end();
		}
	});
});

//get specific user location and display in view modal
app.get("/getLocation", function (req, res) {
	var query = "SELECT * FROM locations WHERE locID=" + con.escape(req.query.locID)
	console.log(req.query)
	con.query(query, function (err, rows, fields) {
		if (err) {
			console.log(err)
		}
		else {
			var locationInfo = "";
			for (var i = 0; i < rows.length; i++) {
				locationInfo += `<div class="form-group">
								          <label for="nameView">Name:</label>
								          <input type="text" class="form-control" id="nameView"  value="`+ rows[i].locName + `" disabled>
								        </div>
								        <div class="form-group">
								          <label for="addressView">Address:</label>
								          <textarea class="form-control" id="addressView" disabled>`+ rows[i].locAddress + `</textarea>
								        </div>
								        <div class="form-group">
								          <label for="priceView">Price Range:</label>
								          <input type="text" class="form-control" id="priceView" value="`+ rows[i].locPrice + `" disabled>
								        </div>
								        <div class="form-group">
								          <label for="typeView">Location Type:</label>
								          <input type="text" class="form-control" id="typeView" value="`+ rows[i].locType + `" disabled>
								        </div>
								        <div class="form-group">
								            <label for="noteView">Personal Note:</label>
								            <textarea class="form-control" id="noteView" maxlength="255" disabled>`+ rows[i].locNote + `</textarea>
										</div>
												<script> var locID=`+ rows[i].locID + `</script>
											`
			}
			res.write(locationInfo);
			res.end();
		}
	});
});

// remove location
app.get("/removeLocation", function (req, res) {
	var query = "DELETE FROM locations WHERE locID=" + con.escape(parseInt(req.query.locID))
	console.log(req.query)
	con.query(query, function (err, rows, fields) {
		if (err) {
			console.log(err)
		}
		else {
			console.log("Successful Deletion");
		}

	});
});

//post user location endpoint
//https://maps.googleapis.com/maps/api/geocode/json?address=Drexel&key=AIzaSyDWDVo9ILOpip9zH6VkNGWUJHE2epFVrE8
app.get('/postuserlocations', function (req, res) {
	console.log(req.query)
	var locName = req.query.locName;
	var locAddress = req.query.locAddress;
	var locType = req.query.locType;
	var locPrice = req.query.locPrice;
	var locNote = req.query.locNote;
	var UserID = req.query.userid;
	var addressMod = locAddress.replace(/\s+/g, '+')
	var locLon = undefined;
	var locLat = undefined;
	var data;
	var URL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addressMod + "&key=" + api_key;
	console.log(URL);
	request.get(URL, function (error, response, body) {
		//console.log(body);
		var json = JSON.parse(body);
		//console.log(json);
		if (json.status == "OK") {
			console.log(json.results[0].geometry);
			locLat = json.results[0].geometry.location.lat;
			locLon = json.results[0].geometry.location.lng;
			locAddress = json.results[0].formatted_address;
			data = {
				"locLon": locLon,
				"locLat": locLat,
				"locAddress": locAddress,
				"status": "OK"
			}
			console.log(data)
		}
		if (locLon != undefined && locLat != undefined) {
			var query = 'INSERT INTO locations (locName,locAddress,locType,locPrice,locNote,locLon,locLat,UserID) VALUES (' + con.escape(locName) + ',' + con.escape(locAddress) + ',' + con.escape(locType) + ',' + con.escape(locPrice) + ',' + con.escape(locNote) + ',' + con.escape(locLon) + ',' + con.escape(locLat) + ',' + con.escape(UserID) + ")"
			con.query(query, function (err, rows, fields) {
				if (err) {
					console.log('Error during query processing');
					console.log(err);
				} else {
					console.log(data)
					res.json(data);
				}
			});
		}
		else {
			data = {
				"locLon": locLon,
				"locLat": locLat,
				"locAddress": locAddress,
				"status": "ZERO_RESULTS"
			}
			res.json(data)
		}
	});
});

// Called to get one unique location coordinates
app.get("/getCoordinates", function (req, res) {
	var query = "SELECT * FROM locations WHERE locID=" + con.escape(req.query.locID)
	console.log(req.query)
	con.query(query, function (err, rows, fields) {
		if (err) {
			console.log(err)
		}
		else {

			console.log(rows)
			var lon = [];
			var lat = [];
			for (var i = 0; i < rows.length; i++) {
				lon = lon.concat(rows[i].locLon);
				lat = lat.concat(rows[i].locLat);
			}

			var coord = [lon, lat];
			console.log(coord)

			res.write(JSON.stringify(coord));
			res.end();
		}
	});
});

// Main function to get all locations for main map
app.get("/getALLCoordinates", function (req, res) {
	var query = "SELECT * FROM locations WHERE UserID = " + con.escape(req.query.userID)
	console.log(query)
	con.query(query, function (err, rows, fields) {
		if (err) {
			console.log(err)
		}
		else {
			console.log(rows)
			var lon = [];
			var lat = [];
			for (var i = 0; i < rows.length; i++) {
				lon = lon.concat(rows[i].locLon);
				lat = lat.concat(rows[i].locLat);
			}

			var coord = [lon, lat];
			console.log(coord)

			res.write(JSON.stringify(coord));
			res.end();
		}
	});
});

var port = process.env.PORT || 8080;

app.listen(port);
console.log('Server Running');
console.log("Port: " + port);
