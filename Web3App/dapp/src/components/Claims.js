import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress, claimsContractABI, claimsContractAddress } from "../contractConfig";  // Import ABI and addresses

const Claims = () => {
  const [claim, setClaim] = useState(null);  // State to store claim details
  const [loading, setLoading] = useState(true);  // State for loading status
  const [error, setError] = useState("");  // State for error handling
  const [claimAmount, setClaimAmount] = useState("");  // State to store the claim amount input
  const [isOwner, setIsOwner] = useState(false);  // State to check if the user is the contract owner

  // Function to check claim status (via Claims contract) and owner status (via Insurance contract)
  const fetchClaimStatus = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (!ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Connect to the Claims contract to fetch claim status
      const claimsContract = new ethers.Contract(claimsContractAddress, claimsContractABI, signer);
      const claimData = await claimsContract.claims(userAddress);

      // Set the claim state with the fetched data
      setClaim({
        amount: ethers.formatEther(claimData.amount),  // Convert claim amount from Wei to ETH
        isApproved: claimData.isApproved,
        isSubmitted: claimData.isSubmitted,
      });

      // Connect to the Insurance contract to check if the user is the owner
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);
      const ownerAddress = await insuranceContract.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
    } catch (error) {
      console.error("Error fetching claim data", error);
      setError("Failed to retrieve claim status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to submit a claim (through Insurance contract)
  const handleSubmitClaim = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      console.log("Amount:", ethers.parseEther(claimAmount.toString()));

      // Connect to the Insurance contract and submit the claim
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);
      const transaction = await insuranceContract.submitClaim(ethers.parseEther(claimAmount.toString()));  // Convert claim amount to Wei
      await transaction.wait();

      alert("Claim submitted successfully!");
      setClaim({
        amount: ethers.parseEther(claimAmount.toString()),
        isApproved: false,
        isSubmitted: true,
      });
    } catch (error) {
      console.error("Error submitting claim", error);
      setError("Failed to submit claim. Please try again.");
    }
  };

  useEffect(() => {
    fetchClaimStatus();
  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container alert alert-danger">{error}</div>;
  }

  // If user does not have a submitted claim, show claim submission form
  if (!claim || !claim.isSubmitted) {
    return (
      <div className="container mt-5">
        <h1>Submit a Claim</h1>
        <div className="mb-3">
          <label htmlFor="claimAmount" className="form-label">Claim Amount (ETH)</label>
          <input
            type="text"
            className="form-control"
            id="claimAmount"
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSubmitClaim}>
          Submit Claim
        </button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    );
  }

  // If user has submitted a claim, show the claim status
  if (claim && claim.isSubmitted) {
    return (
      <div className="container mt-5">
        <h1>Claim Status</h1>
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Claim Details</h5>
            <p className="card-text">Amount: {claim.amount} ETH</p>
            <p className="card-text">
              Status: {claim.isApproved ? "Approved" : "Pending"}
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    );
  }

  return null;
};

export default Claims;
