var express = require('express');
var router = express.Router();

//mongo db
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


//router GET

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/posts', function(req, res, next){
  // req.post.populate('comments', function(err, post) {
  //   res.json(post);
  // });
  Post.find(function(err, posts){
    if(err) { return next(err); }

    res.json(posts);
  });
});

router.get('/posts/:post', function(req, res){
  req.post.populate('comments', function (err, post){
    res.json(post);
  });
});

//router POST

//nieuwe post
router.post('/posts', function(req, res, next){
  console.log(req.body);
  var post = new Post(req.body);

  post.save(function (err, post){
    if(err) { return next(err); }

    res.json(post);
  });
});

//verwijder post
router.post('/posts/del_post/:post', function(req, res, next){
  var post = req.post;

  post.remove({ }, function (err){
    if(err) { return next(err, post); }
    res.json(post);
  });
});

//nieuwe comment
router.post('/posts/:post/comments', function(req, res, next){
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function() {
    if (err) { return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post){
      if (err) { return next(err); }

      res.json(comment);
    });
  });
});

//router PUT
router.put('/posts/:post/upvote', function(req, res, next){
  req.post.upvote(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(post);
  });
});

//router middleware PARAM
router.param('post', function(req, res, next, id){
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next();
  });
});

router.param('comment', function(req, res, next, id){
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

module.exports = router;
