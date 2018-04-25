pragma solidity ^0.4.19;

/* TODO:
	Tomorrow we check how we test. Try setting it up on remix and trying with metamask and after that
	trying to get together an app.

	Should we implement a timelimit, in that case where (when to start/stop)?
	How to retrieve the winning proposal in BRF.

	How does the has look like (format, size etc.)?


*/


/**
 * The BRF contract does this and that...
 */
contract BRF {

	mapping (address => double) private memberWeights;	//Same thing as weights
	address[] private adresses;
	uint[] private weights;
	address public chairPerson;
	uint public sumWeights;

	Ballot[] ballots;

	function BRF () {
		chairPerson = msg.sender;
		weights = [25, 5, 2, 35, 15];
		addresses = [];
		sumWeights = 0;
		for (uint i = 0; i<weights.length; i++) {
			giveRightToVote(weights[i], addresses[i]);
		}
	}


	/* This function gets passed tuples of weights and addresses. Only the chairperson
	will be allowed to call this function. The function assigns a weight to a certain address.
	When a call is made later, the address will be able to vote with its shares. */
	function giveRightToVote(uint weight, address currAdd) internal {

		require (weight > 0, "Cannot assign nonpositive values to our weights");
		require (msg.sender == chairPerson, "You do not have permission to add a member");

		/*This might be a problematic requirement if the weights change (mbe we make some 
		appartments smaller etc.) */
		require(sumWeights + weight <= 100, "Sum of all weights exceed the limit (100)"); 

		memberWeights[currAdd] = weight;
		sumWeights += weight;
	}


	/* Transfer the ownership of one apartment from one owner to another */
	transferOwnership(address newOwner) {
		require(newOwner != msg.sender, "You cannot transfer the ownership to yourself");
		memberWeights[newOwner] = memberWeights[msg.sender];
		memberWeights[msg.sender] = 0;

		for (uint i = 0; i<adresses.length; i++) {
			if (addresses[i] == msg.sender) {
				addresses[i] = newOwner;
			}
		}
	}

	transferOwnership(address oldOwner, address newOwner) {
	}

	/* @dev Creates a new ballot and pushes it into the global array called ballots.
	@param proposalNames array with proposalnames 
	*/
	function createBallot(bytes32[] proposalNames) {
		ballots.push(new Ballot(addresses, proposalNames));
	}

	/* 

	*/
	function vote(uint ballotID, proposalID) {
		ballots[ballotID].vote(proposalID, memberWeights[msg.sender]);
	}

	/* @dev Let's a member delegates it's shares in a certain ballot to another
	member.
	@param ballotID The ID of the ballot in which it wants to delegate.
	@param to The adress of the person it wants to delegate to.
	*/
	function delegateTo(uint ballotID, address to) {
		ballots[ballotID].delegate(memberWeights[msg.sender], to);
	}
}

