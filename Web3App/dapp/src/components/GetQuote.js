import React, { useState } from 'react';
import { getPremiumFromOracle } from '../oracleService'; // Import the oracle service function
import { ethers } from "ethers";
import { contractABI, contractAddress } from '../contractConfig';

const GetQuote = () => {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [children, setChildren] = useState('');
  const [bmi, setBmi] = useState('');
  const [smoker, setSmoker] = useState('');
  const [premium, setPremium] = useState(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      age: age.toString(),
      sex: sex.toString(),
      children: children.toString(),
      bmi: bmi.toString(),
      smoker: smoker.toString(),
    };

    try {
      const predictedPremium = await getPremiumFromOracle(userData);
      setPremium(predictedPremium);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBuy = async () => {
    try {
      setBuying(true);
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Ethereum object not found!");
        setError("MetaMask not detected. Please install MetaMask.");
        return;
      }

      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner(); // Get the logged-in MetaMask account

      // Create a contract instance
      const insuranceContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Interact with the smart contract to purchase the policy
      const transaction = await insuranceContract.purchasePolicy(
        365 * 24 * 60 * 60,  // 365 days in seconds (policy duration)
        {
          value: ethers.parseEther(premium.toString()),  // Use the premium returned from the AI host in ETH
        }
      );

      await transaction.wait();  // Wait for the transaction to be mined
      alert("Policy successfully purchased!");
    } catch (error) {
      console.error("Error purchasing policy", error);
      setError("Transaction failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Get Your Insurance Quote</h1>
      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Age</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label>Sex</label>
              <select
                className="form-control"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label>Number of Children</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter number of children"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label>BMI</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Enter your BMI"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label>Smoker</label>
            <select
              className="form-control"
              value={smoker}
              onChange={(e) => setSmoker(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Get Premium
          </button>
        </form>

        {premium !== null && (
        <div>
          <h3>Premium: {premium} ETH</h3>
          <button onClick={handleBuy} disabled={buying} className="btn btn-primary btn-block">
            {buying ? "Processing..." : "Buy Policy"}
          </button>
        </div>
      )}
       {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default GetQuote;
