pragma solidity ^0.4.0;

contract Fund{
    
    address public creator;
    mapping (address => uint) public shares;
    uint public sum;
    Ballot private currentBallot;
    
    struct Shareholder {
        bool voted;
    }
    
    mapping (address => Shareholder) public shareholders;
    
    
    event newShareholder(address shareholder, uint amount);
    event shareholderPayout(address shareholder, uint amount);
    
    constructor() public{
        creator = msg.sender;
    }
    
    function buyIn() public payable{
        require(msg.value > 0, "Can't send negative amount you Dummy!");
        if (!(shares[msg.sender] > 0)) {
            emit newShareholder(msg.sender, msg.value);
            shareholders[msg.sender] = Shareholder({voted: false});
        }
        shares[msg.sender] += msg.value;
        sum += msg.value;
    }
    
    function getBalance() public view returns(uint) {
        return shares[msg.sender];
    }
    
    /// withdraws all
    function withdraw() public {
        withdrawal(shares[msg.sender]);
    }
    
    // withdraws specific amount
    function withdraw(uint amount) public {
        require(amount <= shares[msg.sender]);
        withdrawal(amount);
    }
    
    /// handles withdrawal
    function withdrawal(uint amount) internal {
        msg.sender.transfer(amount);
        shares[msg.sender] -= amount;
        emit shareholderPayout(msg.sender, amount);
        sum -= amount;
        if (sum == 0){
            selfdestruct(creator);
        }
    }
    
    function startVote(uint nProps) public{
        require(nProps > 0, "More proposals!");
        currentBallot = new Ballot();
        for (uint i = 0; i<nProps; i++){
            currentBallot.addProp(i);
        }
        currentBallot.setVoteCount(sum);
    }
    
    function vote(uint8 toProposal) public returns(uint){
        require(shareholders[msg.sender].voted == false, "You have already voted, Fool!");
        shareholders[msg.sender].voted = true;
        return currentBallot.vote(toProposal, shares[msg.sender]);
    }
}

    
contract Ballot{
    
    uint public totalVoteCount;
    uint public haveVoted;
    
    struct Prop {
        uint index;
        uint voteCount;
    }
    
    Prop[] proposals;
    
    function setVoteCount(uint newVotecount) external{
        totalVoteCount = newVotecount;
    }
    
    function addProp(uint propID) external{
        proposals.push(Prop({index: propID, voteCount: 0}));
    }
    
    function vote(uint8 toProposal, uint amount) external returns(uint){
        proposals[toProposal].voteCount += amount; 
        haveVoted += amount;
        if (proposals[toProposal].voteCount > (totalVoteCount/2)){
            return winningProposal();
        }
        else if (haveVoted==totalVoteCount) {
            return winningProposal();
        }
    }
    
    function winningProposal() internal view returns (uint8){
        uint8 winningProp;
        bool equalityFlag = false;
            for (uint8 i = 0; i < proposals.length; i++){
                if (proposals[i].voteCount>proposals[winningProp].voteCount){
                    winningProp = i;
                    equalityFlag = false;
                }
                else if(proposals[i].voteCount == proposals[winningProp].voteCount){
                    equalityFlag = true;
                }
            }
            require(equalityFlag == false, "It's a tie!");
            return winningProp;
    }
    
}