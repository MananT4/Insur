import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import GetQuote from './components/GetQuote';
import CheckPolicyStatus from './components/CheckPolicyStatus';
import Withdraw from './components/Withdraw';
import Claims from './components/Claims';
import OwnerClaims from "./components/OwnerClaims";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-quote" element={<GetQuote />} />
        <Route path="/check-policy-status" element={<CheckPolicyStatus />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/owner-claims" element={<OwnerClaims />} />
      </Routes>
    </Router>
  );
}

export default App;
