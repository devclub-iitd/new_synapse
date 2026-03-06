import React from 'react';

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--brand-primary)' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;