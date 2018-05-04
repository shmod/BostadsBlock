App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("BRF.json", function(brf) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.BRF = TruffleContract(brf);
      // Connect provider to interact with contract
      App.contracts.BRF.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.BRF.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      // instance.votedEvent({}, {
      //   fromBlock: 0,
      //   toBlock: 'latest'
      // }).watch(function(error, event) {
      //   console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      // });
    });
  },

  render: function() {
    var brfInstance;
    //var loader = $("#loader");
    var content = $("#content");

    //loader.show();
    content.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    var id;
    var name;
    var ballotSize;
    // Load contract data
    App.contracts.BRF.deployed().then(function(instance) {
      brfInstance = instance;
      return brfInstance.getNumOfAddresses();
    }).then(function(numAdd) {
        id = numAdd;
        // for (var i = 1; i <= candidatesCount; i++) {
        // electionInstance..then(function(candidate) {
        //   var id = candidate[0];
        //   var name = candidate[1];
        //   var voteCount = candidate[2];
        return brfInstance.chairPerson();
      }).then(function(nameCP) {
        name = nameCP;
        return brfInstance.getBallotSizes();
      }).then(function(ballSize) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var ballotSelect = $('#ballotSelect');
        ballotSelect.empty();

        ballotSize = ballSize;
        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + ballotSize + "</td></tr>"
        candidatesResults.append(candidateTemplate);
        console.log("Hello!");
        // Render candidate ballot option
        var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        ballotSelect.append(candidateOption);
        return brfInstance.name();
      }).then(function(brfname2) {
        var BRFname = $("#BRFname");
        BRFname.empty();
        BRFname.append(brfname2);
      });
    //   return electionInstance.voters(App.account);
    // }).then(function(hasVoted) {
    //   // Do not allow a user to vote
    //   if(hasVoted) {
    //     $('form').hide();
    //   }
    //  loader.hide();
    //   content.show();
    // }).catch(function(error) {
    //   console.warn(error);
    // });
    content.show();
  },

  addBallot: function() {
    var ballotName = document.getElementById("bn").value;
    console.log(ballotName)
    App.contracts.BRF.deployed().then(function(instance) { 
      return instance.createBallot("adslfg", [1,2]);
    });
  },


  castVote: function() {
    var candidateId = $('#ballotSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      //$("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
