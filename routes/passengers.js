const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const dateFormat = require('dateformat');

const { check, validationResult } = require('express-validator');
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

// Get all passengers and render all_passengers view
router.get('/', function(req, res, next) {
    var sql =  "SELECT * FROM passengers ORDER BY first_name, last_name ASC";
    var rows = [];

    // Get all passengers and order tem by first name and last name
    mysqlConnection.query(sql, function (err, result) {
        if (err){ throw err}
        else
        {
            
            for(var i = 0; i < result.length; i++)
            {
               
                var obj= {
                    flight_no: result[i].flight_no,
                    first_name: result[i].first_name,
                    last_name: result[i].last_name,
                    assigned: result[i].assigned,
                    passenger_id: result[i].passenger_id,
                    destination: result[i].destination
                }
                console.log(obj.first_name);
                rows.push(obj);
            }
            
            res.render(path.resolve(__dirname, '../views') + '/all_passengers', {passengers: rows});
        }
    });
});

// Render add_passenger view
router.get('/newPassenger', function(req, res, next) {
   
    res.render(path.resolve(__dirname, '../views') + '/add_passenger', {});
});

// Get passenger by id and render passenger_info view
router.get('/:id', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql2 =  "SELECT * FROM passengers WHERE passenger_id = " + id;

    mysqlConnection.query(sql2, function (err, result1) {
        if (err){ throw err}
        else
        {
            res.render(path.resolve(__dirname, '../views') + '/passenger_info', {passenger: result1[0]});
        }
    });
});

// Get passenger by id and render assign_passenger view
router.get('/:id/assign', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql1 =  "SELECT DISTINCT f.flight_no, f.departure_date, f.departure_time, f.destination FROM flights f JOIN passengers p ON f.destination = p.destination WHERE p.passenger_id = " + id;
  
    // Get flights that have the same destination as the passenger
    mysqlConnection.query(sql1, function (err, result) {
        if (err){ throw err}
        else
        {
            var rows = [];

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
           

            res.render(path.resolve(__dirname, '../views') + '/assign_flight', {flights: rows, passenger_id: id});       
        }
    });
});

// Get passenger by id and render edit_passenger view
router.get('/:id/edit', function(req, res, next) {
    var id = req.sanitize(req.params.id)

    var sql2 =  "SELECT * FROM passengers WHERE passenger_id = " + id;

    // Get passenger by id
    mysqlConnection.query(sql2, function (err, result1) {
        if (err){ throw err}
        else
        { 
            var passenger = result1[0];
           

            var obj= {
                flight_no: passenger.flight_no,
                first_name: passenger.first_name,
                last_name: passenger.last_name,
                assigned: passenger.assigned,
                passenger_id: passenger.passenger_id,
                destination: passenger.destination
            }

            console.log(obj);

            res.render(path.resolve(__dirname, '../views') + '/edit_passenger', {passenger: obj});

        }
    });
});

// Insert new passenger into database
router.post('/', [

    body('first_name').isAlpha().withMessage('First name must be only alphabetical chars')
                      .isLength({max: 40, min: 1}).withMessage('First name character length must be between 1 and 40'),
  
    body('last_name').isAlpha().withMessage('Last name must be only alphabetical chars')
                     .isLength({max: 40, min: 1}).withMessage('Last name character length must be between 1 and 40'),
  
    body('destination').isAlpha().withMessage('Destination must be only alphabetical chars')
                     .isLength({max: 3, min: 3}).withMessage('Destination character length must be 3')
  ],
  
  function(req, res, next) {
    var qs = req.body;

    var first_name = req.sanitize(qs.first_name);
    var last_name = req.sanitize(qs.last_name);
    var destination = req.sanitize(qs.destination);
    destination = destination.toUpperCase();

    var insert = "INSERT INTO passengers (flight_no, first_name, last_name, assigned, destination)";
    var values = " VALUES (NULL,'" + first_name + "','" + last_name + "', FALSE, '" + destination + "');";
    var sqlInsert = insert + values;

    // Insert new passenger into database
    mysqlConnection.query(sqlInsert, function (err, result1) {
        if (err){ throw err}
        else
        {
           console.log("Passenger inserted")

           var sql =  "SELECT * FROM passengers ORDER BY first_name, last_name ASC";
           var rows = [];

           mysqlConnection.query(sql, function (err, result) {
                if (err){ throw err}
                else
                {
                    
                    for(var i = 0; i < result.length; i++)
                    {
                       
                        var obj= {
                            flight_no: result[i].flight_no,
                            first_name: result[i].first_name,
                            last_name: result[i].last_name,
                            assigned: result[i].assigned,
                            passenger_id: result[i].passenger_id,
                            destination: result[i].destination
                        }
                        console.log(obj.first_name);
                        rows.push(obj);
                    }
                    
                    res.render(path.resolve(__dirname, '../views') + '/all_passengers', {passengers: rows});
                }
            });
        }
    });
});

