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
      brfInstance.createBallot(0x00, [0x11, 0x22, 0x33]);
      brfInstance.createBallot(0x01, [0x11,0x99]);
      return brfInstance.getNumBallots();
    }).then(function(nOfBall) {
      assert.equal(nOfBall, 2, "2 ballots exist");
      return brfInstance.getWinner(0x00);
    }).then(function(winner) {
      assert.equal(winner, 0xFF, "0xFF means it's a draw.");
      brfInstance.vote(0x00, 0x22, {from : web3.eth.accounts[1]});
      brfInstance.vote(0x00, 0x11, {from : web3.eth.accounts[2]});
      brfInstance.vote(0x00, 0x11, {from : web3.eth.accounts[3]});
      return brfInstance.getWinner(0x00);
    }).then(function(winner) {
      assert.equal(winner, '0x11', "Proposal \"0x11\" won");
      brfInstance.vote(0x01, 0x99, {from : web3.eth.accounts[1]});
      brfInstance.vote(0x01, 0x99, {from : web3.eth.accounts[2]});
      brfInstance.vote(0x01, 0x11, {from : web3.eth.accounts[3]});
      return brfInstance.getWinner(0x01);
    }).then(function(winner){
      assert.equal(winner, 0x99, "Proposal \"0x99\" won");
    });
  });

  
  it("Throws exception when voting on invalid ballot or proposals or when not allowed to vote", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance; 
      brfInstance.createBallot(0x02, [0x11,0x22,0x33]);
      // vote for non-existent ballot
      return brfInstance.vote(0x03,0x11, {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('invalid opcode') >= 0);
      // vote for non-existent proposal
      return brfInstance.vote(0x02, 0x99,  {from : web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 );
      brfInstance.vote(0x02,0x33, {from: web3.eth.accounts[1]});
      // vote twice
      return brfInstance.vote(0x02,0x33, {from: web3.eth.accounts[1]});
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0 );
      return brfInstance.getWinner(2);
    }).then(function(winner){
      assert.equal(winner,0x11, "proposal \"11\" won");
      // forreign user voting
      return brfInstance.vote(0x02,0x22, {from: web3.eth.accounts[9]});
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