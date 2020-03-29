const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const dateFormat = require('dateformat');
const { body } = require('express-validator');

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

//Get all flights in the database and render all_flights page
router.get('/', function(req, res, next) {
    var sql =  "SELECT * FROM flights ORDER BY departure_date, departure_time ASC";
    var rows = [];

    // Get all flights and order then by departure date and departure time
    mysqlConnection.query(sql, function (err, result) {
        if (err){ throw err}
        else
        {
            
            for(var i = 0; i < result.length; i++)
            {
                var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');
                var departDate = dateFormat(result[i].departure_date, 'mm-dd-yyyy');

                var obj= {
                    flight_no: result[i].flight_no,
                    airline_name: result[i].airline_name,
                    no_passengers: result[i].no_passengers,
                    total_seats: result[i].total_seats,
                    departure_time: departTime,
                    departure_date: departDate,
                    destination: result[i].destination
                }

                rows.push(obj);
            }
            
            res.render(path.resolve(__dirname, '../views') + '/all_flights', {flights: rows});
        }
    });
});

//Render view for the add_flight page
router.get('/newFlight', function(req, res, next) {
    res.render(path.resolve(__dirname, '../views') + '/add_flight', {});
});

//Render view for the edit_flight page using the flight's flight number
router.get('/:id/edit', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql1 =  "SELECT * FROM flights WHERE flight_no = " + id;
    var sql2 =  "SELECT * FROM passengers WHERE flight_no = " + id;
    var sqlGetPotentialPassengers =  "SELECT DISTINCT p.first_name, p.last_name, p.assigned, p.destination, p.passenger_id FROM passengers p JOIN flights f ON p.destination = f.destination WHERE p.assigned = FALSE";
    
    // Get flight by flight number
    mysqlConnection.query(sql1, function (err, result1) {
        if (err){ throw err}
        else
        { 
            var flight = result1[0];
            var departTime = dateFormat(flight.departure_time, 'hh:MM TT');
            var departDate = dateFormat(flight.departure_date, 'yyyy-mm-dd');
            var timeOfDay = departTime[6] + departTime[7];
            var hour = parseInt(departTime[0] + departTime[1]);
            var convertedTime;

            if(timeOfDay == "PM")
            {
                hour+=12;
                convertedTime = hour + ":" + departTime[3] + departTime[4];
            }
            else
            {
                convertedTime = departTime[0] + departTime[1] + ":" + departTime[3] + departTime[4];
            }

            var obj= {
                flight_no: flight.flight_no,
                airline_name: flight.airline_name,
                no_passengers: flight.no_passengers,
                total_seats: flight.total_seats,
                departure_time: convertedTime,
                departure_date: departDate,
                destination: flight.destination
            }

            console.log(obj);

            // Get all passengers that have the flight number that matches the current flight's flight number
            mysqlConnection.query(sql2, function (err, result2) {
                if (err){ throw err}
                else
                {
                    console.log(result2);
                    // Get passengers that an be assigned to the flight based on destination
                    mysqlConnection.query(sqlGetPotentialPassengers, function (err, result3) {
                        if (err){ throw err}
                        else
                        {
                            
                            console.log("Result: " + result3);
                            res.render(path.resolve(__dirname, '../views') + '/edit_flight', {flight: obj, passengers: result2, potential: result3});
                        }
                    });
                }
            });
        }
    });
});

// Get flight by flight number and render flight_info
router.get('/:id', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql1 =  "SELECT * FROM flights WHERE flight_no = " + id;
    var sql2 =  "SELECT * FROM passengers WHERE flight_no = " + id;
    var sqlGetPotentialPassengers =  "SELECT DISTINCT p.first_name, p.last_name, p.assigned, p.destination, p.passenger_id FROM passengers p JOIN flights f ON p.destination = f.destination WHERE p.assigned = FALSE";

    // Get flight by flight number
    mysqlConnection.query(sql1, function (err, result1) {
        if (err){ throw err}
        else
        { 
            var flight = result1[0];
            var departTime = dateFormat(flight.departure_time, 'hh:MM TT');
            var departDate = dateFormat(flight.departure_date, 'mm-dd-yyyy');

            var obj= {
                flight_no: flight.flight_no,
                airline_name: flight.airline_name,
                no_passengers: flight.no_passengers,
                total_seats: flight.total_seats,
                departure_time: departTime,
                departure_date: departDate,
                destination: flight.destination
            }

            console.log(obj);

            // Get passengers that have the flight number that matches the current flight's flight number
            mysqlConnection.query(sql2, function (err, result2) {
                if (err){ throw err}
                else
                {
                    console.log(result2);

                    // Get passengers that an be assigned to the flight based on destination
                    mysqlConnection.query(sqlGetPotentialPassengers, function (err, result3) {
                        if (err){ throw err}
                        else
                        {
                            res.render(path.resolve(__dirname, '../views') + '/flight_info', {flight: obj, passengers: result2, potential: result3});
                        }
                    });
                }
            });
        }
    });
});

