pragma solidity ^0.4.19;



/**
 * The Ballot contract does this and that...
 */
contract Ballot {
	mapping (address => uint) voteRights;

	struct Proposal {
		bytes32 name;
		uint voteCount;
		//hash = "qe23rs!"
	}

	Proposal[] public proposals;

	function Ballot (address[] adds, bytes32[] proposalNames) {
		for (uint i = 0; i < adds.length; i++) {
			voteRights[adds[i]] = -1;
		}

		for (uint i = 0; i < proposalNames.length; i++) {
			proposals.push(Proposal({
				name: proposalNames[i],
				voteCount: 0
				}));
		}
 	}	

	/* This function takes as input the ID of a proposal and the weight of the voter. The function first
	checks that messager has a voting right (-1) and that it hasn't already voted (-2). If the voter has been 
	delegated another voters votes, the function will add these weights to the voters.
	@param proposalID id of proposal you want to vote for
	@param weight Weight of your vote.
	*/
 	function vote (uint proposalID, uint weight) {
 		
 	}
 	
 	/* @dev This function let's a voter delegates its votes to another voter. The requirement being that
 	the delegater and the delegatee hasn't voted already and that the delegatee hasn't been delegated to by another
 	member.
 	@param weight of the delegator
 	@param address of the delegatee
 	*/
 	function delegate (uint weight, address to) {
 		
 	}
 	
 	/* @dev Computes the winning proposal by counting all previous votes. */
 	function winningProposalID () returns(uint proposalID) {
 		int winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                proposalID = p;
            }
        }
 	}
 	
 	/* */ 		
	function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposalID()].name;
    }

}

												