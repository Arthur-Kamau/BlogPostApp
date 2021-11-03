var express = require('express');
const dbo = require("../db");
var router = express.Router();



router.get('/all', function(req, res, next) {
    let dbConnect = dbo.getDb();
    const postsCollection = dbConnect.collection('users');
    postsCollection.find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching users!");
            } else {
                res.json(result);
            }
        });
});


router.get('/:user_id', function(req, res, next) {
    if(req.params.user_id === undefined){
        res.status(400).send("Error user id not found");
    }else{
        const userId = req.params.user_id;
        if (userId === undefined) {
            res.status(400).send("post id not found");
        } else {
            let dbConnect = dbo.getDb();
            const postsCollection = dbConnect.collection('users');
            postsCollection.findOne({user_id: Number(userId)}).then(dbRes => {
                if (dbRes === undefined) {
                    res.status(404).send("no user found")
                }else {
                    res.status(200).send(JSON.stringify(dbRes));
                }
            });
        }
    }
});
module.exports = router;
