angular
  .module("RSM-APP")
  .controller(
    "orderDashboardController",
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

      var monthYearStr = $window.sessionStorage.getItem(
        "monthYearForDashboard"
      );
      if (monthYearStr != null) $scope.monthYear = new Date(monthYearStr);
      else $scope.monthYear = new Date();

      $scope.$watch("monthYear", function () {
        if ($scope.monthYear != undefined)
          $window.sessionStorage.setItem(
            "monthYearForDashboard",
            $scope.monthYear
          );
        else
          $window.sessionStorage.setItem(
            "monthYearForDashboard",
            $scope.currentDate
          );
        fetchOrders("Any");
        fetchOrders("Segmented");
        fetchOrders("Unsegmented");
      });

      $scope.onOrdersTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "");
        if ($scope.monthYear != undefined)
          $window.sessionStorage.setItem("monthYear", $scope.monthYear);
        else $window.sessionStorage.setItem("monthYear", $scope.currentDate);
      };

      $scope.onUnsegmentedTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "Unsegmented");
        if ($scope.monthYear != undefined)
          $window.sessionStorage.setItem("monthYear", $scope.monthYear);
        else $window.sessionStorage.setItem("monthYear", $scope.currentDate);
      };

      $scope.onSegmentedTabClick = function () {
        $window.sessionStorage.setItem("customerName", "");
        $window.sessionStorage.setItem("organisationName", "");
        $window.sessionStorage.setItem("locationName", "");
        $window.sessionStorage.setItem("status", "Segmented");
        if ($scope.monthYear != undefined)
          $window.sessionStorage.setItem("monthYear", $scope.monthYear);
        else $window.sessionStorage.setItem("monthYear", $scope.currentDate);
      };

      function fetchOrders(status) {
        var url =
          REST_END_POINT +
          "api/orderManagement/v1/orderProvisioning?page=0&status=" +
          status +
          "&month=";

        if ($scope.monthYear != undefined) {
          url =
            url +
            ($scope.monthYear.getMonth() + 1) +
            "&year=" +
            $scope.monthYear.getFullYear();
        } else {
          url =
            url +
            ($scope.currentDate.getMonth() + 1) +
            "&year=" +
            $scope.currentDate.getFullYear();
        }

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
