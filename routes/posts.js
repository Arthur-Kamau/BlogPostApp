var express = require('express');
const dbo = require("../db");
const {createDecipheriv} = require("crypto");
const cy = require("../crypto");
var router = express.Router();

const key = cy.getKey();
const iv = cy.getIv();

/* GET home page. */
router.get('/all', function (req, res, next) {

    let dbConnect = dbo.getDb();
    const postsCollection = dbConnect.collection('posts');
    postsCollection.find({}).limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching posts!");
            } else {
                res.json(result);
            }
        });
});

router.get('/:post_id', function (req, res, next) {
    const postId = req.params.post_id;
    if (postId === undefined) {
        res.status(400).send("post id not found");
    } else {
        let dbConnect = dbo.getDb();
        const postsCollection = dbConnect.collection('posts');
        postsCollection.findOne({post_id: Number(postId)}).then(dbRes => {
            if (dbRes === undefined) {
                res.status(404).send("no post found")
            }else {
                res.status(200).send(dbRes);
            }
        });
    }
});


router.post('/', function (req, res, next) {
    const decipher = createDecipheriv('aes256', key, iv);
    const encryptedMessage = req.headers.authorization;
    const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
    const userDataStr = decryptedMessage.toString('utf-8')

    const userData = JSON.parse(userDataStr)
    let post = req.body.text;
    if (post === undefined) {
        res.status(400).send("error posts does not contain post data")
    }

    let dbConnect = dbo.getDb();
    const postsCollection = dbConnect.collection('posts');

    const post_id = Math.floor((Math.random() * 1000) + 1);
    postsCollection.insertOne({
        text: post,
        creator: userData.user_id,
        post_id: post_id,
        likes: [""],
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

router.get('/like/:post_id', function (req, res, next) {
    const postId = req.params.post_id;
    if (postId === undefined) {
        res.status(400).send("Error post id not found");
    } else {
        const decipher = createDecipheriv('aes256', key, iv);
        const encryptedMessage = req.headers.authorization;
        const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
        const userDataStr = decryptedMessage.toString('utf-8')


        const userData = JSON.parse(userDataStr);

        const postsCollection = dbo.getDb().collection('posts');

        console.log("id " + postId );
        postsCollection
            .findOne({post_id: Number(postId)}).then(dbRes => {
            console.log("id " + postId + " db post" + JSON.stringify(dbRes));
            if (dbRes === undefined) {
                res.status(400).send('post not found');
            } else {

                if (dbRes.likes.includes(userData.user_id)) {
                    res.status(200).send("okay");
                } else {
                   let liky = dbRes.likes;
                    liky.push(userData.user_id)
                    console.log("likes" + liky)
                    postsCollection.updateOne({post_id: Number(postId)}, {
                        $set: {
                            likes: liky
                        }
                    }, function (err, _result) {
                        if (err) {
                            console.error("erro " + err)
                            res.status(400).send(`Error updating likes on listing with id ${req.params.post_id}!`);
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
router.get('/unlike/:post_id', function (req, res, next) {
    if (req.params.post_id === undefined) {
        res.status(400).send("Error post id not found");
    } else {
        const decipher = createDecipheriv('aes256', key, iv);
        const encryptedMessage = req.headers.authorization;
        const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
        const userDataStr = decryptedMessage.toString('utf-8')


        const userData = JSON.parse(userDataStr);
        let db = dbo.getDb();
        const postsCollection = db.collection('posts');

        postsCollection
            .findOne({"post_id": Number(req.params.post_id)}).then(dbRes => {
            console.log("db post" + JSON.stringify(dbRes));
            if (dbRes === undefined) {
                res.status(400).send('post not found');
            } else {

                postsCollection.updateOne({post_id: dbRes.post_id}, {
                    $set: {
                        likes: dbRes.likes.filter(function (item) {
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
