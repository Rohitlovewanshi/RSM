angular
  .module("RSM-APP")
  .controller(
    "homeController",
    function ($scope, $http, $window, REST_END_POINT) {
      $scope.currentDate = new Date();

      var authToken = $window.sessionStorage.getItem("auth_token");
      if (authToken == null) {
        authToken = $window.localStorage.getItem("auth_token");
      }
      if (authToken == null) {
        $scope.sessionExpired = true;
        return;
      } else {
        $scope.sessionExpired = false;
      }

      fetchOrders("Any");
      fetchOrders("Segmented");
      fetchOrders("Unsegmented");

      $scope.onOrdersTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "");
      };

      $scope.onUnsegmentedTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "Unsegmented");
      };

      $scope.onSegmentedTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "Segmented");
      };

      function fetchOrders(status) {
        var url =
          REST_END_POINT +
          "api/orderManagement/v1/orderProvisioning?page=0&status=" +
          status;

        $http
          .get(url, {
            headers: { Authorization: "Bearer " + authToken },
          })
          .then(
            function (response) {
              if (status === "Any")
                $scope.totalOrders = response.data.totalOrders;
              if (status === "Segmented")
                $scope.totalSegmentedOrders = response.data.totalOrders;
              if (status === "Unsegmented")
                $scope.totalUnsegmentedOrders = response.data.totalOrders;
            },
            function (error) {
              if (error.status == 401) {
                $scope.sessionExpired = true;
              }
              console.log(error.data);
            }
          );
      }
    }
  );
