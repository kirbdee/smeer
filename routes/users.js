var express = require('express');
var router = express.Router();
var ig = require('../lib/instagram.js');

/* GET users listing. */
router.get('/:username', function (req, res, next) {
    //IG api need to take in "error" callback in case IG fails
    ig.getUserInfo(req.params.username,
        function(data){
            res.render('users', data);
        },function(data){
            res.redirect('/404');
        })

});

module.exports = router;
