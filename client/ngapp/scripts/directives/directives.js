/**
 * @ngdoc function
 * @name ooniAPIApp.directive:ooniGridWrapper
 * @description
 * # ooniReportsTableRow
 * A directive that displays each OONI report as a table row.
 */

angular.module('ooniAPIApp')
.directive('ooniGridWrapper', function ($location, $filter, Report, Country, Nettest, uiGridConstants ) {
    return {
      restrict: 'A',
      scope: {
        getDataFunction: '='
      },
      link: function ($scope, $element, $attrs) {

        $scope.gridOptions = {};
        $scope.queryOptions = {};
        $scope.queryOptions.pageNumber = 0;
        $scope.queryOptions.pageSize = 100;

        $scope.queryOptions.order = "test_start_time DESC";
        $scope.queryOptions.where = {};

        $scope.inputFilter = "";
        $scope.testNameFilter = "";
        $scope.countryCodeFilter = "";
        $scope.nettests = Nettest.find();

        $scope.gridOptions.columnDefs = [
            {
                name: 'Country code',
                field:'probe_cc'
            },
            {
                name: 'ASN',
                field:'probe_asn'
            },
            {
                name: 'Test name',
                field:'test_name'
            },
            {
                name: 'Input',
                field:'input'
            },
            {
                name: 'Start time',
                field:'test_start_time'
            },
            {
                field: 'id',
                visible: false
            }
        ];

        $scope.viewReport = function(row) {
            var report = row.entity;
            if (report.input === undefined) {
                $location.path('/report/' + report.id);
            } else {
                $location.path('/report/' + report.id)
                    .search({input: report.input});
            }
        }

        $scope.rowTemplate = '<div ng-click="grid.appScope.viewReport(row)">' +
                      '  <div ng-if="row.entity.merge">{{row.entity.title}}</div>' +
                      '  <div ng-if="!row.entity.merge" ' +
                          'ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"' +
                          ' class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader  }"' +
                          ' ui-grid-cell></div>' +
                      '</div>';

        $scope.filterMeasurements = function() {
            $scope.where = {};
            if ($scope.inputFilter.length > 0) {
                $scope.where['input'] = $scope.inputFilter;
            }
            if ($scope.testNameFilter.length > 0) {
                $scope.where['test_name'] = $scope.testNameFilter;
            }
            if ($scope.countryCodeFilter.length > 0) {
                $scope.where['probe_cc'] = $scope.countryCodeFilter;
            }
            $scope.getDataFunction($scope.queryOptions, $scope.gridOptions.data);
        }

        $scope.gridOptions.rowTemplate = $scope.rowTemplate;
        $scope.gridOptions.useExternalPagination = true;
        $scope.gridOptions.useExternalSorting = true;
        $scope.gridOptions.paginationPageSize = $scope.queryOptions.pageSize;
        $scope.gridOptions.paginationPageSizes = [50, 100, 150];

        $scope.gridOptions.onRegisterApi = function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
                $scope.queryOptions.order = sortColumns[0].field + " " + sortColumns[0].sort.direction.toUpperCase();
                $scope.getDataFunction($scope.queryOptions, $scope.gridOptions.data);
            });
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.queryOptions.pageNumber = newPage;
                $scope.queryOptions.pageSize = pageSize;
                $scope.getDataFunction($scope.queryOptions, $scope.gridOptions.data);
            });
        }


      $scope.getDataFunction($scope.queryOptions)
        .then(function(data) {
          $scope.gridOptions.data = data;
        });

        $scope.$watch('gridOptions.data', function(){
          console.log($scope.gridOptions.data)
        });

      },
      templateUrl: 'views/directives/ooni-grid-wrapper-directive.html',
    };
});
