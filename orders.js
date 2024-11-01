angular
  .module("RSM-APP")
  .controller("ordersController", function ($scope, $http, $window, $route, REST_END_POINT) {
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

    $scope.activePage = $window.sessionStorage.getItem(
      "orders_pagination_active_page"
    );

    if ($scope.activePage == null) $scope.activePage = 1;

    $scope.pagination = {
      pageLink1: "",
      pageLink2: "",
      pageLink3: "",
      pageLink4: "",
      pageLink5: "",
      pageLink6: "",
      pageLink7: "",
    };

    var customerName = $window.sessionStorage.getItem("customerName");
    var organisationName = $window.sessionStorage.getItem("organisationName");
    var locationName = $window.sessionStorage.getItem("locationName");
    var status = $window.sessionStorage.getItem("status");
    var monthYearStr = $window.sessionStorage.getItem("monthYear");

    if (customerName == null) customerName = "";
    if (organisationName == null) organisationName = "";
    if (locationName == null) locationName = "";
    if (status == null) status = "";
    if (monthYearStr != null) {
      $scope.monthYear = new Date(monthYearStr);
    } else {
      $scope.monthYear = new Date();
    }

    $scope.search = {
      customerName: customerName,
      organisationName: organisationName,
      locationName: locationName,
      status: status,
    };

    fetchOrders();

    function fetchOrders() {
      var url =
        REST_END_POINT +
        "api/orderManagement/v1/orderProvisioning?page=" +
        (parseInt($scope.activePage) - 1);

      if ($scope.search.customerName != "")
        url = url + "&customerName=" + $scope.search.customerName;
      if ($scope.search.organisationName != "")
        url = url + "&organisationName=" + $scope.search.organisationName;
      if ($scope.search.locationName != "")
        url = url + "&locationName=" + $scope.search.locationName;
      if ($scope.search.status != "")
        url = url + "&status=" + $scope.search.status;

      if ($scope.monthYear != undefined) {
        url =
          url +
          "&month=" +
          ($scope.monthYear.getMonth() + 1) +
          "&year=" +
          $scope.monthYear.getFullYear();
      } else {
        url =
          url +
          "&month=" +
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
            $scope.orders = response.data.orders;
            $scope.totalOrders = response.data.totalOrders;
            $scope.totalPageCount = Math.ceil(response.data.totalOrders / 10);
            doPagination();
          },
          function (error) {
            if (error.status == 401) {
              $scope.sessionExpired = true;
            }
            console.log(error.data);
          }
        );
    }

    function doPagination() {
      if ($scope.activePage == 1) {
        $scope.pagination.pageLink1 = "1";
        if ($scope.totalPageCount > 1) $scope.pagination.pageLink2 = "2";
        if ($scope.totalPageCount > 2) $scope.pagination.pageLink3 = "3";
        if ($scope.totalPageCount > 3) $scope.pagination.pageLink4 = "4";
        if ($scope.totalPageCount > 3) {
          $scope.pagination.pageLink4 = "...";
          $scope.pagination.pageLink5 = $scope.totalPageCount;
        }
      } else if ($scope.activePage == 2) {
        $scope.pagination.pageLink1 = "1";
        $scope.pagination.pageLink2 = "2";
        if ($scope.totalPageCount > 2) $scope.pagination.pageLink3 = "3";
        if ($scope.totalPageCount > 3) $scope.pagination.pageLink4 = "4";
        if ($scope.totalPageCount > 4) {
          $scope.pagination.pageLink4 = "...";
          $scope.pagination.pageLink5 = $scope.totalPageCount;
        }
      } else if ($scope.activePage == 3) {
        $scope.pagination.pageLink1 = "1";
        $scope.pagination.pageLink2 = "2";
        $scope.pagination.pageLink3 = "3";
        if ($scope.totalPageCount > 3) $scope.pagination.pageLink4 = "4";
        if ($scope.totalPageCount > 4) $scope.pagination.pageLink5 = "5";
        if ($scope.totalPageCount > 5) {
          $scope.pagination.pageLink5 = "...";
          $scope.pagination.pageLink6 = $scope.totalPageCount;
        }
      } else {
        $scope.pagination.pageLink1 = "1";
        $scope.pagination.pageLink2 = "...";
        $scope.pagination.pageLink3 = parseInt($scope.activePage) - 1;
        $scope.pagination.pageLink4 = $scope.activePage;
        if ($scope.totalPageCount > $scope.activePage)
          $scope.pagination.pageLink5 = parseInt($scope.activePage) + 1;
        if ($scope.totalPageCount > parseInt($scope.activePage) + 1)
          $scope.pagination.pageLink6 = parseInt($scope.activePage) + 2;
        if ($scope.totalPageCount > parseInt($scope.activePage) + 2) {
          $scope.pagination.pageLink6 = "...";
          $scope.pagination.pageLink7 = $scope.totalPageCount;
        }
      }
    }

    $scope.applyFilter = function (search) {
      $window.sessionStorage.setItem("orders_pagination_active_page", 1);
      $window.sessionStorage.setItem("customerName", search.customerName);
      $window.sessionStorage.setItem(
        "organisationName",
        search.organisationName
      );
      $window.sessionStorage.setItem("locationName", search.locationName);
      $window.sessionStorage.setItem("status", search.status);
      if ($scope.monthYear != undefined)
        $window.sessionStorage.setItem("monthYear", $scope.monthYear);
      else $window.sessionStorage.setItem("monthYear", $scope.currentDate);
      $route.reload();
    };

    $scope.removeFilter = function () {
      $scope.search.customerName = "";
      $scope.search.organisationName = "";
      $scope.search.locationName = "";
      $scope.search.status = "";
      $window.sessionStorage.setItem("orders_pagination_active_page", 1);
      $window.sessionStorage.setItem("customerName", "");
      $window.sessionStorage.setItem("organisationName", "");
      $window.sessionStorage.setItem("locationName", "");
      $window.sessionStorage.setItem("status", "");
      $route.reload();
    };

    $scope.onOrderIdClick = function (order) {
      $window.localStorage.setItem("order_id", order.orderId);
    };

    $scope.onPaginationPageClick = function (pageNo) {
      $window.sessionStorage.setItem("orders_pagination_active_page", pageNo);
      $route.reload();
    };

    $scope.onPaginationPreviousLinkClick = function () {
      $window.sessionStorage.setItem(
        "orders_pagination_active_page",
        parseInt($scope.activePage) - 1
      );
      $route.reload();
    };

    $scope.onPaginationNextLinkClick = function () {
      $window.sessionStorage.setItem(
        "orders_pagination_active_page",
        parseInt($scope.activePage) + 1
      );
      $route.reload();
    };
  });
