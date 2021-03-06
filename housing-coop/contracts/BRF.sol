pragma solidity ^0.4.19;

/**
 * Written April-May 2018
 * The BRF contract represents a housing co-op (Swedish Bostadsrattsförening (BRF)) and
 * intends to simulate the voting process of such a co-op with the adding of ballots, 
 * proposals and new members.
 * 
 */
contract BRF {

    // deposit event
    event depositEvent (
    	address sender,
    	uint value
    );

	mapping (address => Member) private members;
	address[] private addressesList;
	uint[] private weights;
	address public chairPerson;
	uint public sumWeights;
	string public brfName;
	uint public numBallots;
	mapping (uint => Ballot) ballots;
	
	// Struct containing information of each member
	struct Member {
        uint weight; // weight is accumulated by delegation
        mapping(uint => bool) voted;  // if true, that person already voted in this ballot
		mapping(uint => uint) vote;        
    }

    // Struct containing information of each proposal
	struct Proposal {
		uint name;
		uint ID;
		uint voteCount;
	}

	// Struct containing information of each Ballot
	struct Ballot {
		uint ID;
		string name;
		uint numProposals;
		mapping(uint => Proposal) proposals;
		mapping(address => uint) delegate; 
		address[] targetAddresses;
		int flag;
		uint[] targetValues;
		uint sumVoteCount;
	}

    /* @dev Constructor for BRF. Sets the caller address to be the co-ops chairperson 
    * and other initial values.
    */
	constructor () public{
		numBallots = 0;
		chairPerson = msg.sender;
		sumWeights = 0;
		brfName = "BRF Blockkedjan";
		giveRightToVote(10, msg.sender);
	}

	/* 
	* @dev Deposits payable into the contract with which payments on behalf of the co-op 
	* can be made.
	* Emits depositEvent
	*/
	function deposit() public payable {
    	emit depositEvent(msg.sender, msg.value);
    }

	/* @dev Gives voting rights with a certain weight to an address so that account 
	* can vote in future ballots. Function can only be called from within the contract.
	* @param weight The weight to be assigned to the address
	* @param newAdd Address that is to be given voting rights
	* @returns success Returns if function is successful 
	*/
	function giveRightToVote(uint weight, address newAdd) internal returns(bool success){
		require(weight > 0, "Cannot assign nonpositive values to our weights. revert");
        require(members[newAdd].weight == 0, "The address already has voting rights.");
		members[newAdd].weight = weight;
		sumWeights += weight;
		addressesList.push(newAdd);
		weights.push(weight);
		return true;
	}

	/* @dev Creates a new ballot and pushes it into the global array called ballots. When creating a ballot
	* regarding the addition of a member, the _flag is set to 1. Then the proposal 1 indicates a yesvote. 
	* If _flag i set to 2 the ballot is to send a transaction to the winning proposal address. If 
	* _flag is anything else nothing in particular is to be done when there is a winning proposal.
	* @param _ballotName Name of ballot created
	* @param _proposalNames Array with names (ints) of created proposals
	* @param _flag Flag saying what type of ballot it is.
	* @param _targetAddresses Array of addresses targeted by the ballot. In case of giving new vote rights
	* it contains the address to be given voting rights. In the case of sending a transaction it contains
	* the different recipients of the resulting transaction.
	* @param _targetValues The target value of the ballot. In case of giving new vote rights it is the new
	* weights to be assigned to the address. In the case of sending a transaction it contains the sum to be 
	* sent to the winning proposal.
	* @returns success Returns whether the function was successfuly executed.
	*/
	function createBallot(string _ballotName, uint[] _proposalNames, int _flag, address[] _targetAddresses, uint[] _targetValues) public returns(bool succes) {
		require(msg.sender == chairPerson, "You cant create a ballot");	
		if(_flag == 2){
			for(uint i = 0; i<_targetValues.length; i++){
				require (getBalance() > _targetValues[i], "Not enough ether on the contract");
			}
		}
		ballots[numBallots].sumVoteCount = 0;
		ballots[numBallots].name = _ballotName;
		ballots[numBallots].ID = numBallots;
		ballots[numBallots].flag = _flag;
		ballots[numBallots].targetValues = _targetValues;
		ballots[numBallots].targetAddresses = _targetAddresses;
		for (i = 0; i < _proposalNames.length; i++) {
			ballots[numBallots].proposals[i].name = _proposalNames[i];
			ballots[numBallots].proposals[i].ID = i;
		}
		ballots[numBallots].numProposals = _proposalNames.length;
		numBallots ++;
		return true;
	}
	
	/* @dev Votes for a proposal in a given ballot
	* @param ballotID The id of the ballot we are voting on
	* @param proposalID The id of the proposal we are voting on
	* @returns success Returns whether the function was successfuly executed.
	*/
	function vote(uint ballotID, uint proposalID) public returns(bool success){
	    require(ballots[ballotID].ID == ballotID, "No such ballots exist");
	    require(ballots[ballotID].proposals[proposalID].ID == proposalID, "No such proposal Exists");
		require(members[msg.sender].weight > 0, "You dont have the right to vote!");
	    require(members[msg.sender].voted[ballotID] != true, "Already voted in this ballot");
	    require (ballots[ballotID].flag != 20, "Ballot is not live");
	    
	    ballots[ballotID].proposals[proposalID].voteCount += members[msg.sender].weight+ballots[ballotID].delegate[msg.sender];
	    ballots[ballotID].sumVoteCount += members[msg.sender].weight+ballots[ballotID].delegate[msg.sender];
	    members[msg.sender].voted[ballotID] = true;
	    members[msg.sender].vote[ballotID] = proposalID;
	    // If ballot is meant to give voting rights to a new member, check if the result is 
	    // yes then call giveRightToVote() with the desired information;
	    if (ballots[ballotID].flag == 1 && getWinner(ballotID)==1) {
	    	ballots[ballotID].flag = 20;
	    	return giveRightToVote(ballots[ballotID].targetValues[0], ballots[ballotID].targetAddresses[0]);
	    } 
	    // Else if ballot is meant to send transaction to a target address, send to the winning proposal
	    else {
	    	uint l = getWinner(ballotID);
	    	if (ballots[ballotID].flag == 2 && l != 888 && l != 999) {
		    	ballots[ballotID].targetAddresses[l].transfer(ballots[ballotID].targetValues[l]);
		    	ballots[ballotID].flag = 20;
		    }
	    }
	    return true;
	}

	/* @dev Let's a member delegates it's shares in a certain ballot to another
	* member.
	* @param ballotID The ID of the ballot in which it wants to delegate.
	* @param to The adress of the person it wants to delegate to.
	* @returns success Returns whether the function was successfuly executed.
	*/
	function delegateTo(uint ballotID, address to) public returns(bool success){
		require(ballots[ballotID].ID == ballotID, "No such ballots exist");
		require(members[msg.sender].voted[ballotID] != true, "You have already used up your votes");
		require(ballots[ballotID].delegate[to] == 0, "To delegatee has already been delegated to");
		require(ballots[ballotID].delegate[msg.sender] == 0, "To delegator has already been delegated to");
		require(to!=msg.sender);
		
		members[msg.sender].voted[ballotID] = true;
		ballots[ballotID].delegate[to] = members[msg.sender].weight;
		if (members[to].voted[ballotID] == true) {
			ballots[ballotID].proposals[members[to].vote[ballotID]].voteCount += members[msg.sender].weight;
		}
		return true;
	}

	/* @dev Calls the ballot to retrieve the winning proposal id.
	* @param ballotID The id of the associated
	* @returns winningProposal The id (or index) of the winning proposal if the ballot can be called. Returns 
	* 999 if there is a draw or 888 if it's too close to call.
	*/
	function getWinner(uint ballotID) public view returns (uint winningProposal){
 		bool flag;
 		uint winningVoteCount = 0;
 		uint secondPlaceID = 0;
 		winningProposal = 99;
        for (uint p = 0; p < ballots[ballotID].numProposals; p++) {
            if (ballots[ballotID].proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = ballots[ballotID].proposals[p].voteCount;
                secondPlaceID = winningProposal;
                winningProposal = p;
                flag = false;
            }
            else if (ballots[ballotID].proposals[p].voteCount == winningVoteCount){
            	flag = true;
            	secondPlaceID = p;
            }
            else if (ballots[ballotID].proposals[p].voteCount > ballots[ballotID].proposals[secondPlaceID].voteCount){
            	secondPlaceID = p;	
            }
        }

        if (flag == true){
        	winningProposal =  999; 
        }
        else if (winningVoteCount-ballots[ballotID].proposals[secondPlaceID].voteCount>(sumWeights - ballots[ballotID].sumVoteCount)){
        	return winningProposal;
        }
        else {
        	return 888;
        }
	}

	
	/* test and help functions */

	/* @dev Returns the number of addresses with voting rights
	* @returns numAdd_ Number of addresses
	*/
	function getNumAddresses()  public view returns (uint numAdd_) {
		numAdd_ = addressesList.length;
	}

	/* @dev Returns the name of the ballot at a certain index
	* @param _ballotIndex Index of the ballot
	* @returns name_ Name of ballot
	*/
	function getBallotName(uint _ballotID)  view public returns (string name_){
		name_ = ballots[_ballotID].name;
	}
	
	/* @dev Returns the address and weight of a member
	* @param _num Index (member number)
    * @returns address_ Address of the member
    * @returns weight_ Weight of the member
    */
	function getAddressWeight(uint _num) view public returns (address address_, uint weight_){
		address_ = addressesList[_num];
		weight_ = weights[_num];
	}
	
	/* @dev Returns the number of proposals for a certain ballot  
	* @param _ballotId Id of the ballot
	*/
	function getNumProposals(uint _ballotID) view public returns(uint numProps_){
		numProps_ = ballots[_ballotID].numProposals;
	}

	/* @dev Function that returns name of propsal and voteCount corresponding to a certain
	proposalID.
	* @param _ballotId Id of the ballot
	* @param _propId Id of the proposal
	* @returns name Name of the proposal
	* @returns votecount the number of votes on this proposal
	*/
	function getProposal(uint _ballotID, uint _propID) view public returns (uint name_,uint voteCount_){
		name_ = ballots[_ballotID].proposals[_propID].name;
		voteCount_ = ballots[_ballotID].proposals[_propID].voteCount;
	}

	/* @dev Checks whether a proposal with a specific ID exists in the given ballot
	* @param _ballotId Id of the ballot
	* @param _propId Id of the proposal
	* @returns x Whether the proposal exists
	*/
	function proposalExists(uint _ballotID, uint _propID) view public returns (bool x) {
		x = (ballots[_ballotID].proposals[_propID].ID == _propID);
	}

	/* @dev Checks whether a Ballot with a specific ID exists
	* @param _ballotId Id of the ballot
	* @returns x Whether the Ballot exists
	*/
	function ballotExists(uint _ballotID) view public returns (bool x) {
		x = (ballots[_ballotID].ID == _ballotID);
	}

	/* @dev Checks how many weights have been delegated to the sender 
	* @param _ballotId Id of the ballot in question
	* @returns delegateWeight The weights that have been delegated to the sender 
	*/
	function myDelegates(uint _ballotID) view public returns (uint delegateWeight) {
		delegateWeight = ballots[_ballotID].delegate[msg.sender];
	}

	/* @dev Gets the balance of the BRF
	* @returns balance The balance of the BRF
	*/
	function getBalance() view public returns (uint balance){
		balance = address(this).balance;
	}

	/* @dev Returns the address  of a member at a certain index
	@param _num Index Index of address
    @returns address_ Address of the member
    */
	function getAddressAtIndex(uint _num) view public returns (address address_){
		address_ = addressesList[_num];
	}
}
