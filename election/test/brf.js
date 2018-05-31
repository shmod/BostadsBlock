var BRF = artifacts.require("./BRF.sol");

contract("BRF", function(accounts) {
  var brfInstance;

  it("Initialize with 0 ballots", function() {
    return BRF.deployed().then(function(instance) {
      return instance.numBallots();
    }).then(function(count) {
      assert.equal(count, 0);
    });
  });

  it("Using createBallot to giveRightToVote", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      brfInstance.createBallot("Voterights for add 1", [0,1], 1, [web3.eth.accounts[1]],[25]);
      return brfInstance.numBallots();
    }).then(function(nOfBall) {
      assert.equal(nOfBall, 1, "succesfully created ballot");
      brfInstance.vote(0,1, {from : web3.eth.accounts[0]});
      return brfInstance.getNumAddresses();
    }).then(function(nOfAdd) {
      assert.equal(nOfAdd, 2, "Successfully gave right to vote");
    });
  });

  it("Adding 2 ballots and voting while checking for correct results", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      brfInstance.createBallot("One", [11,22,33], 0, [], []);
      brfInstance.createBallot("Two", [44,55], 0, [], []);
      return brfInstance.numBallots();
    }).then(function(nOfBall) {
      assert.equal(nOfBall, 3, "2 ballots exist");
      return brfInstance.getWinner(1);
    }).then(function(winner) {
      assert.equal(winner, 999, "999 means it's a draw.");
      brfInstance.vote(1, 0, {from : web3.eth.accounts[1]});
      brfInstance.vote(1, 1, {from : web3.eth.accounts[0]});
      return brfInstance.getWinner(1);
    }).then(function(winner) {
      assert.equal(winner, 0, "Proposal \"11\" won");
      brfInstance.vote(2, 1, {from : web3.eth.accounts[1]});
      brfInstance.vote(2, 1, {from : web3.eth.accounts[0]});
      return brfInstance.getWinner(2);
    }).then(function(winner){
      assert.equal(winner, 1, "Proposal \"55\" won");
    });
  });

 it("Using createBallot to send transaction", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      brfInstance.deposit({ value : 2000000000000000000, from : web3.eth.accounts[0]});
      brfInstance.createBallot("Who gets money", [11,22], 2, [web3.eth.accounts[8], web3.eth.accounts[9]],[1000000000000000000,1000000000000000000]);
      return brfInstance.numBallots();
    }).then(function(nOfBall) {
      assert.equal(nOfBall, 4, "succesfully created ballot");
      brfInstance.vote(3,0, {from: web3.eth.accounts[1]});
    });
  });




  it("Throws exception when voting on invalid ballot or proposals or when not allowed to vote", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance; 
      brfInstance.createBallot("random", [11,22,33], 0, [], []);
      // vote for non-existent ballot
      return brfInstance.vote(99,0, {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "non-existent ballot");
      // vote for non-existent proposal
      return brfInstance.vote(4, 99,  {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 , "non-existent proposal");
      return brfInstance.vote(4,0, {from: web3.eth.accounts[1]});
    }).then(function() {
      // vote twice
      return brfInstance.vote(4,0, {from: web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 , "vote twice");
      return brfInstance.getWinner(4);
    }).then(function(winner){
      assert.equal(winner,0, "proposal \"11\" won");
      // foreign user voting
      return brfInstance.vote(4,2, {from: web3.eth.accounts[9]});
      }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 , "foreign user voting");
    });
  });


  /*it("attempts to give right to vote from another address", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      return brfInstance.giveRightToVote(1, web3.eth.accounts[4], {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log(error);
      assert(error.message.indexOf('revert') >= 0);
    });
  });*/

});