//Update flight information using values from edit_flight
router.put('/:id', 
 [

    body('airline_name').isAlpha().withMessage('Airline name must be only alphabetical chars')
                      .isLength({max: 40, min: 1}).withMessage('First name character length must be between 1 and 40'),
  
    body('destination').isAlpha().withMessage('Destination must be only alphabetical chars')
                     .isLength({max: 3, min: 3}).withMessage('Destination character length must be 3')
  ],
   function(req, res, next) {
    var qs = req.body;
    var id = req.sanitize(req.params.id)

    var airline_name = req.sanitize(qs.airline_name);
    var departure_date = req.sanitize(qs.departure_date);
    var departure_time = req.sanitize(qs.departure_time);
    var total_seats = req.sanitize(qs.total_seats);
    var destination = req.sanitize(qs.destination);
    destination = destination.toUpperCase();

    var sql3 =  "UPDATE flights SET airline_name='" + airline_name + "', departure_date=STR_TO_DATE('" + departure_date + "', '%Y-%m-%d'), departure_time=STR_TO_DATE('" + departure_time + "', '%h:%i %p'), destination='" + destination + "', total_seats=" + total_seats +  " WHERE flight_no = " + id;
    var sql1 =  "SELECT * FROM flights WHERE flight_no = " + id;
    var sql2 =  "SELECT * FROM passengers WHERE flight_no = " + id;
    var sqlGetPotentialPassengers =  "SELECT DISTINCT p.first_name, p.last_name, p.assigned, p.destination, p.passenger_id FROM passengers p JOIN flights f ON p.destination = f.destination WHERE p.assigned = FALSE";

    // Update flight information
    mysqlConnection.query(sql3, function (err, result1) {
        if (err){ throw err}
        else
        {
           console.log("Updated flight");

           //Get flight by flight number
           mysqlConnection.query(sql1, function (err, result1) {
            if (err){ throw err}
            else
            { 
                var flight = result1[0];
                var departTime = dateFormat(flight.departure_time, 'hh:MM TT');
                var departDate = dateFormat(flight.departure_date, 'mm-dd-yyyy');
    
                var obj= {
                    flight_no: flight.flight_no,
                    airline_name: flight.airline_name,
                    no_passengers: flight.no_passengers,
                    total_seats: flight.total_seats,
                    departure_time: departTime,
                    departure_date: departDate,
                    destination: flight.destination
                }
    
                console.log(obj);

                // Get passengers that have the flight number that matches the current flight's flight number
                mysqlConnection.query(sql2, function (err, result2) {
                    if (err){ throw err}
                    else
                    {
                        console.log(result2);

                        // Get passengers that an be assigned to the flight based on destination
                        mysqlConnection.query(sqlGetPotentialPassengers, function (err, result3) {
                            if (err){ throw err}
                            else
                            {
                                res.render(path.resolve(__dirname, '../views') + '/flight_info', {flight: obj, passengers: result2, potential: result3});
                            }
                        });
                    }
                });
            }
        });
        }
    });
});

