var express = require('express');
var router = express.Router();
var path = require('path');


// render help page
router.get('/', function(req, res, next) {
  
    res.render(path.resolve(__dirname, '../views') + '/help', {});

});


module.exports = router;
