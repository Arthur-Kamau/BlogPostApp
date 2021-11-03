const express = require('express');
const dbo = require("../db");
const {createDecipheriv} = require("crypto");
const cy = require("../crypto");
const router = express.Router();

router.post('/', function (req, res, next) {

    const decipher = createDecipheriv('aes256', key, iv);
    const encryptedMessage = req.headers.authorization;
    const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
    const userDataStr = decryptedMessage.toString('utf-8')

    const userData = JSON.parse(userDataStr)
    let comment = req.body.comment;
    let postId = req.body.post_id;
    if (postId === undefined || comment === undefined) {
        res.status(400).send("error ensure comment and pos id present")
    }

    let dbConnect = dbo.getDb();
    const commentsCollection = dbConnect.collection('comments');

    const comment_id = Math.floor((Math.random() * 1000) + 1);
    commentsCollection.insertOne({
        comment: comment,
        post_id:postId,
        creator: userData.user_id,
        comment_id: comment_id,
        created_at: Date.now()
    })
        .then(result => {
            console.log("db " + JSON.stringify(result))
            res.status(200).send('post created');
        })
        .catch(error => {
            console.error("error " + error)
            res.status(500).send("error creating user")
        })

});
