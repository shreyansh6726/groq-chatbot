import React from 'react';
import './App.css';

function PearlButton({ children = 'About', onClick }) {
  return (
    <button className="pearl-button" type="button" onClick={onClick}>
      <div className="pearl-button-wrap">
        <p>
          <span>✧</span>
          <span>✦</span>
          {children}
        </p>
      </div>
    </button>
  );
}

export default PearlButton;
