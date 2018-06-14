# Housing Coop contract
This repository offers a package with a smart contract for housing coops along with the tools necessary to run your local blockchain and 
deploy the contract on it. In this project we followed the following instructions from Dappuniversity (http://www.dappuniversity.com/). 



Follow the steps below to download, install, and run this project. This is a brief guide to how to deploy the contract on a local test network and how to set up this network. This guide requires that the user uses Google chrome as its browser. 
## Step 0 
Download this repository.
## Step 1 
Start of by installing nodejs (\url{https://nodejs.org/en/})
## Step 2 
Install Truffle (\url{http://truffleframework.com/}) by typing \textit{npm install -g truffle} into your terminal
## Step 3 
Install Metamask as a Chrome extension (\url{https://metamask.io/})
## Step 4 
Start up Ganache, you will now have a local blockchain running on your computer.
## Step 5 
Open up the terminal and upen up the \text{election} directory and type in \textit{npm install}.
## Step 6 
Then type in \textit{truffle migrate --reset}
## Step 7 
Type \textit{npm run dev} into the terminal
## Step 8 
Open up Chrome and type localhost:3000 into the address field.

In order to make transactions on this local network we need to add the accounts to Metamask and connect Metamask to the local network. 

## Step 10 
Press the Metamask icon in the upper right corner of your browser and create an account. If you intend to use your account in the future, save the seed phrase.
## Step 11 
Go to Ganache and get the port you are running on by taking the digits after the last colon of the address under "RPC SERVER" (e.g. HTTP://127.0.0.1:7545 => port is 7545). 
## Step 12 
Press the Metamask icon, press the "main network" text and press "Custom RPC".
## Step 13 
In the field titled "New RPC URL" write \url{HTTP://localhost:PORT} where PORT are the digits obtained earlier and press save.

Now we just need to add the accounts on the local blockchain into Metamask.
## Step 14 
Open up Ganache. Next to each account there is a "key" symbol. Press this key symbol and copy the private key.
## Step 15 
Press the Metamask icon, press the account symbol in the upper right corner and finally press "import account".
## Step 16
Paste the private key and press "Import".

For further instructions, visit Dappuniversity (http://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial/?ref=dappnews).
