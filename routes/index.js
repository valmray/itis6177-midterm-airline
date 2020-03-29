var express = require('express');
var router = express.Router();
var path = require('path');
var dateFormat = require('dateformat');
const mysql = require('mysql');
var expressValidator = require('express-validator');

const mysqlConnection = mysql.createConnection({
    host: 'newtestser.mysql.database.azure.com',
    user: 'myadmin@newtestser',
    password: 'Adminazure7',
    database: 'airlines',
    port: 3306
});

mysqlConnection.connect( function (err,rows) {
    if (err) throw err;    
    console.log("Connected to database!");
}); 

// Get today's flights and render the home page
router.get('/', function(req, res, next) {
  var sql =  "SELECT * FROM flights ORDER BY departure_time ASC;";

  var date = new Date(Date.now());
  date = dateFormat(date, 'yyyy-mm-dd');
  var rows = [];

  // Get flights that match today's date
  mysqlConnection.query(sql, function (err, result) {
      if (err){ throw err;} 
      else
      {
        for(var i = 0; i < result.length; i++)
        {
          var flightDate = dateFormat(result[i].departure_date, 'yyyy-mm-dd');
          console.log(flightDate + " = " + date)

          if(flightDate === date)
          {
            console.log("Match!");
            var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');

            var obj= {
              flight_no: result[i].flight_no,
              airline_name: result[i].airline_name,
              no_passengers: result[i].no_passengers,
              total_seats: result[i].total_seats,
              departure_time: departTime,
              departure_date: result[i].departure_date,
              destination: result[i].destination
            }

            console.log(departTime);

            rows.push(obj)
          }
          else{
            console.log("No Match");
          }
        }

        console.log(date);

        var reformattedDate = date[5] + date[6] + "-" + date[8] + date[9] + "-" + date[0] + date[1] + date[2] + date[3];

        res.render(path.resolve(__dirname, '../views') + '/index', {rows: rows, currentDate: reformattedDate});
      }
  });

});

// Get today's flights and render the home page
router.get('/api/v1/', function(req, res, next) {
  var sql =  "SELECT * FROM flights ORDER BY departure_time ASC;";

  var date = new Date(Date.now());
  date = dateFormat(date, 'yyyy-mm-dd');
  var rows = [];

  // Get flights that match today's date
  mysqlConnection.query(sql, function (err, result) {
      if (err){ throw err;} 
      else
      {
        //console.log(result);

        for(var i = 0; i < result.length; i++)
        {
          var flightDate = dateFormat(result[i].departure_date, 'yyyy-mm-dd');
          console.log(flightDate + " = " + date)

          if(flightDate === date)
          {
            console.log("Match!");
            var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');

            var obj= {
              flight_no: result[i].flight_no,
              airline_name: result[i].airline_name,
              no_passengers: result[i].no_passengers,
              total_seats: result[i].total_seats,
              departure_time: departTime,
              departure_date: result[i].departure_date,
              destination: result[i].destination
            }

            console.log(departTime);

            rows.push(obj)
          }
          else{
            console.log("No Match");
          }
        }

        console.log(date);

        var reformattedDate = date[5] + date[6] + "-" + date[8] + date[9] + "-" + date[0] + date[1] + date[2] + date[3];

        res.render(path.resolve(__dirname, '../views') + '/index', {rows: rows, currentDate: reformattedDate});
      }
  });

});

// Get today's flights and render the home page
router.get('/api/v1/home', function(req, res, next) {
  var sql =  "SELECT * FROM flights ORDER BY departure_time ASC;";

  var date = new Date(Date.now());
  date = dateFormat(date, 'yyyy-mm-dd');
  var rows = [];

  // Get flights that match today's date
  mysqlConnection.query(sql, function (err, result) {
      if (err){ throw err;} 
      else
      {
        for(var i = 0; i < result.length; i++)
        {
          var flightDate = dateFormat(result[i].departure_date, 'yyyy-mm-dd');
          console.log(flightDate + " = " + date)

          if(flightDate === date)
          {
            console.log("Match!");
            var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');

            var obj= {
              flight_no: result[i].flight_no,
              airline_name: result[i].airline_name,
              no_passengers: result[i].no_passengers,
              total_seats: result[i].total_seats,
              departure_time: departTime,
              departure_date: result[i].departure_date,
              destination: result[i].destination
            }

            console.log(departTime);

            rows.push(obj)
          }
          else{
            console.log("No Match");
          }
        }

        console.log(date);

        var reformattedDate = date[5] + date[6] + "-" + date[8] + date[9] + "-" + date[0] + date[1] + date[2] + date[3];

        res.render(path.resolve(__dirname, '../views') + '/index', {rows: rows, currentDate: reformattedDate});
      }
  });

});

module.exports = router;
