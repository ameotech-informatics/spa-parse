angular.module('parseapp',
    ['ngRoute',
    'app-controllers',
    'parse-angular'])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
     when('/home', {
         templateUrl: 'js/templates/index.html',
         controller: 'friendlistcontroller'
     }).
     when('/SignUp', {
         templateUrl: 'js/templates/signup.html',
         controller: 'usercontroller'
     }).
    when('/login', {
        templateUrl: 'js/templates/login.html',
        controller: 'usercontroller'
    }).
    when('/search', {
        templateUrl: 'js/templates/search.html',
        controller: 'searchController'
    }).
    when('/friendrequests', {
        templateUrl: 'js/templates/friendrequest.html',
        controller: 'friendRequestController'
    }).
   when('/signout', {
       templateUrl: 'js/templates/login.html',
       controller: 'usercontroller'
   }).
     otherwise({
         redirectTo: '/login'
     });
}]).factory('ParseSDK', function () {
    // pro-tip: swap these keys out for PROD keys automatically on deploy using grunt-replace
    Parse.initialize("GkO2WWgpvlnT6iFfsNhFN8xONeqKlgKKJQBvrMwk", "7bn7lYjIYyeKKhFw9hX70nZPjC6szeQiH9OXJUpr");
})
.run(['ParseSDK', function (ParseService) {

}])
.directive('toplinks', ['ParseSDK', function (ParseSDK) {
    return {
        restrict: "EA",        
        templateUrl: "js/templates/toplinks.html",
        controller: function ($scope, $location) {
            $scope.showLinks = false;
            if (Parse.User.current() !== null) {
                $scope.showLinks = true;
            }
            $scope.$on('$routeChangeStart', function (next, current) {

                if (Parse.User.current() !== null) {
                    $scope.showLinks = true;
                }
                else if ($location.path().toLowerCase().indexOf("signup") < 0) {
                    window.location = "#/login";
                }               
            });

            $scope.Logout = function () {
                $scope.showLinks = false;
                Parse.User.logOut();
                window.location = "#/login";
            }

            $scope.TotalRequests = 0;

            $scope.GetAllFriendRequests = function () {
                if (Parse.User.current() !== null) {
                    var friends = new Parse.Query('FriendRequest');
                    friends.include("ToUserId");
                    friends.include("FromUserId");
                    friends.equalTo("ToUserId", Parse.User.current());
                    friends.equalTo("Accepted", false);
                    friends.equalTo("Denied", false);
                    friends.find()
                            .then(function (result) {

                                $scope.TotalRequests = result.length;


                            });
                }
            };

            $scope.GetAllFriendRequests();

            setInterval(function () {
                $scope.GetAllFriendRequests();
            }, 5000);
        },
        link: function (scope) {


        }
    }
}]);