// Assign passenger to a flight
router.patch('/:id', function(req, res, next) {
    var qs = req.body;
    var id = req.sanitize(req.params.id);

    var sqlGetFlight = "SELECT * FROM flights WHERE flight_no =" + req.sanitize(qs.flight_list);
    var sql1 =  "UPDATE passengers SET assigned=TRUE, flight_no = " + req.sanitize(qs.flight_list) + " WHERE passenger_id=" + id;
    var sqlU = "SELECT f.no_passengers, f.flight_no FROM flights f JOIN passengers p ON f.flight_no = p.flight_no WHERE p.passenger_id = " + id;

    // Get flight by flight number
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
                mysqlConnection.query(sql1, function (err, result1) {
                    if (err){ throw err}
                    else
                    {
                       console.log("Flight assigned");
                    
                       mysqlConnection.query(sql1, function (err, result) {
                           if (err){ throw err}
                           else
                           {
                               
                            var sql2 =  "SELECT * FROM passengers WHERE passenger_id = " + id;

                            // Get passenger by id
                            mysqlConnection.query(sql2, function (err, result1) {
                                if (err){ throw err}
                                else
                                {
                                    //Update flight's passenger number
                                    mysqlConnection.query(sqlU, function (err, result3) {
                                        if (err){ throw err}
                                        else
                                        {
                                           var flightUpdate = result3[0];
                                           var count = flightUpdate.no_passengers + 1;
                                           var sqlUpdateCount = "UPDATE flights SET no_passengers=" + count + " WHERE flight_no=" + flightUpdate.flight_no;
                                           
                                           mysqlConnection.query(sqlUpdateCount, function (err, result31) {
                                                if (err){ throw err}
                                                else
                                                {
                                                    console.log("Flight updated");
                                                    res.render(path.resolve(__dirname, '../views') + '/passenger_info', {passenger: result1[0]});
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
                
        }
    });
    
    
});

// Delete passenger by id
router.delete('/:id', function(req, res, next) {
    var id = req.sanitize(req.params.id)
    var sql1 =  "DELETE FROM passengers WHERE passenger_id = " + id;
    var sql2 = "SELECT f.no_passengers, f.flight_no FROM flights f JOIN passengers p ON f.flight_no = p.flight_no WHERE p.passenger_id = " + id;

    // Check if passenger was associated with a flight
    mysqlConnection.query(sql2, function (err, result3) {
         if (err){ throw err}
         else
         {
            if(result3.length == 0)
            {
                 console.log("Nothing")
                 res.render(path.resolve(__dirname, '../views') + '/all_passengers', {passengers: rows});
            }
            else
            {
                var flightUpdate = result3[0];
                var count = flightUpdate.no_passengers - 1;
                var sqlUpdateCount = "UPDATE flights SET no_passengers=" + count + " WHERE flight_no=" + flightUpdate.flight_no;
                
                //Update flight's passenger count
                mysqlConnection.query(sqlUpdateCount, function (err, result31) {
                     if (err){ throw err}
                     else
                     {
                         console.log("Flight updated");

                         // Delete passenger from database
                         mysqlConnection.query(sql1, function (err, result) {
                            if (err){ throw err}
                            else
                            {                    
                               console.log("Passenger Deleted");      
                               var sql =  "SELECT * FROM passengers ORDER BY first_name, last_name ASC";
                               var rows = [];

                               // Get all passengers and order by fiirst name and last name
                               mysqlConnection.query(sql, function (err, result) {
                                   if (err){ throw err}
                                   else
                                   {
                                       
                                       for(var i = 0; i < result.length; i++)
                                       {
                                          
                                           var obj= {
                                               flight_no: result[i].flight_no,
                                               first_name: result[i].first_name,
                                               last_name: result[i].last_name,
                                               assigned: result[i].assigned,
                                               passenger_id: result[i].passenger_id,
                                               destination: result[i].destination
                                           }
                                           console.log(obj.first_name);
                                           rows.push(obj);
                                       }
                    
                                       res.render(path.resolve(__dirname, '../views') + '/all_passengers', {passengers: rows});
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

//Update passenger info using new values from edit_passenger
router.put('/:id', [

    body('first_name').isAlpha().withMessage('First name must be only alphabetical chars')
                      .isLength({max: 40, min: 1}).withMessage('First name character length must be between 1 and 40'),
  
    body('last_name').isAlpha().withMessage('Last name must be only alphabetical chars')
                     .isLength({max: 40, min: 1}).withMessage('Last name character length must be between 1 and 40'),
  
    body('destination').isAlpha().withMessage('Destination must be only alphabetical chars')
                     .isLength({max: 3, min: 3}).withMessage('Destination character length must be 3')
  ],

  function(req, res, next) {
    var id = req.sanitize(req.params.id);
    var qs = req.body;

    var first_name = req.sanitize(qs.first_name);
    var last_name = req.sanitize(qs.last_name);
    var destination = req.sanitize(qs.destination);
    destination = destination.toUpperCase();

    var sql3 =  "UPDATE passengers SET first_name='" + first_name + "', last_name='" + last_name + "', destination='" + destination + "' WHERE passenger_id = " + id;
    var sqlUpdate =  "UPDATE passengers SET assigned=FALSE, flight_no WHERE flight_no = " + id;
    var sql4 = "SELECT f.destination, f.flight_no FROM flights f JOIN passengers p ON f.flight_no = p.flight_no WHERE p.passenger_id = " + id;

    // Update passenger info
    mysqlConnection.query(sql3, function (err, result1) {
        if (err){ throw err}
        else
        {
            console.log("Passenger updated");
            var sql2 =  "SELECT * FROM passengers WHERE passenger_id = " + id;

            // Get passenger by id
            mysqlConnection.query(sql2, function (err, result1) {
                if (err){ throw err}
                else
                {
                    // Check for flights the passenger was associated with
                    mysqlConnection.query(sql4, function (err, result2) {
                        if (err){ throw err}
                        else
                        {
                            // If the passenger's destination is now different from the flight he/she is assigned to, remove passenger from that flight
                            if(result1[0].destination != result2[0].destination )
                            {
                                var sql1 =  "DELETE FROM passengers WHERE passenger_id = " + id;
                                var sql =  "SELECT * FROM passengers WHERE passenger_id = " + id;
                                var sqlGetPassengers =  "SELECT * FROM passengers WHERE flight_no = " + result2[0].flight_no;

                                // Get passenger by id
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

                                        // Delete passenger so that they can be reinserted with flight number = null
                                        mysqlConnection.query(sql1, function (err, result) {
                                            if (err){ throw err}
                                            else
                                            {    
                                                // Reinsert passenger with flight number = null
                                                mysqlConnection.query(sqlInsert, function (err, result) {
                                                    if (err){ throw err}
                                                    else
                                                    {      
                                                    console.log("Passenger Reinserted");  

                                                    var sql11 =  "SELECT * FROM flights WHERE flight_no = " + result2[0].flight_no;
                                                    var sql22 =  "SELECT * FROM passengers WHERE flight_no = " + result2[0].flight_no;
                                                
                                                    // Get flight by flight number
                                                    mysqlConnection.query(sql11, function (err, result3) {
                                                        if (err){ throw err}
                                                        else
                                                        {
                                                            console.log(result1);

                                                            // Get passengers with matching flight number
                                                            mysqlConnection.query(sql22, function (err, result4) {
                                                                if (err){ throw err}
                                                                else
                                                                {
                                                                    console.log(result4);
                                                                    var flight = result3[0];
                                                                    var newNoPassengers = flight.no_passengers - 1;
                                                                    var sqlUpdateFlight =  "UPDATE flights SET no_passengers = " + newNoPassengers + " WHERE flight_no=" + result2[0].flight_no;
                                                                    
                                                                    // Update flight passenger count
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
                                                                                        var sql5 =  "SELECT * FROM passengers WHERE passenger_id = " + id;
                                                                                        
                                                                                        // Get passenger by id
                                                                                        mysqlConnection.query(sql5, function (err, result5) {
                                                                                            if (err){ throw err}
                                                                                            else
                                                                                            {
                                                                                                res.render(path.resolve(__dirname, '../views') + '/passenger_info', {passenger: result5[0]});
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
                                    }
                                }); 
                            }
                            else
                            {
                                res.render(path.resolve(__dirname, '../views') + '/passenger_info', {passenger: result1[0]});
                            }
                        }
                    });
                }
            });
          
        }
    });
});

module.exports = router;