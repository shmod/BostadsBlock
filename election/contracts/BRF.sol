pragma solidity ^0.4.19;


/**
 * The BRF contract does this and that...
 */
contract BRF {

	mapping (address => Member) private members;	//Same thing as weights
	address[] private addressesList;
	uint[] private weights;
	address public chairPerson;
	uint public sumWeights;
	string public brfName;
	uint public numBallots;
	
	struct Member {
        uint weight; // weight is accumulated by delegation
        mapping(uint => bool) voted;  // if true, that person already voted in this ballot
        address delegate; // person delegated to
    }

	struct Proposal {
		uint name;
		uint ID;
		uint voteCount;
		//hash = "qe23rs!"
	}

	struct Ballot {
		uint ID;
		string name;
		uint numProposals;
		mapping(uint => Proposal) proposals;
		// add mapping of who has voted for what
	}

	mapping (uint => Ballot) ballots;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );


	constructor () public{
		numBallots = 0;
		chairPerson = msg.sender;
		sumWeights = 0;
		brfName = "BRF Blockkedjan";
		// weights = [25, 5, 2, 35, 15];
		// addressesList = [0xca35b7d915458ef540ade6068dfe2f44e8fa733c, 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c, 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db, 0x583031d1113ad414f02576bd6afabfb302140225, 0xdd870fa1b7c4700f2bd7f44238821c26f7392148];
		// for (uint i = 0; i<weights.length; i++) {
		// 	giveRightToVote(weights[i], addressesList[i]);
		// }
		// int[] storage input;
		// input.push(1);
		// input.push(2);
		// createBallot(input);
	}


	/* This function gets passed tuples of weights and addresses. Only the chairperson
	will be allowed to call this function. The function assigns a weight to a certain address.
	When a call is made later, the address will be able to vote with its shares. */
	function giveRightToVote(uint weight, address currAdd) public {

		require (weight > 0, "Cannot assign nonpositive values to our weights. revert");
		require (msg.sender == chairPerson, "You do not have permission to add a member");

		/*This might be a problematic requirement if the weights change (mbe we make some 
		appartments smaller etc.) */
		require(sumWeights + weight <= 100, "Sum of all weights exceed the limit (100)"); 
        require(members[currAdd].weight == 0, "The address already has voting rights.");
		members[currAdd].weight = weight;
		sumWeights += weight;
		addressesList.push(currAdd);
		weights.push(weight);
	}


	/* Transfer the ownership of one apartment from one owner to another */
	function transferOwnership(address newOwner) public {
		
	}


	/* @dev Creates a new ballot and pushes it into the global array called ballots.
	@param proposalNames array with proposalnames 
	*/
	function createBallot(string _ballotName, uint[] proposalNames) public returns(bool succes) {
		require(msg.sender == chairPerson, "You cant create a ballot");
		

		ballots[numBallots].name = _ballotName;
		ballots[numBallots].ID = numBallots;

		for (uint i = 0; i < proposalNames.length; i++) {
			ballots[numBallots].proposals[i].name = proposalNames[i];
			ballots[numBallots].proposals[i].ID = i;
		}

		ballots[numBallots].numProposals = proposalNames.length;
		numBallots ++;
		return true;
	}
	
	
	
	/* 
	@dev Votes for a proposal in a given ballot
	@param ballotID The id of the ballot we are voting on
	@param proposalID The id of the proposal we are voting on
	*/
	function vote(uint ballotID, uint proposalID) public returns(bool succes){
	    require(ballots[ballotID].ID == ballotID, "No such ballots exist");
	    require(ballots[ballotID].proposals[proposalID].ID == proposalID, "No such proposal Exists");
		require(members[msg.sender].weight > 0, "You dont have the right to vote!");
	    require(members[msg.sender].voted[ballotID] == false, "Already voted in this ballot");
	    
	    ballots[ballotID].proposals[proposalID].voteCount += members[msg.sender].weight;
	    members[msg.sender].voted[ballotID] = true;
	    
	    return true;
	}

	/* @dev Let's a member delegates it's shares in a certain ballot to another
	member.
	@param ballotID The ID of the ballot in which it wants to delegate.
	@param to The adress of the person it wants to delegate to.
	*/
	function delegateTo(uint ballotID, address to) public {
	
	}

	/* @dev Calls the ballot to retrieve the winner and sets in motion the transaction
	associated with the winning proposal.
	@param ballotID The id of the associated
	*/
	function getWinner(uint ballotID) public view returns (uint winningProposal){
 		bool flag;
 		uint winningVoteCount = 0;
        for (uint p = 0; p < ballots[ballotID].numProposals; p++) {
            if (ballots[ballotID].proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = ballots[ballotID].proposals[p].voteCount;
                winningProposal = p;
                flag = false;
            }
            else if (ballots[ballotID].proposals[p].voteCount == winningVoteCount){
            	flag = true;
            }
        }
        if (flag == true){
        	winningProposal =  999; 
        }
	}

	/* test help functions */

	/*
	@ dev Returns the ID of the winning proposal as a string
	@ param ballotID ID of the Ballot
	@ returns @winningProposal Name of the winning proposal
	*/
	//function getWinnerString(uint ballotID) public view returns (string winningProposal){
	//	winningProposal = getWinner(ballotID);
	//}

	/* @dev Returns the number of addresses with voting rights
	@returns numAdd_ Number of addresses
	*/
	function getNumAddresses()  public view returns (uint numAdd_) {
		numAdd_ = addressesList.length;
	}


	/* @dev Returns the name of the ballot at a certain index
	@param _ballotIndex Index of the ballot
	@returns name_ Name of ballot
	*/
	function getBallotName(uint _ballotID)  view public returns (string name_){
		name_ = ballots[_ballotID].name;
	}
	
	/* @dev Returns the address and weight of a member
	@param _num Index (member number)
    @returns address_ Address of the member
    @returns weight_ Weight of the member
    */
	function getAddressWeight(uint _num) view public returns (address address_, uint weight_){
		address_ = addressesList[_num];
		weight_ = weights[_num];
	}
	
	/* @dev Returns the number of proposals for a certain ballot  
	@param _ballotId Id of the ballot
	*/
	function getNumProposals(uint _ballotID) view public returns(uint numProps_){
		numProps_ = ballots[_ballotID].numProposals;
	}

	/* @dev returns a tuple of propsal and votes corresponding to a certain
	proposal.
	@param _ballotId Id of the ballot
	@param _propId Id of the proposal
	@returns name Name of the proposal
	@returns votecount the number of votes on this proposal
	*/
	function getProposal(uint _ballotID, uint _propID) view public returns (uint name_,uint voteCount_){
		name_ = ballots[_ballotID].proposals[_propID].name;
		voteCount_ = ballots[_ballotID].proposals[_propID].voteCount;
	}

	function proposalExists(uint ballotID, uint proposalID) view public returns (bool x) {
		x = (ballots[ballotID].proposals[proposalID].ID == proposalID);

	}

	function ballotExists(uint ballotID) view public returns (bool x) {
		x = (ballots[ballotID].ID == ballotID);

	}
}
