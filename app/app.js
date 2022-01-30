angular.module('ethMiningCalc', [
  'ui.router',
  'angular-json-rpc'

]).config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
    .state('landing-page', {
      url: "/",
      templateUrl: "app/landing-page/landing-page.html"
    })
    .state('forecaster', {
      url: "/forecaster",
      controller: 'ForecasterController as vm',
      templateUrl: "app/forecaster/forecaster.html"
    })
    .state('calc', {
      url: "/calc",
      controller: 'CalcController as vm',
      templateUrl: "app/calc/calc.html"
    });
});
