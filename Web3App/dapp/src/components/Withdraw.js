import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig";  // Import ABI and contract address

const Withdraw = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkOwnerAndBalances = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Connect to the contract
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Check if the current account is the owner
      const ownerAddress = await insuranceContract.owner();
      if (userAddress.toLowerCase() === ownerAddress.toLowerCase()) {
        setIsOwner(true);

        // Get contract balance
        const balanceBigInt = await provider.getBalance(contractAddress);
        const balance = ethers.formatEther(balanceBigInt);
        setContractBalance(balance);

        // Get user balance
        const userBalanceBigInt = await provider.getBalance(userAddress);
        const userBalance = ethers.formatEther(userBalanceBigInt);
        setUserBalance(userBalance);
      } else {
        setIsOwner(false);
        setError("You are not the owner of this contract.");
      }
    } catch (error) {
      console.error("Error checking balances", error);
      setError("Failed to retrieve contract or user balance. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Connect to the contract
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the withdraw function
      const transaction = await insuranceContract.withdraw();
      await transaction.wait();

      alert("Withdraw successful!");
      // Refresh balances
      checkOwnerAndBalances();
    } catch (error) {
      console.error("Error during withdrawal", error);
      setError("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOwnerAndBalances();
  }, []);

  if (!isOwner) {
    return <div className="alert alert-danger">You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Withdraw Funds</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Contract Balance</h5>
          <p className="card-text">
            {contractBalance !== null ? `${contractBalance} ETH` : "Loading..."}
          </p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Your Balance</h5>
          <p className="card-text">
            {userBalance !== null ? `${userBalance} ETH` : "Loading..."}
          </p>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleWithdraw}
        disabled={loading || contractBalance === "0.0"}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
};

export default Withdraw;
