var BRF = artifacts.require("./BRF.sol");

contract("BRF", function(accounts) {
  var brfInstance;

  it("Initialize with 0 ballots", function() {
    return BRF.deployed().then(function(instance) {
      return instance.getNumBallots();
    }).then(function(count) {
      assert.equal(count, 0);
    });
  });

//   it("Adding 3 accounts", function() {
//     return BRF.deployed().then(function(instance) {
//     brfInstance = instance;
//     brfInstance.giveRightToVote(10, web3.eth.accounts[1]);
//     return brfInstance.getNumOfAddresses();
//   }).then(function(nOfAdd) {
//     assert.equal(nOfAdd, 1, "One address added")
//     brfInstance.giveRightToVote(15, web3.eth.accounts[2]);
//     return brfInstance.getNumOfAddresses();
//   }).then(function (nOfAdd) {
//     assert.equal(nOfAdd, 2, "Two addresses added")
//     brfInstance.giveRightToVote(10, web3.eth.accounts[3]);
//     return brfInstance.getNumOfAddresses();
//   }).then(function (nOfAdd) {
//     assert.equal(nOfAdd, 3, "Three addresses added")
//   });
// });

  it("Adding three accounts and 3 proposals and voting", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      brfInstance.giveRightToVote(10, web3.eth.accounts[1]);
      return brfInstance.getNumAddresses();
    }).then(function(nOfAdd) {
      assert.equal(nOfAdd, 1, "One address added")
      brfInstance.giveRightToVote(15, web3.eth.accounts[2]);
      return brfInstance.getNumAddresses();
    }).then(function (nOfAdd) {
      assert.equal(nOfAdd, 2, "Two addresses added")
      brfInstance.giveRightToVote(20, web3.eth.accounts[3]);
      return brfInstance.getNumAddresses();
    }).then(function (nOfAdd) {
      assert.equal(nOfAdd, 3, "Three addresses added");
      brfInstance.createBallot("one", [10, 500, 23]);
      brfInstance.createBallot("two", [0, 44, 99, 41]);
      return brfInstance.getNumBallots();
    }).then(function(nOfBall) {
      assert.equal(nOfBall, 2, "2 ballots exist");
      brfInstance.vote(0, 1, {from : web3.eth.accounts[1]});
      brfInstance.vote(0, 1, {from : web3.eth.accounts[2]});
      brfInstance.vote(0, 2, {from : web3.eth.accounts[3]});
      return brfInstance.getWinner(0);
    }).then(function(winner) {
      assert.equal(winner, 500, "Proposal \"500\" won");
      brfInstance.vote(1, 2, {from : web3.eth.accounts[1]});
      brfInstance.vote(1, 3, {from : web3.eth.accounts[2]});
      brfInstance.vote(1, 2, {from : web3.eth.accounts[3]});
      return brfInstance.getWinner(1);
    }).then(function(winner){
      assert.equal(winner, 99, "Proposal \"99\" won");
    });
  });

  
  it("Throws exception when voting on invalid ballot or proposals or when not allowed to vote", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance; 
      brfInstance.createBallot("three", [11,22,33]);
      // vote for non-existent ballot
      return brfInstance.vote(3,1, {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('invalid opcode') >= 0);
      // vote for non-existent proposal
      return brfInstance.vote(2, 99,  {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 );
      brfInstance.vote(2,0, {from: web3.eth.accounts[1]});
      // vote twice
      return brfInstance.vote(2,0, {from: web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 );
      return brfInstance.getWinner(2);
    }).then(function(winner){
      assert.equal(winner,11, "proposal \"11\" won")
      // forreign user voting
      return brfInstance.vote(2,0, {from: web3.eth.accounts[9]});
      }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 );
    });
  });


  it("attempts to give right to vote in faulty ways", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      return brfInstance.giveRightToVote(1, web3.eth.accounts[4], {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0);
    });
  });

});












