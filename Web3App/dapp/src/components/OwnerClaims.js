import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress, claimsContractABI, claimsContractAddress } from "../contractConfig";  // Import ABI and addresses

const OwnerClaims = () => {
  const [claims, setClaims] = useState([]);  // Store all claims
  const [isOwner, setIsOwner] = useState(false);  // Check if the user is the owner
  const [loading, setLoading] = useState(true);  // Handle loading state
  const [error, setError] = useState("");  // Handle errors

  // Function to check if the user is the contract owner
  const checkIfOwner = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Connect to the Insurance contract and check if the user is the owner
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);
      const ownerAddress = await insuranceContract.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
    } catch (error) {
      console.error("Error checking owner status", error);
      setError("Failed to verify owner status.");
    }
  };

  // Fetch all claims from the Claims contract using the modified contract
  const fetchClaims = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Connect to the Claims contract
      const claimsContract = new ethers.Contract(claimsContractAddress, claimsContractABI, signer);

      const totalClaimants = await claimsContract.getTotalClaimants();  // Fetch total number of claimants
      const claimsList = [];

      // Loop through the claimants and fetch each claim
      for (let i = 0; i < totalClaimants; i++) {
        const claimantAddress = await claimsContract.getClaimantByIndex(i);
        const claimData = await claimsContract.claims(claimantAddress);
        
        console.log(`Claim Amount for ${claimantAddress}:`, claimData.amount.toString());
        console.log(`Claim Status for ${claimantAddress}:`, claimData.isApproved);
        console.log(`Claim Submitted for ${claimantAddress}:`, claimData.isSubmitted);

        claimsList.push({
          address: claimantAddress,
          amount: ethers.formatEther(claimData.amount),
          isApproved: claimData.isApproved,
          isSubmitted: claimData.isSubmitted,
        });
      }

      setClaims(claimsList);
    } catch (error) {
      console.error("Error fetching claims", error);
      setError("Failed to retrieve claims.");
    } finally {
      setLoading(false);
    }
  };

  // Function to approve or reject a claim
  const handleProcessClaim = async (claimant, approve) => {
    try {
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Connect to the Insurance contract and process the claim
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);
      const transaction = await insuranceContract.processClaim(claimant, approve);
      await transaction.wait();

      alert(approve ? "Claim Approved!" : "Claim Rejected");

      // Refresh the list of claims after processing
      fetchClaims();
    } catch (error) {
      console.error("Error processing claim", error);
      setError("Failed to process claim. Please try again.");
    }
  };

  useEffect(() => {
    checkIfOwner();
    if (isOwner) {
      fetchClaims();
    }
  }, [isOwner]);

  if (!isOwner) {
    return <div className="container">You are not authorized to view this page.</div>;
  }

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>All Claims</h1>
      {claims.length === 0 ? (
        <p>No claims found.</p>
      ) : (
        claims.map((claim, index) => (
          <div className="card mb-3" key={index}>
            <div className="card-body">
              <h5 className="card-title">Claim by: {claim.address}</h5>
              <p className="card-text">Amount: {claim.amount} ETH</p>
              <p className="card-text">Status: {claim.isApproved ? "Approved" : "Pending"}</p>

             {/* Log the status of each claim */}
             {console.log(`Claim ${index}: isApproved=${claim.isApproved}, isSubmitted=${claim.isSubmitted}`)}

              {/* If the claim is pending, show Approve and Reject buttons */}
              {!claim.isApproved && claim.isSubmitted && (
                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleProcessClaim(claim.address, true)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleProcessClaim(claim.address, false)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OwnerClaims;
