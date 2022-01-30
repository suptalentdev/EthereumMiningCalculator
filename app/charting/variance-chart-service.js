angular.module('ethMiningCalc')
  .factory('VarianceChartService', [function() {
    var factory = {};

    // Functions for Drawing Plots
    factory.generate = function(Name,Title,yTitle,Data,Draw1BlockLine)
    {
      var HighChartsData = {
        chart: {
          zoomType: 'xy',
        },
				title: {
          text: Title,
          x: -20
        },
        subtitle: {
          text: 'Click and drag to zoom',
          x: -20
        },
        xAxis: {title: { text:  "Days"},
            min:0,
            //Make the graph the width of the data
            max: Data.expected[Data.expected.length-1][0]
        },
        yAxis: {
          title: { text: yTitle},
          min: Data.minimumValue,
          max: Data.maximumValue*1.1, //Show 10% above 2 sigma
          endOnTick: false,
          startOnTick: false,
          // Draw 1 Block Line
          plotLines: [{
            color: 'black',
            width: 1,
            dashStyle: "Solid",
            label: {
              align: "right",
              text: "1 Block\u00A0\u00A0\u00A0\u00A0",
              style: {
                fontWeight: "bold"
              }
            },
            value: 1
          }],
          },
        tooltip:{
        },
        legend: {
          enabled: true

        },
        credits: {
          enabled: false
        },
        plotOptions: {
          series: { stickyTracking: false }
        },
        series: [
       {
          name: "1 \u03C3",
          type: "arearange",
          data: Data.oneSigmaRange,
          color: 'green',
          lineWidth: 0,
          marker: { enabled: false },
          tooltip: {
            shared: false,
            headerFormat: "<b>64.2%</b> of the time will be here<br>",
            pointFormat: "Day: {point.x:,0.2f} Range: {point.low:0.2f} - {point.high:0.2f}"
          },
          fillOpacity: 0.3
        },{
          name: "1-2 \u03C3",
          type: "arearange",
          data: Data.twoSigmaUpper,
          color: "#ffff66",
          lineWidth: 0,
          marker: { enabled: false },
          tooltip: {
            shared: false,
            headerFormat: "<b>13.6%</b> of the time will be here<br>",
            pointFormat: "Day: {point.x:,0.2f} Range: {point.low:0.2f} - {point.high:0.2f}"
          },
          fillOpacity: 0.3
        },{
          name: "Std Lower",
          type: "arearange",
          data: Data.twoSigmaLower,
          color: "#ffff66",
          marker: { enabled: false },
          fillOpacity: 0.3,
          showInLegend: false,
          tooltip: {
            shared: false,
            headerFormat: "<b>13.6%</b> of the time will be here<br>",
            pointFormat: "Day: {point.x:,0.2f} Range: {point.low:0.2f} - {point.high:0.2f}"
          },
          lineWidth: 0
        },{
          name: "> 2\u03C3",
          type: "arearange",
          data: Data.maximumPlotValue,
          marker: { enabled: false },
          color: "red",
          fillOpacity: 0.3,
          showInLegend: true,
          tooltip: {
            shared: false,
            headerFormat: "<b>2.1%</b> of the time will be here<br>",
            pointFormat: "Day: {point.x:,0.2f} Range: {point.low:0.2f} -  \u221E"
          },
          lineWidth: 0
        },{
          name: "Min Plot Value",
          type: "arearange",
          data: Data.minimumPlotValue,
          marker: { enabled: false },
          color: "red",
          fillOpacity: 0.3,
          showInLegend: false,
          tooltip: {
            shared: false,
            headerFormat: "<b>2.1%</b> of the time will be here<br>",
            pointFormat: "Day: {point.x:0.2f} Range: {point.low:0.2f} - {point.high:0.2f}"
          },
          lineWidth: 0
        },{
          name: "Average",
          type: 'spline',
          lineWidth: 2,
          marker: { enabled: false },
          data: Data.expected,
          tooltip: {
            shared: false,
            headerFormat: "<b>Expected Blocks (Average)</b><br>",
            pointFormat: "Day: {point.x:0.2f} Expected: {point.y:0.2f}"
          },
          color: "green"
        }],
        func: function (chart) {
          $timeout(function () {
            chart.reflow();
          }, 0);
        }
       }
      // Change tooltext for Currency
      if (Name === "#ExpectedReturnGraph"){
        HighChartsData.series[5].tooltip.headerFormat = "<b>Expected (Average) Return</b><br>";
      }

      // Removes the 1 Block Line
      if (!Draw1BlockLine){
        HighChartsData.yAxis.plotLines=""
      }
      //Draw Vertical Line Showing Point of Non-Profitability
      if (Data.profitabilityTurningPoint != 0 && Data.profitabilityTurningPoint != undefined){
        HighChartsData.xAxis.plotLines = [{
          width: 1,
          color: '#FF0000',
          dashStyle: "LongDash",
          label: {
            align: "left",
            rotation: 0,
            style: {
              fonWeight: "bold"
            },
            text: "No longer Profitable at: " + Data.profitabilityTurningPoint + " Days <br> Max Profit: " + Math.round(Data.maxProfit*100)/100
          },
          value: Data.profitabilityTurningPoint
        }];
      };


			$(Name).highcharts(HighChartsData);
    }

    return factory;
  }]);
