var express = require('express');
const dbo = require("../db");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {


  const postsCollection = dbo.getDb().collection('posts');
  postsCollection
      .findOne({post_id : 680}).then(dbRes => {
    console.log("id "+req.params.post_id+" db post" + JSON.stringify(dbRes));
    if (dbRes !== undefined) {
      res.status(400).send('post not found');
    } else {

      postsCollection.updateOne({post_id: dbRes.post_id}, {
        $inc: {
          likes: dbRes.likes.push(1234)
        }
      }, function (err, _result) {
        if (err) {
          res.status(400).send(`Error updating likes on listing with id ${req.params.post_id}!`);
        } else {
          console.log("1 document updated");
          res.status(400).send("update success");
        }
      });
    }
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
