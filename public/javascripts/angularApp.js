var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', [
  '$http',
  function ($http) {
    var o = {
      posts: []
    };

    o.getAll = function(){
      return $http.get('/posts').success(function(data){
        angular.copy(data, o.posts);
      });
    };

    o.create = function(post){
      return $http.post('/posts', post).success(function(data){
        o.posts.push(data);
      });
    };

    o.upvote = function(post) {
      return $http.put('/posts/' + post._id + '/upvote').success(function(data){
        post.upvotes += 1;
      });
    };

    o.get = function(id){
      return $http.get('/posts/' + id).then(function(res){
        return res.data;
      });
    };

    o.addComment = function(id, comment){
      return $http.post('/posts/' + id + '/comments', comment);
    };

    o.upvoteComment = function(post, comment){
      return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data) {
        comment.upvotes += 1;
      });
    };

    //delete post
    o.deletePost = function(post){
      return $http.post('/posts/del_post/' + post._id).success(function(data){
        var postIndex = o.posts.map(function(data){
          return data._id;
        }).indexOf(post._id);
        o.posts.splice(postIndex, 1);
      });
    };

    return o;
  }
  ]);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state(
        'home', {
          url: '/home',
          templateUrl: 'home.html',
          controller: 'MainCtrl',
          resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
          }
        })
      //moet een aparte state declaratie zijn, mag niet mee in vorige state opgenomen worden..
      .state(
        'posts', {
          url: '/posts/{id}',
          templateUrl: '/posts.html',
          controller: 'PostsCtrl',
          resolve: {
            post: ['$stateParams', 'posts', function($stateParams, posts){
              return posts.get($stateParams.id);
            }]
          }
        }
      );
    $urlRouterProvider.otherwise('home');
  }
]);

app.controller('MainCtrl', [
  '$scope',
  'posts', //de factory bovenaan gedefinieerd..
  function ($scope, posts) {
    $scope.test = 'Hello World!';
    $scope.posts = posts.posts; //voor de 2-way binding moet het aan $scope gelinkt worden.
                                //Maar de data zelf wordt best bijgehouden in de factory 'posts'
    $scope.addPost = function() {
      if (!$scope.title_form || $scope.title_form === '') { return; }
      posts.create({
        title: $scope.title_form,
        link: $scope.link
      });
      $scope.title_form = '';
      $scope.link = '';
    };

    $scope.incrementUpvotes = function(post){
      posts.upvote(post);
    };

    //delete post
    $scope.deletePost = function(post) {
      posts.deletePost(post);
    };
  }
]);

app.controller('PostsCtrl', [
  '$scope',
  'posts',
  'post',
  function($scope, posts, post){
    $scope.post = post;
    $scope.addComment = function(){
      if($scope.body === ''){ return; }
      posts.addComment(post._id, {
        body: $scope.body,
        author: 'user'
      }).success(function(comment){
        $scope.post.comments.push(comment);
      });
      // $scope.post.comments.push({
      //   body: $scope.body,
      //   author: 'user',
      //   upvotes: 0
      // });

      $scope.incrementUpvotes = function(comment){
        posts.upvoteComment(post, comment);
      };

      $scope.body = '';
    };
  }
]);
