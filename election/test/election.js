var BRF = artifacts.require("./BRF.sol");

contract("BRF", function(accounts) {
  var brfInstance;

  it("Initializes with 5 member", function() {
    return BRF.deployed().then(function(instance) {
      brfInstance = instance;
      return instance.ballots();
    }).then(function(Ballot[]) {
      assert.equal(Ballot[].length, 2);
    });
  });

});