// Insert new flight into the database
router.post('/', 
[

    body('airline_name').isAlpha().withMessage('Airline name must be only alphabetical chars')
                      .isLength({max: 40, min: 1}).withMessage('First name character length must be between 1 and 40'),
  
    body('destination').isAlpha().withMessage('Destination must be only alphabetical chars')
                     .isLength({max: 3, min: 3}).withMessage('Destination character length must be 3')
  ],
function(req, res, next) {
    var qs = req.body;

    var airline_name = req.sanitize(qs.airline_name);
    var departure_date = req.sanitize(qs.departure_date);
    var departure_time = req.sanitize(qs.departure_time.toString());
   
    var total_seats = req.sanitize(qs.total_seats);
    var destination = req.sanitize(qs.destination);
    destination = destination.toUpperCase();

    var no_passengers = 0;
    var hours = parseInt(departure_time[0] + departure_time[1]);
    var minutes = parseInt(departure_time[3] + departure_time[4]);
    var timeOfDay;

    console.log("Hours: " + hours);
    console.log("Minutes: " + minutes);

    if(hours > 11)
    {
        timeOfDay = "PM";
    }
    else
    {
        timeOfDay = "AM";
    }

    if(hours > 12)
    {
        hours = hours - 12;
    }

    departure_time = hours + ":" + minutes + " " + timeOfDay;

    
    console.log(departure_date + " " + departure_time);

    var insert = "INSERT INTO flights (airline_name, no_passengers, total_seats, departure_time, departure_date, destination)";
    var values = " VALUES ('" + airline_name + "', " + no_passengers + ", " + total_seats + ", STR_TO_DATE('" + departure_time + "', '%h:%i %p'), STR_TO_DATE('" + departure_date + "', '%Y-%m-%d'), '" + destination + "');";
    var sqlInsert = insert + values;
    
    //Insert new flight
    mysqlConnection.query(sqlInsert, function (err, result1) {
        if (err){ throw err}
        else
        {
           console.log("Flight Insert");
           var sql =  "SELECT * FROM flights ORDER BY departure_date, departure_time ASC";
           var rows = [];

           //Get all flights
           mysqlConnection.query(sql, function (err, result) {
                if (err){ throw err}
                else
                {
                    
                    for(var i = 0; i < result.length; i++)
                    {
                        var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');
                        var departDate = dateFormat(result[i].departure_date, 'mm-dd-yyyy');

                        var obj= {
                            flight_no: result[i].flight_no,
                            airline_name: result[i].airline_name,
                            no_passengers: result[i].no_passengers,
                            total_seats: result[i].total_seats,
                            departure_time: departTime,
                            departure_date: departDate,
                            destination: result[i].destination
                        }

                        rows.push(obj);
                    }
                    
                    res.render(path.resolve(__dirname, '../views') + '/all_flights', {flights: rows});
                }
            });
        }
    });
});


// Assign passenger to flight by updating flight number 
router.patch('/:id', function(req, res, next) {
    var qs = req.body;
    var id = req.sanitize(req.params.id);

    var sqlUpdatePassenger =  "UPDATE passengers SET assigned=TRUE, flight_no = " + id + " WHERE passenger_id=" + req.sanitize(qs.passenger_list);
    var sqlGetFlight =  "SELECT * FROM flights WHERE flight_no = " + id;
    var sqlGetPassengers =  "SELECT * FROM passengers WHERE flight_no = " + id;
    var sqlGetPotentialPassengers =  "SELECT DISTINCT p.first_name, p.last_name, p.assigned, p.destination, p.passenger_id FROM passengers p JOIN flights f ON p.destination = f.destination WHERE p.assigned = FALSE";

    //Get flight by flight number
    mysqlConnection.query(sqlGetFlight, function (err, flights) {
        if (err){ throw err}
        else
        {
            var flight = flights[0];
            var noPassengers = flights[0].no_passengers
            var totalSeats = flights[0].total_seats;

            if(noPassengers >= totalSeats)
            {
                console.log("Flight is full")
            }
            else
            {
                // Assign passenger by updating passenger's flight number
                mysqlConnection.query(sqlUpdatePassenger, function (err, flights) {
                    if (err){ throw err}
                    else
                    {
                      console.log("Assigned passenger");

                      var newNoPassengers = noPassengers + 1;
                      var sqlUpdateFlight =  "UPDATE flights SET no_passengers = " + newNoPassengers + " WHERE flight_no=" + id;
                    
                      // Update number of passengers on flight
                      mysqlConnection.query(sqlUpdateFlight, function (err, flights) {
                         if (err){ throw err}
                         else
                         {
                            console.log("Updated flight");

                            mysqlConnection.query(sqlGetPassengers, function (err, passengers) {
                                if (err){ throw err}
                                else
                                {
                                    var departTime = dateFormat(flight.departure_time, 'hh:MM TT');
                                    var departDate = dateFormat(flight.departure_date, 'mm-dd-yyyy');
                    
                                    var obj= {
                                        flight_no: flight.flight_no,
                                        airline_name: flight.airline_name,
                                        no_passengers: newNoPassengers,
                                        total_seats: flight.total_seats,
                                        departure_time: departTime,
                                        departure_date: departDate,
                                        destination: flight.destination
                                    }

                                   // Get passengers that an be assigned to the flight based on destination
                                   mysqlConnection.query(sqlGetPotentialPassengers, function (err, result3) {
                                        if (err){ throw err}
                                        else
                                        {
                                            res.render(path.resolve(__dirname, '../views') + '/flight_info', {flight: obj, passengers: passengers, potential: result3});
                                        }
                                     });
                                }
                              });

                         }
                       });
                    }
                });
            }
        }
    });
   
});

