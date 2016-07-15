angular.module('ethMiningCalc')
  .factory('ErrorHandlingService', [function() {
    var factory = {};
   
  /* Custom Errors: 
   *    PDATAERR  : Predicting too far in the past. No blockchain data
   *    ETHBT     : ETH BlockTime source fail
   *    ETHCB     : ETH Current block source fail
   *    ETHDIFF   : ETH Difficulty source fail
   *    BTCBT     : BTC BlockTime source fail
   *    BTCCB     : BTC Current block source fail
   *    BTCDIFF   : BTC Difficulty source fail
   *    BTCBR     : BTC Block Reward Source fail
   *
   *        Miner Performance Errors
   *    MPNOB     : Miner Performance No Blocks Mined Under this address
   *    MPSP      : Miner Performance Single block : Only 1 block has been mined. Not enough to draw the graph.
   *
   *        Math Errors
   *    EINF      : Infinity expectation values - Ridiculous inputs, incalculable 
   *    VINF      : Infinity variance values - Ridiculous inputs, incalculable 
   *    PINF      : Infinity probability values - Ridiculous inputs, incalculable 
   */    
   

  factory.handleError = function(err){
    switch(err){

      case "PDATAERR":
        //TODO: Give a proper UI response
        alert("Can't predict this far into the past. Lower the number of days");
        break;

      case "ETHCB":
        alert("Can't get current block. Fail");
        break;

      case "ETHDIFF":
        alert("Can't get difficulty. Fail");
        break;

      case "ETHBT":
        alert("Can't get block time. Fail");
        break;

      case "BTCCB":
        alert("Can't get current block (BTC). Fail ");
        break;

      case "BTCDIFF":
        alert("Can't get difficulty (BTC). Fail");
        break;

      case "BTCBT":
        alert("Can't get block time (BTC). Fail");
        break;

      case "BTCBR":
        alert("Can't get block reward (BTC). Fail");
        break;

      case "PINF":
        alert("Can't calculate probabilities. Inputs are too hectic");
        break;

      case "EINF":
        alert("Can't calculate expectation. Inputs are too hectic");
        break;

      case "VINF":
        alert("Can't calculate variance. Inputs are too hectic");
        break;

      case "MPNOB":
        alert("The address you have entered is not a solo-mining address. No blocks have been solved.");
        break;

      case "MPSB":
        alert("The address you have entered has only solved 1 block. At least two blocks need to be solved to analyse the address.");
        break;

      default:
        console.log(err);
        // Some non-custom error
        break;

      };

  };

  return factory;
  }]);
