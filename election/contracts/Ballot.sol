pragma solidity ^0.4.19;

/**
 * The Ballot contract does this and that...
 */
contract Ballot {
	uint startTime;
	uint durationTime;
	address addressBRF;
	mapping (address => int) voteRights;
	string public name;

	modifier onlyBRF {
		require(msg.sender == addressBRF, "Only creating BRF can call this function");
		_;		
	}

	struct Proposal {
		int name;
		uint voteCount;
		//hash = "qe23rs!"
	}

	Proposal[] public proposals;

	/* Removed duration as input */
	constructor (string _name, address[] adds, int[] proposalNames) public {
		name = _name; 
		addressBRF = msg.sender;
		//durationTime = duration;
		//startTime = now; 
		for (uint i = 0; i < adds.length; i++) {
			voteRights[adds[i]] = -1;
		}

		for (i = 0; i < proposalNames.length; i++) {
			proposals.push(Proposal({
				name: proposalNames[i],
				voteCount: 0
				}));
		}
 	}	

	/* This function takes as input the ID of a proposal and the weight of the voter. The function first
	checks that messager has a voting right (-1) and that it hasn't already voted (0). If the voter has been 
	delegated another voters votes, the function will add these weights to the voters. Check that the ballot is
	still live.
	@param proposalID id of proposal you want to vote for
	@param weight Weight of your vote.
	*/
 	function vote (uint proposalID, uint weight, address voterAddress) public onlyBRF {
 		require(voteRights[voterAddress] != 0, "You dont have the right to vote");
 		//require(now < startTime + durationTime, "Ballot is not live anymore");
 		if (voteRights[voterAddress] > 0) {
 			proposals[proposalID].voteCount += weight + uint(voteRights[voterAddress]);
 		} else {
 			proposals[proposalID].voteCount += weight;
 		}
 		voteRights[voterAddress] = 0;
 	}
 	
 	/* @dev This function let's a voter delegates its votes to another voter. The requirement being that
 	the delegater and the delegatee hasn't voted already and that the delegatee hasn't been delegated to by another
 	member. Check that the ballot is
	still live.
 	@param weight of the delegator
 	@param address of the delegatee
 	*/
 	function delegate (uint weight, address to, address from) public onlyBRF{
 		require(voteRights[from] == -1, "You are not allowed to delegate");
 		require(voteRights[to] == -1, "The delegatee is not eligable for a delegation");
 		require(to != from, "You cannot delegate to yourself");
 		voteRights[to] = int(weight);
 		voteRights[from] = 0;
 	}
 	
 	/* @dev Computes the winning proposal by counting all previous votes. */
 	function winningProposalID () private view returns(uint proposalID_) {
 		//require(now > durationTime + startTime, "Ballot has not ended");
 		uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length-1; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                proposalID_ = p;
            }
        }
 	}
 	
 	/* @dev If the current time is past the final voting time then this function
 	will retrieve the name of the winning proposal and send it back to the caller. If
 	the proposal involves a payment then the corresponding transaction to the winner will be
 	executed. */ 		
	function winnerName() public view
            returns (int winnerName_)
    {
    	//require(now - startTime > durationTime, "Vote not yet ended.");
        winnerName_ = proposals[winningProposalID()].name;
    }

}

												