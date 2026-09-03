import React from 'react';
import './App.css';

function GradientButton({ children = 'Button', onClick, className = '' }) {
  return (
    <button
      className={`gradient-button ${className}`}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
    </button>
  );
}

export default GradientButton;
