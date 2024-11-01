angular.module("RSM-APP").controller("profileController", [
  "$scope",
  "$window",
  "$http",
  "REST_END_POINT",
  function ($scope, $window, $http, REST_END_POINT) {
    $scope.currentDate = new Date();

    var userId = $window.sessionStorage.getItem("user_id");
    var authToken = $window.sessionStorage.getItem("auth_token");

    if (authToken == null || userId == null) {
      authToken = $window.localStorage.getItem("auth_token");
      userId = $window.localStorage.getItem("user_id");
    }

    if (authToken == null || userId == null) {
      $scope.sessionExpired = true;
      return;
    } else {
      $scope.sessionExpired = false;
    }

    $scope.viewProfileMode = true;

    $http({
      method: "GET",
      url: REST_END_POINT + "api/userManagement/v1/userAccounts/" + userId,
      headers: { Authorization: "Bearer " + authToken },
    }).then(
      function (response) {
        $scope.user = response.data;
        $scope.user.countryCode = response.data.mobileNumber.split(" ")[0];
        $scope.user.mobileNumber = response.data.mobileNumber.split(" ")[1];
      },
      function (error) {
        console.log(error);
      }
    );

    function doPostMethod() {
      var url =
        REST_END_POINT +
        "api/userManagement/v1/userAccounts/" +
        $scope.user.userId;

      var data = {
        firstName: $scope.user.firstName,
        lastName: $scope.user.lastName,
        dob: $scope.user.dob,
        mobileNumber: $scope.user.countryCode + " " + $scope.user.mobileNumber,
        email: $scope.user.email,
      };
      $http
        .patch(url, JSON.stringify(data), {
          headers: { Authorization: "Bearer " + authToken },
        })
        .then(
          function (response) {
            $scope.loading = false;
            $scope.success = true;
            $scope.viewProfileMode = true;
          },
          function (error) {
            $scope.loading = false;
            $scope.serverError = true;
            console.log(error.data);
            if (error.status == 400) $scope.emailAlreadyExists = true;
            else $scope.loginErrorAlert = true;
          }
        );
    }

    $scope.onEditBtnClick = function () {
      $scope.viewProfileMode = false;
      $scope.success = false;
      $scope.serverError = false;
    };

    $scope.saveChanges = function (user) {
      $scope.loading = true;
      $scope.success = false;
      $scope.serverError = false;
      doPostMethod();
    };
  },
]);

angular.module("RSM-APP").directive("formatDate", function () {
  return {
    require: "ngModel",
    link: function (scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function (modelValue) {
        return new Date(modelValue);
      });
    },
  };
});
