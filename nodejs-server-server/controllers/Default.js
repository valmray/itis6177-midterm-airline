'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.delPassenger = function delPassenger (req, res, next) {
  var id = req.swagger.params['id'].value;
  Default.delPassenger(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAll = function getAll (req, res, next) {
  Default.getAll()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getOne = function getOne (req, res, next) {
  var id = req.swagger.params['id'].value;
  Default.getOne(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.save = function save (req, res, next) {
  var title = req.swagger.params['title'].value;
  Default.save(title)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.update = function update (req, res, next) {
  var id = req.swagger.params['id'].value;
  var title = req.swagger.params['title'].value;
  Default.update(id,title)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
