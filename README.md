Decentralized Insurance Platform with AI-Powered Risk Assessment

This project is a decentralized insurance platform built on the Ethereum blockchain, integrating AI for dynamic risk assessment to calculate user premiums. The platform uses smart contracts for automated policy management, with a secure oracle to bridge the AI model and the blockchain, ensuring seamless and reliable data integration. This proof-of-concept application demonstrates the potential of combining AI with decentralized technology to automate and enhance insurance processes.

Project Overview

The Decentralized Insurance Platform allows users to:

	1.	Enter personal and policy-related details through a React.js front end.
	2.	Receive a calculated premium based on real-time data via an AI model.
	3.	Interact with smart contracts to purchase and manage policies securely on the blockchain.

The project leverages:

	•	An AI model hosted on a Flask server to calculate premiums.
	•	A Node.js oracle to securely fetch and deliver off-chain data to the blockchain.
	•	Ethereum smart contracts to automate policy management, ensuring data integrity and transparency.

Features

	•	Decentralized Insurance: Users can obtain and manage insurance policies without intermediaries.
	•	AI-Powered Premium Calculation: Real-time risk assessment using an AI model to calculate accurate premiums.
	•	Smart Contracts: Automated, transparent policy handling on the Ethereum blockchain.
	•	Secure Oracle Integration: Node.js-based oracle fetches real-time premium data from the AI model to the smart contract.
	•	User-Friendly Interface: React.js front end for smooth and intuitive user interaction.

Technologies Used

	•	Blockchain: Ethereum, Solidity
	•	Frontend: React.js
	•	Backend: Node.js (Oracle), Flask (Python server for AI model)
	•	Machine Learning: AI model for premium calculation using Python
	•	Oracle: Node.js for secure, reliable data bridging

Architecture

	1.	Frontend (React.js): Users enter data and view calculated premiums.
	2.	AI Model (Flask server): Receives user data, processes it with machine learning, and returns a calculated premium.
	3.	Oracle (Node.js): Fetches data from the Flask server and delivers it securely to the Ethereum smart contracts.
	4.	Smart Contracts: Handle policy issuance and premium transactions, ensuring transparency and security.