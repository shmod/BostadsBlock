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
        console.log("event triggered");
      // });
    });
  },

  render: function() {
    var brfInstance;
    var myAccount;
    var chairPerson;
    //var loader = $("#loader");
    //var content = $("#content");
    var propAdder = $("#propAdd");
    //loader.show();
    //content.hide();

    //hide the proposal adder
    propAdder.hide();
    // Load account data

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        myAccount = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    var id;
    var name;
    var ballotSize;
    // Load contract data
    App.contracts.BRF.deployed().then(function(instance) {
      brfInstance = instance;
      return brfInstance.getNumAddresses();
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
        if (nameCP == myAccount) {
          propAdder.show();
        }
        return brfInstance.getNumBallots();
      }).then(function(ballSize) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        ballotSize = ballSize;
        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + ballotSize + "</td></tr>"
        candidatesResults.append(candidateTemplate);
        // Render candidate ballot option
        document.getElementById("ballotSelect").setAttribute("value",ballotSize);

        return brfInstance.name();
      }).then(function(brfname2) {
        var BRFname = $("#BRFname");
        BRFname.empty();
        BRFname.append(brfname2);
        //Render list of ballots
        var bS = document.getElementById("ballotSelect").getAttribute("value");
        var ballotSelect = $('#ballotSelect');
        ballotSelect.empty();
        ballotSelect.empty();
        let prom = App.contracts.BRF.deployed();
        
        App.contracts.BRF.deployed().then(function(instance){
          brfInstance = instance;
          for (var i = 0; i<bS; i++){
            instance.getBallotName(i).then(function(name){
              var candidateOption = "<option value='" + id + "'>" + name + "</ option>"
              ballotSelect.append(candidateOption);
            })
          }
        });

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
     $('#accountAddress').show();

  },

  addBallot: function() {
    var ballotName = document.getElementById("bn").value;
    var numProp = document.getElementById("Proposals1").value;
    console.log(numProp);
    var c = [];
    for (var i = 0; i < numProp; i++) {
      c.push(document.getElementById("p" + i).value);
    }
    console.log(ballotName)
    App.contracts.BRF.deployed().then(function(instance) { 
      return instance.createBallot(ballotName, c);
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
  },

  showVote: function() {
    var ballotSelect = document.getElementById("ballotSelect");
    var i = ballotSelect.selectedIndex;
    var text = ballotSelect.options.item(i).text;
    console.log(text);
    $("#Proposal").show();
    var c2 = document.getElementById("Proposal");
    while (c2.hasChildNodes()) {
      c2.removeChild(c2.lastChild);
    }
    var myHeader = document.createElement("h2");
    myHeader.appendChild(document.createTextNode(text));
    c2.append(myHeader);

    //Create and add the header (Adress, Andelar, Röst)
    //to our site.
    var table = document.createElement('table');
    table.setAttribute("class", "table table-striped table'sm");
    var tr = document.createElement("tr");
    var th1 = document.createElement("th");
    var th2 = document.createElement("th");
    var th3 = document.createElement("th");
    th1.appendChild(document.createTextNode("Adress"));
    th2.appendChild(document.createTextNode("Andelar"));
    th3.appendChild(document.createTextNode("Röst"));
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    table.appendChild(tr);

    
    //Add the values to the table
    var tbody = document.createElement("tbody");
    App.contracts.BRF.deployed().then(function(instance){
      brfInstance = instance;
      return brfInstance.getNumAddresses();
    }).then(function (numAdd) {
      for (var j = 0; j<numAdd; j++){
        var add;
        var weight;
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        brfInstance.getAddressWeight(j).then(function(ret_){
          td1.appendChild(document.createTextNode(ret_[0]));
          td2.appendChild(document.createTextNode(ret_[1]));
          td3.appendChild(document.createTextNode("Röst"));
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbody.append(tr);
          });
      }
    });
    table.append(tbody);
    c2.append(table);
    c2.append(document.createElement("hr"))
  }
};



function addFields() {
  //Number of proposals
  var number = document.getElementById("numProp").value;

  // Container <dic> where propsals will be placed
  var container = document.getElementById("Proposals1")
  document.getElementById("Proposals1").setAttribute("value", number);
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  for (i=0;i<number;i++){
    // Append a node with a random text
    container.appendChild(document.createTextNode("Förslag " + (i+1)));
    // Create an <input> element, set its type, class and name attributes
    var input = document.createElement("input");
    input.type = "number";
    input.className = "form-control";
    input.id = "p" + i;
    container.appendChild(input);
    // Append a line break
    container.appendChild(document.createElement("br"));
  }
  var myButton = document.createElement("addVote");
  var t = document.createTextNode("Lägg upp omröstning")
  myButton.appendChild(t);
  myButton.type = "submit";
  myButton.className = "btn btn-primary";
  myButton.addEventListener('click', function(event){App.addBallot()});
  container.appendChild(myButton);
  console.log(document.getElementById("ballotSelect").getAttribute("value"));
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});












