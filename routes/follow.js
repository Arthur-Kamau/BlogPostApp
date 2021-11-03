const express = require('express');
const dbo = require("../db");
const {createDecipheriv} = require("crypto");
const cy = require("../crypto");
const router = express.Router();

const key = cy.getKey();
const iv = cy.getIv();

router.get('/:user_id', function(req, res, next) {
    if(req.params.user_id === undefined){
        res.status(400).send("Error user id not found");
    }else{
        const decipher = createDecipheriv('aes256', key, iv);
        const encryptedMessage = req.headers.authorization;
        const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
        const userDataStr = decryptedMessage.toString('utf-8')


        const userData = JSON.parse(userDataStr);

        let dbConnect = dbo.getDb();
        const followingCollection = dbConnect.collection('following');
        followingCollection
            .findOne({user: Number(req.params.user_id)}).then(dbRes => {
            console.log(" db post" + JSON.stringify(dbRes));
            if (dbRes === null) {
                res.status(400).send('post not found');
            } else {

                if (dbRes.followers.includes(userData.user_id)) {
                    res.status(200).send("okay");
                } else {
                    let liky = dbRes.followers;
                    liky.push(userData.user_id)
                    console.log("likes" + liky)
                    followingCollection.updateOne({user: Number(req.params.user_id)}, {
                        $set: {
                            followers: liky
                        }
                    }, function (err, _result) {
                        if (err) {
                            console.error("erro " + err)
                            res.status(400).send(`Error updating followers on listing for user id ${req.params.user_id}!`);
                        } else {
                            console.log("1 document updated");
                            res.status(200).send("update success");
                        }
                    });
                }
            }
        });
    }

});


router.get('/remove/:user_id', function(req, res, next) {
    if(req.params.user_id === undefined){
        res.status(400).send("Error user id not found");
    }else{
        const decipher = createDecipheriv('aes256', key, iv);
        const encryptedMessage = req.headers.authorization;
        const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
        const userDataStr = decryptedMessage.toString('utf-8')


        const userData = JSON.parse(userDataStr);

        let dbConnect = dbo.getDb();
        const followingCollection = dbConnect.collection('following');



        followingCollection
            .findOne({"user_id": Number(req.params.user_id)}).then(dbRes => {
            console.log("db post" + JSON.stringify(dbRes));
            if (dbRes === undefined) {
                res.status(400).send('post not found');
            } else {

                followingCollection.updateOne({user_id: dbRes.user_id}, {
                    $set: {
                        followers: dbRes.followers.filter(function (item) {
                            return item !== userData.user_id
                        })

                    }
                }, function (err, _result) {
                    if (err) {
                        res.status(400).send(`Error updating likes on listing with id ${listingQuery.id}!`);
                    } else {
                        console.log("1 document updated");
                        res.status(200).send("update success");
                    }
                });
            }
        });
    }
});
module.exports = router;
