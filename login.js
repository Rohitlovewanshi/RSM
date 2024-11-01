angular.module("RSM-APP").controller("loginController", [
  "REST_END_POINT",
  "$scope",
  "$http",
  "$rootScope",
  function (REST_END_POINT, $scope, $http, $rootScope) {
    $scope.user = { email: "", password: "" };
    var authdata = btoa("RSM_CLIENT:123");
    $http.defaults.headers.common["Authorization"] = "Basic " + authdata;

    $scope.loginErrorAlert = false;

    $scope.login = function (user) {
      $scope.loginErrorAlert = false;
      $scope.loading = true;

      $http({
        method: "POST",
        url: REST_END_POINT + "oauth/token",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        transformRequest: function (obj) {
          var str = [];
          for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: {
          username: user.email,
          password: user.password,
          grant_type: "password",
        },
      }).then(
        function (response) {
          // $scope.loading = false;
          $rootScope.$broadcast("loginSuccessEvent", {
            email: user.email,
            authToken: response.data.access_token,
            rememberMe: user.rememberMe,
          });
        },
        function (error) {
          console.log(error);
          $scope.loading = false;
          $scope.user.password = "";
          if (error.status == 400) {
            $scope.loginErrorAlert = true;
            $scope.errorMsg = "Incorrect username or password.";
          } else {
            $scope.errorMsg = "Server Error";
            $scope.loginErrorAlert = true;
          }
        }
      );
    };

    $scope.togglePassword = function () {
      $scope.typePassword = !$scope.typePassword;
    };
  },
]);
