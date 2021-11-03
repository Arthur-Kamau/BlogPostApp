const express = require('express');
const dbo = require("../db");
const crypto = require("crypto");
const router = express.Router();
const {createCipheriv, randomBytes, createDecipheriv} = require('crypto');
const cy = require("../crypto");

/// Cipher

const key = cy.getKey();
const iv = cy.getIv();


const cipher = createCipheriv('aes256', key, iv);

/* GET users listing. */
router.post('/login', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    if (password === undefined || email === undefined) {
        res.status(400).send("ensure you input email and password");
    }

    let db = dbo.getDb();
    const usersCollection = db.collection('users')

    const hash = crypto.createHash('sha256').update(email).digest('hex');
    console.log("hash: " + hash);
    usersCollection
        .findOne({"email": email, "password": hash}).then(dbRes => {

        console.log("db " + JSON.stringify(dbRes));
        if (dbRes === undefined) {
            res.status(400).send('ensure correct email and password');
        } else {
            const encryptedMessage = cipher.update(JSON.stringify({"user_id":dbRes.user_id, "name":dbRes.name}), 'utf8', 'hex') + cipher.final('hex');

            res.status(200).send({"token": encryptedMessage})
        }
    });

});

router.post('/register', function (req, res, next) {

    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;


    if (name === undefined || password === undefined || email === undefined) {
        res.status(400).send("ensure you input name , email and password");
    }

    let db = dbo.getDb();


    const usersCollection = db.collection('users')


    usersCollection
        .findOne({"email": email}).then(dbRes => {
        console.log(" email " +email+"db email " + JSON.stringify(dbRes));
        if (dbRes !== null) {
            res.status(400).send('user already exist in db');
        } else {
            // generate userid
            const user_id = Math.floor((Math.random() * 1000) + 1);

            // hash password
            const hash = crypto.createHash('sha256').update(email).digest('hex');
            console.log("hash" + hash); // 9b74c9897bac770ffc029102a200c5de


            usersCollection.insertOne({
                name: name,
                email: email,
                password: hash,
                user_id: user_id
            })
                .then(result => {
                    const followingCollection = db.collection('following');
                    followingCollection.insertOne({
                        followers: [""],
                        user: user_id,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    })
                        .then(rs => {
                            console.log("rs " + JSON.stringify(result))
                            res.status(200).send('user created, proceed to login');
                        })

                })
                .catch(error => {
                    console.error("error " + error)
                    res.status(500).send("error creating user")
                })
        }
    })
});

module.exports = router;
