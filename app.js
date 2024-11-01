var myApp = angular.module("RSM-APP", ["ngRoute"]);

myApp.config(function ($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix("");
  $routeProvider
    .when("/", {
      templateUrl: "root/root.html",
      controller: "rootController",
    })
    .when("/login", {
      templateUrl: "login/login.html",
      controller: "loginController",
    })
    .when("/register", {
      templateUrl: "register/register.html",
      controller: "registerController",
    })
    .when("/home", {
      templateUrl: "home/home.html",
      controller: "homeController",
    })
    .when("/orderDashboard", {
      templateUrl: "orderDashboard/orderDashboard.html",
      controller: "orderDashboardController",
    })
    .when("/orders", {
      templateUrl: "orders/orders.html",
      controller: "ordersController",
    })
    .when("/unsegmented", {
      templateUrl: "orders/orders.html",
      controller: "ordersController",
    })
    .when("/orderDetails", {
      templateUrl: "orderDetails/orderDetails.html",
      controller: "orderDetailsController",
    })
    .when("/profile", {
      templateUrl: "profile/profile.html",
      controller: "profileController",
    })
    .otherwise({ redirectTo: "/" });
});

myApp.controller("rootController", [
  "$scope",
  "$location",
  "$window",
  function ($scope, $location, $window) {
    var authToken = $window.sessionStorage.getItem("auth_token");
    if (authToken == null) {
      authToken = $window.localStorage.getItem("auth_token");
    }

    if (authToken != null) {
      $location.path("/home");
    } else {
      $location.path("/login");
    }
  },
]);

myApp.controller("topBarController", [
  "$scope",
  "$location",
  "$http",
  "$window",
  "REST_END_POINT",
  function ($scope, $location, $http, $window, REST_END_POINT) {
    $scope.isActive = function (path) {
      return path === $location.path();
    };

    $scope.onLogout = function () {
      $window.localStorage.clear();
      $window.sessionStorage.clear();
    };

    var userId = $window.localStorage.getItem("user_id");
    if (userId == null) userId = $window.sessionStorage.getItem("user_id");
    var authToken = $window.localStorage.getItem("auth_token");
    if (authToken == null)
      authToken = $window.sessionStorage.getItem("auth_token");

    if (userId != null && authToken != null) {
      $http({
        method: "GET",
        url: REST_END_POINT + "api/userManagement/v1/userAccounts/" + userId,
        headers: { Authorization: "Bearer " + authToken },
      }).then(
        function (response) {
          $scope.user = response.data;
        },
        function (error) {
          console.log(error);
        }
      );
    }

    $scope.$on("loginSuccessEvent", function (evt, data) {
      $http({
        method: "GET",
        url:
          REST_END_POINT +
          "api/userManagement/v1/userAccounts?email=" +
          data.email,
        headers: { Authorization: "Bearer " + data.authToken },
      }).then(
        function (response) {
          $scope.user = response.data[0];
          if (data.rememberMe == true) {
            $window.localStorage.setItem("auth_token", data.authToken);
            $window.localStorage.setItem("user_id", response.data[0].userId);
            $window.sessionStorage.clear();
          } else {
            $window.sessionStorage.setItem("auth_token", data.authToken);
            $window.sessionStorage.setItem("user_id", response.data[0].userId);
            $window.localStorage.clear();
          }
          $location.path("/home");
        },
        function (error) {
          console.log(error);
        }
      );
    });
  },
]);

myApp.controller("sidebarController", [
  "$scope",
  "$location",
  "$window",
  function ($scope, $location, $window) {
    $scope.currentDate = new Date();

    $scope.isActive = function (path) {
      return path === $location.path();
    };

    $scope.onUnsegmentedTabClick = function () {
      $window.sessionStorage.setItem("customerName", "");
      $window.sessionStorage.setItem("organisationName", "");
      $window.sessionStorage.setItem("locationName", "");
      $window.sessionStorage.setItem("status", "Unsegmented");
      $window.sessionStorage.setItem("monthYear", $scope.currentDate);
    };
  },
]);

myApp.controller("footerController", [
  "$scope",
  "$location",
  function ($scope, $location) {
    $scope.isActive = function (path) {
      return path === $location.path();
    };
  },
]);

myApp.run(function ($window) {
  var userId = $window.sessionStorage.getItem("user_id");
  var authToken = $window.sessionStorage.getItem("auth_token");

  if (authToken == null || userId == null) {
    authToken = $window.localStorage.getItem("auth_token");
    userId = $window.localStorage.getItem("user_id");
  }

  if (authToken == null || userId == null) {
    $window.localStorage.setItem("getSessionStorage", Date.now());
  }

  $window.addEventListener("storage", function (event) {
    if (event.key == "getSessionStorage") {
      $window.localStorage.setItem(
        "sessionStorage",
        JSON.stringify($window.sessionStorage)
      );
      $window.localStorage.removeItem("sessionStorage");
    } else if (
      event.key == "sessionStorage" &&
      $window.sessionStorage.getItem("auth_token") == null
    ) {
      var data = JSON.parse(event.newValue),
        value;
      for (key in data) {
        $window.sessionStorage.setItem(key, data[key]);
      }
      if ($window.sessionStorage.getItem("auth_token") != null)
        $window.location.reload();
    }
  });
});
