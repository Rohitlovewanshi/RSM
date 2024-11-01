angular.module("RSM-APP").controller("registerController", [
  "$scope",
  "$http",
  "$filter",
  "REST_END_POINT",
  function ($scope, $http, $filter, REST_END_POINT) {
    $scope.currentDate = new Date();

    $scope.emailAlreadyExists = false;
    $scope.showModal = false;
    $scope.loginErrorAlert = false;
    $scope.user = {
      countryCode: "+1",
    };

    $scope.$watch("user.email", function (newVal, oldVal) {
      $scope.emailAlreadyExists = false;
    });

    $scope.register = function (user) {
      $scope.loginErrorAlert = false;
      $scope.loading = true;
      var modifiedDob = $filter("date")(user.dob, "yyyy-MM-dd");
      var data = {
        firstName: user.firstName,
        lastName: user.lastName,
        dob: modifiedDob,
        mobileNumber: user.countryCode + " " + user.mobileNumber,
        email: user.email,
        password: user.password,
      };
      var url = REST_END_POINT + "api/userManagement/v1/userAccounts";
      $http.post(url, JSON.stringify(data)).then(
        function (response) {
          $scope.loading = false;
          $("#registerSuccessModal").modal("show");
        },
        function (error) {
          $scope.loading = false;
          console.log(error.data);
          if (error.status == 400) $scope.emailAlreadyExists = true;
          else $scope.loginErrorAlert = true;
        }
      );
    };

    $scope.togglePassword = function () {
      $scope.typePassword = !$scope.typePassword;
    };
  },
]);
