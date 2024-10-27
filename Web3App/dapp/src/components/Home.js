import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5">
      <h1>Welcome to the Insurance DApp</h1>
      <p>
        Our decentralized insurance platform allows you to calculate premiums quickly using a cutting-edge AI model.
        Get started by navigating to the "Get Quote" section and inputting your details.
      </p>
      <button className="btn btn-primary mt-3" onClick={() => window.location.href = '/get-quote'}>
        Get a Quote Now
      </button>
    </div>
  );
};

export default Home;
