var express = require('express');
var router = express.Router();
var path = require('path');


// Render about page
router.get('/', function(req, res, next) {
  
    res.render(path.resolve(__dirname, '../views') + '/about', {});

});


module.exports = router;
