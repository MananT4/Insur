import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../contractConfig"; 

const Navbar = () => {
  const [isOwner, setIsOwner] = useState(false);

  const checkOwner = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
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
      }
    } catch (error) {
      console.error("Error checking owner status", error);
    }
  };

  useEffect(() => {
    checkOwner();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Insurance DApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/get-quote">
                Get Quote
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/check-policy-status">
                Check Policy Status
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/claims">Claims</Link>
            </li>
            {isOwner && (
              <>
            <li className="nav-item">
              <Link className="nav-link" to="/withdraw">Withdraw</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/owner-claims">Process Claims</Link> {/* New Link */}
          </li>
          </>
          )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
