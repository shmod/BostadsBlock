pragma solidity ^0.4.19;

/* TODO:
	Tomorrow we check how we test. Try setting it up on remix and trying with metamask and after that
	trying to get together an app.

	Should we implement a timelimit, in that case where (when to start/stop)?
	How to retrieve the winning proposal in BRF.

	How does the has look like (format, size etc.)?
*/

import "./Ballot.sol";
/**
 * The BRF contract does this and that...
 */
contract BRF {

	mapping (address => uint) private memberWeights;	//Same thing as weights
	address[] private addresses;
	uint[] private weights;
	address public chairPerson;
	uint public sumWeights;

	Ballot[] ballots;

	constructor () public{
		chairPerson = msg.sender;
		weights = [25, 5, 2, 35, 15];
		addresses = [0xca35b7d915458ef540ade6068dfe2f44e8fa733c, 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c, 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db, 0x583031d1113ad414f02576bd6afabfb302140225, 0xdd870fa1b7c4700f2bd7f44238821c26f7392148];
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
	function transferOwnership(address newOwner) public {
		require(newOwner != msg.sender, "You cannot transfer the ownership to yourself");
		memberWeights[newOwner] = memberWeights[msg.sender];
		memberWeights[msg.sender] = 0;

		for (uint i = 0; i<addresses.length; i++) {
			if (addresses[i] == msg.sender) {
				addresses[i] = newOwner;
			}
		}
	}


	/* @dev Creates a new ballot and pushes it into the global array called ballots.
	@param proposalNames array with proposalnames 
	*/
	function createBallot(bytes32[] proposalNames) public {
		require(msg.sender == chairPerson, "You cant create a ballot");
		ballots.push(new Ballot(addresses, proposalNames, 120));
	}

	/* 
	@dev Votes for a proposal in a given ballot
	@param ballotID The id of the ballot we are voting on
	@param proposalID The id of the proposal we are voting on
	*/
	function vote(uint ballotID, uint proposalID) public {
		ballots[ballotID].vote(proposalID, memberWeights[msg.sender], msg.sender);
	}

	/* @dev Let's a member delegates it's shares in a certain ballot to another
	member.
	@param ballotID The ID of the ballot in which it wants to delegate.
	@param to The adress of the person it wants to delegate to.
	*/
	function delegateTo(uint ballotID, address to) public {
		ballots[ballotID].delegate(memberWeights[msg.sender], to, msg.sender);
	}

	/* @dev Calls the ballot to retrieve the winner and sets in motion the transaction
	associated with the winning proposal.
	@param ballotID The id of the associated
	*/
	function getWinner(uint ballotID) public view returns (bytes32 winnerName_){
		winnerName_ = ballots[ballotID].winnerName();
	}
}

