import React, { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";  // Import ABI and contract address

const CheckPolicyStatus = () => {
  const [policyStatus, setPolicyStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPolicyStatus = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Ethereum object not found!");
        setError("MetaMask not detected. Please install MetaMask.");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Connect to the contract
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the checkPolicyStatus function from the smart contract
      const [isActive, endDateBigInt] = await insuranceContract.checkPolicyStatus();

      // Convert the BigInt endDate to a number
      const endDate = Number(endDateBigInt);

      const statusMessage = isActive
        ? `Your policy is active and will expire on ${new Date(endDate * 1000).toLocaleDateString()}.`
        : "Your policy is not active or has expired.";

      setPolicyStatus(statusMessage);
      setError("");
    } catch (error) {
      console.error("Error checking policy status", error);
      setError("Failed to retrieve policy status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Check Policy Status</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary mb-3" onClick={checkPolicyStatus} disabled={loading}>
        {loading ? "Checking..." : "Check Status"}
      </button>

      {policyStatus && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Policy Status</h5>
            <p className="card-text">{policyStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckPolicyStatus;
