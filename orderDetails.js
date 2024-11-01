var myApp = angular.module("RSM-APP");

myApp.controller(
  "orderDetailsController",
  function ($scope, $window, $http, $route, REST_END_POINT) {
    var orderId = $window.localStorage.getItem("order_id");
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

    $scope.currentDate = new Date();

    $http({
      method: "GET",
      url: REST_END_POINT + "api/userManagement/v1/userAccounts/" + userId,
      headers: { Authorization: "Bearer " + authToken },
    }).then(
      function (response) {
        $scope.roleId = response.data.role.roleId;
      },
      function (error) {
        console.log(error);
      }
    );

    var url =
      REST_END_POINT + "api/orderManagement/v1/orderProvisioning/" + orderId;
    $http
      .get(url, {
        headers: { Authorization: "Bearer " + authToken },
      })
      .then(
        function (response) {
          $scope.order = response.data;
          if ($scope.order.rsmId == null) $scope.isRsmIdNull = true;
          var totalAmount = 0;
          for (var i = 0; i < $scope.order.products.length; i++)
            totalAmount +=
              $scope.order.products[i].price *
              $scope.order.products[i].quantity;
          $scope.totalAmount = totalAmount;
        },
        function (error) {
          console.log(error.data);
        }
      );

    $scope.goBack = function () {
      $window.history.back();
    };

    $scope.onClickCreateRsmId = function () {
      $scope.createRsmId = true;
    };

    $scope.onCustomerEditLinkClick = function () {
      $scope.editCustomerLinkClicked = true;
    };

    $scope.cancelEditCustomer = function () {
      $scope.editCustomerLinkClicked = false;
      $route.reload();
    };

    $scope.onDateEditLinkClick = function () {
      $scope.editDateLinkClicked = true;
    };

    $scope.onCreateRsmIdBtnClick = function (newRsmId) {
      if (newRsmId.length != 8) {
        if (
          !alert(
            "In-appropiate format. Please follow the guidelines and try again."
          )
        )
          $route.reload();
        return;
      }
      var data = {
        rsmId: newRsmId,
        organisationName: $scope.order.organisationName,
        locationName: $scope.order.locationName,
      };
      $http
        .post(
          REST_END_POINT + "api/financeManagement/v1/revenueSegmentation",
          JSON.stringify(data),
          {
            headers: { Authorization: "Bearer " + authToken },
          }
        )
        .then(
          function (response) {
            if (response.data.msg === "Created") {
              if (
                !alert(
                  "RSM ID is created successfully for " +
                    $scope.order.organisationName +
                    " and " +
                    $scope.order.locationName
                )
              )
                $route.reload();
            } else if (response.data.msg === "rsm id already exists") {
              if (!alert("RSM ID is already exists. Please try again"))
                $route.reload();
            } else if (
              response.data.msg ===
              "organisation id and location id already mapped with another RSM ID."
            ) {
              if (
                !alert(
                  $scope.order.organisationName +
                    " and " +
                    $scope.order.locationName +
                    "already mapped with another RSM ID. Please enter correct RSM ID"
                )
              )
                $route.reload();
            } else {
              if (!alert("Something went wrong. Please try again"))
                $route.reload();
            }
          },
          function (error) {
            console.log(error.data);
          }
        );
    };

    $scope.saveCustomerName = function (order) {
      var data = {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        phone: order.phone,
        address: order.address,
      };
      var url =
        REST_END_POINT +
        "api/orderManagement/v1/orderProvisioning/" +
        $scope.order.orderId;
      $http
        .patch(url, JSON.stringify(data), {
          headers: { Authorization: "Bearer " + authToken },
        })
        .then(
          function (response) {
            if (!alert("Order is updated successfully")) $route.reload();
          },
          function (error) {
            console.log(error.data);
          }
        );
    };
  }
);
