angular.module('app-controllers', [])
.controller('usercontroller', ['$scope', function ($scope) {

    $scope.User = {
        UserName: "",
        Email: "",
        Password: ""
    };

    $scope.SignUp = function () {
        var user = new Parse.User();
        user.set("username", $scope.User.UserName);
        user.set("password", $scope.User.Password);
        user.set("email", $scope.User.Email);

        user.signUp(null, {
            success: function (user) {
                window.location = "#/home";
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };

    $scope.SignIn = function () {

        Parse.User.logIn($scope.User.UserName, $scope.User.Password, {
            success: function (user) {

                //Used Signed In send him to home page.
                window.location = "#/home";
            },
            error: function (user, error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };

}])
.controller('friendlistcontroller', ['$scope', function ($scope) {

    $scope.Friends = [];
    $scope.GetAllFriends = function () {
        var friends = new Parse.Query('Friends');
        friends.include("UserId");
        friends.include("FriendUserId");
        friends.equalTo("UserId", Parse.User.current());
        friends.find()
        .then(function (result) {
            $scope.Friends = [];
            for (i = 0; i < result.length; i++) {
                $scope.Friends.push({
                    Name: result[i]._serverData.FriendUserId._serverData.username,
                    UserId: result[i]._serverData.FriendUserId.id
                });
            }
        });
    };

    setInterval(function () {
        $scope.GetAllFriends();
    }, 10000);

    $scope.GetAllFriends();


}])
.controller('friendRequestController', ['$scope', function ($scope) {

    $scope.FriendRequests = [];

    $scope.AddFriends = function (user, callback) {
        var currentUser = Parse.User.current();
        var friendRequest = Parse.Object.extend("Friends");
        var request = new friendRequest();

        request.set("FriendUserId", user);
        request.set("UserId", currentUser);

        request.save().then(function () {
            if (callback !== undefined) {
                callback();
            }
        });
    };

    $scope.AcceptFriend = function (friendRequestUser, deny, $event) {
        friendRequestUser.RequestSent = true;
        var el = angular.element($event.target);
        var friendRequest = Parse.Object.extend("FriendRequest");
        friendRequest = new friendRequest();
        friendRequest.id = friendRequestUser.ID;

        if (deny == false) {
            friendRequest.set("Accepted", true);
        }
        else if (deny == true) {
            friendRequest.set("Accepted", false);
            friendRequest.set("Denied", true);
        }

        friendRequest.save().then(function () {
            if (deny == false) {
                el.parents("tr").remove();
                $scope.AddFriends(friendRequestUser.FriendObject);
            }
        });
    };

    $scope.GetAllFriendRequests = function () {

        var friends = new Parse.Query('FriendRequest');
        friends.include("ToUserId");
        friends.include("FromUserId");
        friends.equalTo("ToUserId", Parse.User.current());
        friends.equalTo("Accepted", false);
        friends.equalTo("Denied", false);
        friends.find()
                .then(function (result) {
                    $scope.FriendRequests = [];
                    for (i = 0; i < result.length; i++) {
                        $scope.FriendRequests.push({
                            Username: result[i]._serverData.FromUserId._serverData.username,
                            //Username: result[i]._serverData.ToUserId._serverData.username,
                            ToUserId: result[i]._serverData.FromUserId.id,
                            ID: result[i].id,
                            FriendObject: result[i]._serverData.FromUserId,
                            RequestSent: false
                        });
                    }
                });
    };

    setInterval(function () {
        $scope.GetAllFriendRequests();
    }, 10000);

    $scope.GetAllFriendRequests();
}])
.controller('searchController', ['$scope', function ($scope) {
    $scope.Search = "";
    $scope.Users = [];
    $scope.message = "";
    $scope.SearchUsers = function () {
        var q2 = new Parse.Query(Parse.User);
        if ($scope.Search != "") {
            q2.contains("username", $scope.Search);
        }
        q2.find().then(function (items) {
            $scope.Users = [];
            angular.forEach(items, function (item) {
                if (item._serverData.username != Parse.User.current()._serverData.username) {
                    $scope.Users.push({
                        UserName: item._serverData.username,
                        Email: item._serverData.email,
                        Password: item._serverData.password,
                        OrignalObject: item
                    });
                }
            });
        });
    };

    $scope.SearchUsers();    

    $scope.SendFriendRequest = function (userToSend) {
        $scope.message = "";
        var currentUser = Parse.User.current();
        var friendRequest = Parse.Object.extend("FriendRequest");
        var request = new friendRequest();

        request.set("FromUserId", currentUser);

        request.set("ToUserId", userToSend);

        request.set("Accepted", false);

        request.set("Denied", false);

        request.save().then(function () {
            $scope.message = "Request Sent Successfully.";
           // alert("Sent");
        });
    }

}]);
