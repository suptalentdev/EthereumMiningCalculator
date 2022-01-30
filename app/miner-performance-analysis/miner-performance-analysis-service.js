angular.module('ethMiningCalc')
  .factory('MinerPerformanceAnalysisService', ['DataPredictionService','PredictionService', "EtherscanDataService","StatisticsService", function(dataPredictionService,PredictionService, EtherscanDataService,statisticsService) {
  var factory = {};

  /*
   * This service retrieves mined blocks. Builds a predictive difficulty over the range
   * of dates the blocks have been mined, then builds a data set to fill a graph showing the performance.
   *
   * @ Returns a Promise for the data set, which feeds to a highcharts service
   * 
   * @ Inputs - Object containing:
   *            noPoints              - Number of points to sample difficulty to build the expectation. Default is 15 (3 seconds to get data from etherscan). 
   *            dataPoints            - Resolution for the expectation value graph.
   *            performance.address   - Miner address
   *            performance.pastBlock - Past Blocks to look over
   *            blockTime             - Current Block time
   *            hashRate              - Hashrate of the miner. 
   *            currentlyMining       - 'enable' - if we calculate statistics up to today.
   *            currentBlock          - If currentlyMining = enable then we need currentBlock.
   */
  factory.checkMinerPerformance = function(inputs){

    var noPoints = 15; // This is number of points to sample difficulty. With our API will take 3 seconds. Hard coded as I don't want to flood the API. I think 15 points is a good enough estimate.
    if (inputs.noPoints != undefined) { noPoints = inputs.noPoints;} 
    var dataPoints = 150; // The accuracy of the expectation and variance in the performance plot.
    if (inputs.dataPoints != undefined) { dataPoints = inputs.dataPoints;} 
    var address = inputs.performance.address;
    var pastBlocks = inputs.performance.pastBlocks;
    var blockTime = inputs.blockTime;
    var hashRate = inputs.hashRate;
    var currentlyMining = false;
    if (inputs.currentlyMining === 'enable'){
      currentlyMining = true;
      var currentBlock = inputs.currentBlock;
    };
    



    return new Promise(function(resolve,reject){

      //Find the blocks mined
      EtherscanDataService.getMinedBlocks(address).then(function(blockData){
        if (blockData.length == 0){ //Then no mined blocks under the address
          reject("MPNOB");
          return;
        };
        if (blockData.length == 1) { // Only a single block mined, need at least 2.
          reject("MPSB");
          return;
        }
        
        if (pastBlocks == 0 || pastBlocks == undefined){
          pastBlocks = blockData.length;
        };
        // We have blocks - Now we build a data set of the blocks we are interested in
        var dataSet = {};
        dataSet.minedBlocks = [];
        for(var i =0;i < Math.min(pastBlocks,blockData.length);i++){
          //dataSet.minedBlocks.push([new Date(blockData[i].timeStamp*1000),i]);
          // Store just the timestamp

          //Set the first blocks first -- ie count backwards
          var counter =Math.min(pastBlocks-1,blockData.length-1)-i;
          dataSet.minedBlocks.push([Number(blockData[counter].timeStamp*1000),i+1]); //i + 1 because we start at 1
        };
        // Sample difficulty over the date range and build a predictive model.
        // Note: If we are currently mining, we need to find the current block. 
        // Required prediction data
        var predictionData = {};
        //predictionData.pastDays = (dataSet.minedBlocks[0][0].getTime() - dataSet.minedBlocks[dataSet.minedBlocks.length-1][0].getTime())/(1000*3600*24);

        // The prediction range is dependent on whether we are currently mining (i.e up to today) or just last block.
        
        if (currentlyMining) //We predict from today to last block we need
        {
          predictionData.pastDays = (Date.now() - dataSet.minedBlocks[0][0])/(1000*3600*24);
          predictionData.curBlock = Number(currentBlock);
        }
        else //Use last block for prediction
        {
          predictionData.pastDays = (dataSet.minedBlocks[dataSet.minedBlocks.length-1][0] - dataSet.minedBlocks[0][0])/(1000*3600*24);
          predictionData.curBlock = Number(blockData[0].blockNumber); //Only need difficulty up to last block Mined
        }

        predictionData.blockTime = blockTime;
        predictionData.noPoints = noPoints;
        //we need to get the difficulty of the last block. As I've programmed the predictionservice to take this as an input. 
        EtherscanDataService.getDifficultyData(predictionData.curBlock).then(function(curBlockDifficulty){
          predictionData.curDifficulty = curBlockDifficulty/(1e12);
          // Get our sample of points. 
          dataPredictionService.getPredictionData(predictionData).then(function(diffData){
            //Invert this data such that 0 is the past, not today
            var invertedDiffData = InvertPredictionData(diffData);
            //Get an automatic difficulty prediction
            var predictionVariables = PredictionService.predict("auto",invertedDiffData);
            
            //Now Just build a variance-graph style data-set
            //Build or own function for this as in this case it is looking backwards in time. 
            //Will be very closely modelled after the calc-service.js loop.
            dataSet.expected = BuildVarianceData(predictionVariables,predictionData,dataPoints,dataSet.minedBlocks[0][0],hashRate);

            resolve(dataSet);

            return;
          });
        });
      });
    });
  };
    
  function BuildVarianceData(predictionVariables,predictionData,dataPoints,firstDate,hashRate){
    //Define Needed Variables
    var daysToCalculate = predictionData.pastDays;
    //Set up object for the statistics service. 
    var statsInputs = {}
    statsInputs.blockTime = predictionData.blockTime;
    statsInputs.difficultyType = predictionVariables.type;
    statsInputs.predictionVariables = predictionVariables;
    statsInputs.hashRate = hashRate;

    var data = {};
    data.expected = new Array();
    data.oneSigmaRange = new Array();
    data.twoSigmaLower = new Array();
    data.twoSigmaUpper = new Array();
    data.maximumPlotValue = new Array();
    data.minimumPlotValue = new Array();
    data.maximumValue = statisticsService.expectation(statsInputs, daysToCalculate) + 2 * statisticsService.variance(statsInputs, daysToCalculate) + 1; // This stores the maximum plot value. Required to fill the top of the graph with 2 sigma range.
    data.minimumValue =1; // We start at 1 block

    var linearQuanta = daysToCalculate/dataPoints; //Linear increments
    for(var j=0;j<=dataPoints;j++){
    
      var dependent = j*linearQuanta;
      var expResult = statisticsService.expectation(statsInputs, dependent) + 1; //We start at 1 not 0 i.e from the first block mined.
      var varResult = statisticsService.variance(statsInputs, dependent); 
      
      // We want to convert the dependent, which is a block-count to a timestamp.
      //Initial timestamp is firstDate
      // var dependentDate = new Date(firstDate.getTime() + dependent*24*3600*1000);
      var dependentDate = firstDate + dependent*24*3600*1000;
      buildDataSetWithVariance(data, dependentDate, expResult, varResult);

    };

    return data;

  };
    

  function InvertPredictionData(predictionData,pastDays){
    //We know the minimum is pastDays - we can't just add this, as there are rounding errors. 
    //So we find the minimum and add that to invert the dataset. 
    
    //Find minimum Value
    var min = 0;
    for(var day in predictionData){
      if (Number(day) < min){
        min = day;
      };
    };
    //Create a new data set that is positive and increasing
    var newData = {'0': predictionData[min]};
    for(var days in predictionData){
      if (days != min){
      newData[Number(days) - min] = predictionData[days]; // min is negative. So this adds
      };
    };
    return newData;
  };

  function buildDataSetWithVariance(data,dependent, expected, std){
    data.expected.push([dependent, expected]);
    // Build Standard Deviation Areas
    data.oneSigmaRange.push([dependent,expected - std, expected + std]);
    data.twoSigmaLower.push([dependent, expected - 2 * std, expected - std]);
    data.twoSigmaUpper.push([dependent, expected + std, expected + 2 * std]);
    data.maximumPlotValue.push([dependent, expected + 2 * std, data.maximumValue * 1.1]);
    data.minimumPlotValue.push([dependent, data.minimumValue, expected - 2 * std]);
  }

    return factory;
  }]);
