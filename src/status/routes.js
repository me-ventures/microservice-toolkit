var express = require('express');
var router = express.Router();

router.get('/status', function(req, res){
    res.status(200).json({
        hello: 'world'
    });
});




module.exports = router;
