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
    var giveRight = $("#giveRight");
    var cpButtons = $("#cpButtons");
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
          cpButtons.show();
        }
        return brfInstance.numBallots();
      }).then(function(ballSize) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        ballotSize = ballSize;
        // Render candidate Result
        console.log(ballotSize);
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + ballotSize + "</td></tr>"
        candidatesResults.append(candidateTemplate);
        // Render candidate ballot option
        document.getElementById("ballotSelect").setAttribute("value",ballotSize);

        return brfInstance.brfName();
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
    var numProp = document.getElementById("Proposals1").getAttribute("value");
    var c = [];
    var t = [];
    for (var i = 0; i < numProp; i++) {
      c.push(document.getElementById("p" + i).value);
    }
    App.contracts.BRF.deployed().then(function(instance) { 
      return instance.createBallot(ballotName, c, 0, t, t);
    });
  },

  addBallot: function() {
    var ballotName = document.getElementById("bn").value;
    var numProp = document.getElementById("Proposals1").getAttribute("value");
    var c = [];
    for (var i = 0; i < numProp; i++) {
      c.push(document.getElementById("p" + i).value);
    }
    App.contracts.BRF.deployed().then(function(instance) { 
      return instance.createBallot(ballotName, c);
    });
  },

  vote: function(ballotID, propID) {
    App.contracts.BRF.deployed().then(function(instance) {
      return instance.vote(ballotID, propID, {from : App.account });
    }).catch(function(err) {
      console.error(err);
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

  giveRight: function() {
  var address = document.getElementById("addressName").value;
  var weights = document.getElementById("numWeights").value;
  console.log(address);
  console.log(weights);
  App.contracts.BRF.deployed().then(function(instance) {
    return instance.giveRightToVote(weights, address)
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
    th1.appendChild(document.createTextNode("Förslag"));
    th2.appendChild(document.createTextNode("Röstmängd"));
    th3.appendChild(document.createTextNode("Rösta"));
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    table.appendChild(tr);

    
    //Add the values to the table
    var numProp;
    var tbody = document.createElement("tbody");
    App.contracts.BRF.deployed().then(function(instance){
      brfInstance = instance;
      return brfInstance.getNumProposals(i);
    }).then(function (numProp_) {
      numProp = numProp_;
      console.log(numProp);
      console.log(numProp[0]);
      for (var j = 0; j<numProp; j++){
        var add;
        var weight;
        brfInstance.getProposal(i,j).then(function(ret_){
          var tr = document.createElement("tr");
          var td1 = document.createElement("td");
          var td2 = document.createElement("td");
          var td3 = document.createElement("td");
          td1.appendChild(document.createTextNode(ret_[0]));
          td2.appendChild(document.createTextNode(ret_[1]));
          var td3 = document.createElement("a");
          var t = document.createTextNode("Rösta")
          td3.appendChild(t);
          td3.type = "submit";
          td3.className = "btn btn-primary";
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbody.append(tr);
          td3.addEventListener('click', function(event){App.vote(i,tr.rowIndex-1)});
          });
      }
    });
    table.append(tbody);
    c2.append(table);
    c2.append(document.createElement("hr"))
  }
};

function showMembAdd() {
  var giveRight = $("#giveRight");
  if (document.getElementById("giveRight").style.display == "none") {
    giveRight.show();
  } else {
    giveRight.hide();
  }
}

function showPropAdd() {
  var propAdd = $("#propAdd");
  if (document.getElementById("propAdd").style.display == "none") {
    propAdd.show();
  } else {
    propAdd.hide();
  }
}
function showPropAddTrans() {
  var propAddTrans = $("#propAddTrans");
  if (document.getElementById("propAddTrans").style.display == "none") {
    propAddTrans.show();
  } else {
    propAddTrans.hide();
  }
}

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
  var myButton = document.createElement("a");
  var t = document.createTextNode("Lägg upp omröstning")
  myButton.appendChild(t);
  myButton.type = "submit";
  myButton.className = "btn btn-primary";
  myButton.addEventListener('click', function(event){App.addBallot()});
  container.appendChild(myButton);
  console.log(document.getElementById("ballotSelect").getAttribute("value"));
}

function addFields2() {
  //Number of proposals
  var number = document.getElementById("numProp2").value;

  // Container <dic> where propsals will be placed
  var container = document.getElementById("Proposals21");
  document.getElementById("Proposals21").setAttribute("value", number);
  var table = document.createElement('table');
  table.setAttribute("class", "table table-striped table'sm");

  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }


  for (i=0;i<number;i++){
    // Append a node with a random text
    //container.appendChild(document.createTextNode("Förslag " + (i+1)));
   // container.appendChild(document.createTextNode("Adress " + (i+1)));
   // container.appendChild(document.createTextNode("Kostnad " + (i+1)));


    var tr = document.createElement("tr");
    var th1 = document.createElement("th");
    var th2 = document.createElement("th");
    var th3 = document.createElement("th");
    th1.appendChild(document.createTextNode("Förslag"));

    th2.appendChild(document.createTextNode("Adress"));
    th3.appendChild(document.createTextNode("Kostnad"));
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    table.appendChild(tr);

    var trInput = document.createElement("tr");
    var th1Input = document.createElement("th");
    var th2Input = document.createElement("th");
    var th3Input = document.createElement("th");
    // Create an <input> element, set its type, class and name attributes
    var input1 = document.createElement("input");
    input1.type = "number";
    input1.className = "form-control";
    input1.id = "p" + i;
    input1.size = "30"
    th1Input.appendChild(input1);
    trInput.appendChild(th1Input);
    var input2 = document.createElement("input");
    input2.className = "form-control";
    input2.id = "address" + i;
    th2Input.appendChild(input2);
    trInput.appendChild(th2Input);
    var input3 = document.createElement("input");
    input3.type = "number";
    input3.className = "form-control";
    input3.id = "cost" + i;
    th3Input.appendChild(input3);
    trInput.appendChild(th3Input);
    // Append a line break
    table.appendChild(trInput);
  }
  container.appendChild(table);
  var myButton = document.createElement("a");
  var t = document.createTextNode("Lägg upp omröstning")
  myButton.appendChild(t);
  myButton.type = "submit";
  myButton.className = "btn btn-primary";
  myButton.addEventListener('click', function(event){App.addBallotWithProps()});
  container.appendChild(myButton);
  console.log(document.getElementById("ballotSelect").getAttribute("value"));
}



$(function() {
  $(window).load(function() {
    App.init();
  });
});