// Delete flight by flight number
router.delete('/:id', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql1 =  "DELETE FROM flights WHERE flight_no = " + id;
    var sqlUpdate =  "UPDATE passengers SET assigned=FALSE WHERE flight_no =" + id;

    //Update passengers that were assigned to the flight
    mysqlConnection.query(sqlUpdate, function (err, result) {
        if (err){ throw err}
        else
        {                    
           console.log("Passengers Updated");                  
        }
    }); 

    //Delete flight from database
    mysqlConnection.query(sql1, function (err, result1) {
        if (err){ throw err}
        else
        {
            console.log("Flight Deleted");
            var sql =  "SELECT * FROM flights ORDER BY departure_date, departure_time ASC";

            var rows = [];

            mysqlConnection.query(sql, function (err, result) {
                if (err){ throw err}
                else
                {
                    
                    for(var i = 0; i < result.length; i++)
                    {
                        var departTime = dateFormat(result[i].departure_time, 'hh:MM TT');
                        var departDate = dateFormat(result[i].departure_date, 'mm-dd-yyyy');
        
                        var obj= {
                            flight_no: result[i].flight_no,
                            airline_name: result[i].airline_name,
                            no_passengers: result[i].no_passengers,
                            total_seats: result[i].total_seats,
                            departure_time: departTime,
                            departure_date: departDate,
                            destination: result[i].destination
                        }
        
                        rows.push(obj);
                    }
                    
                    res.render(path.resolve(__dirname, '../views') + '/all_flights', {flights: rows});
                }
            });        
        }
    });
});

// Remove a passenger from a flight using flight number and passenger id
router.delete('/:fid/:pid', function(req, res, next) {
    var fid = req.sanitize(req.params.fid)
    var pid = req.sanitize(req.params.pid)

    var sql1 =  "DELETE FROM passengers WHERE passenger_id = " + pid;
    var sql =  "SELECT * FROM passengers WHERE passenger_id = " + pid;
    var sqlGetPassengers =  "SELECT * FROM passengers WHERE flight_no = " + fid;

    // Get passenger by passenger id
    mysqlConnection.query(sql, function (err, result) {
        if (err){ throw err}
        else
        {    
            var passenger = {
                passenger_id: result[0].passenger_id,
                flight_no: result[0].flight_no,
                first_name: result[0].first_name,
                last_name: result[0].last_name,
                assigned: result[0].assigned,
                destination: result[0].destination
            }

            var insert = "INSERT INTO passengers (passenger_id, flight_no, first_name, last_name, assigned, destination)";
            var values = " VALUES (" + passenger.passenger_id + ", NULL,'" + passenger.first_name + "','" + passenger.last_name + "', FALSE, '" + passenger.destination + "');";
            var sqlInsert = insert + values;

            // Delete passenger from database so flight number can be set to null
            mysqlConnection.query(sql1, function (err, result) {
                if (err){ throw err}
                else
                {  
                    // Reinsert passenger with flight number set to null  
                    mysqlConnection.query(sqlInsert, function (err, result) {
                        if (err){ throw err}
                        else
                        {      
                           console.log("Passenger Reinserted");  

                           var sql11 =  "SELECT * FROM flights WHERE flight_no = " + fid;
                           var sql22 =  "SELECT * FROM passengers WHERE flight_no = " + fid;
                       
                           // Get flight by flight number
                           mysqlConnection.query(sql11, function (err, result1) {
                               if (err){ throw err}
                               else
                               {
                                   console.log(result1);

                                   // Get passengers with flight number that matches flight's current flight number
                                   mysqlConnection.query(sql22, function (err, result2) {
                                       if (err){ throw err}
                                       else
                                       {
                                           console.log(result2);
                                           var flight = result1[0];
                                           var newNoPassengers = flight.no_passengers - 1;
                                           var sqlUpdateFlight =  "UPDATE flights SET no_passengers = " + newNoPassengers + " WHERE flight_no=" + fid;
                                            
                                           //Update passenger number of flight
                                            mysqlConnection.query(sqlUpdateFlight, function (err, flights) {
                                                if (err){ throw err}
                                                else
                                                {
                                                    console.log("Updated flight");

                                                    mysqlConnection.query(sqlGetPassengers, function (err, passengers) {
                                                        if (err){ throw err}
                                                        else
                                                        {
                                                            var departTime = dateFormat(flight.departure_time, 'hh:MM TT');
                                                            var departDate = dateFormat(flight.departure_date, 'mm-dd-yyyy');
                                            
                                                            var obj= {
                                                                flight_no: flight.flight_no,
                                                                airline_name: flight.airline_name,
                                                                no_passengers: newNoPassengers,
                                                                total_seats: flight.total_seats,
                                                                departure_time: departTime,
                                                                departure_date: departDate,
                                                                destination: flight.destination
                                                            }

                                                            res.render(path.resolve(__dirname, '../views') + '/flight_info', {flight: obj, passengers: result2});

                                                           
                                                        }
                                                    });

                                                }
                                            });
                                       }
                                   });
                               }
                           });                
                        }
                    });                 
                }
            });                  
        }
    }); 

   
});

module.exports = router;