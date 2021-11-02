var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    const dbConnect = dbo.getDb();

    dbConnect
        .collection("users")
        .find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching listings!");
            } else {
                res.json(result);
            }
        });

    // res.render('index', { title: 'Express' });

});


router.post('/', function(req, res, next) {
    res.send( { title: 'Express' });
});

module.exports = router;
