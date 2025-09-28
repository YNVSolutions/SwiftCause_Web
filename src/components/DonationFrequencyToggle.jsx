import React, { useState } from 'react';

const DonationFrequencyToggle = ({ onFrequencyChange }) => {
  const [frequency, setFrequency] = useState('one-time');

  const handleSelect = (next) => {
    if (next === frequency) return;
    setFrequency(next);
    if (typeof onFrequencyChange === 'function') {
      onFrequencyChange(next);
    }
  };

  const containerStyle = {
    display: 'inline-flex',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#ffffff',
  };

  const baseButtonStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    padding: '8px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 120ms ease, color 120ms ease',
    outline: 'none',
    lineHeight: 1.2,
    userSelect: 'none',
  };

  const inactiveStyle = {
    ...baseButtonStyle,
    background: 'transparent',
    color: '#111827',
  };

  const activeStyle = {
    ...baseButtonStyle,
    background: '#2563eb',
    color: '#ffffff',
  };

  const dividerStyle = {
    width: 1,
    background: '#d1d5db',
  };

  return (
    <div role="group" aria-label="Donation frequency" style={containerStyle}>
      <button
        type="button"
        aria-pressed={frequency === 'one-time'}
        onClick={() => handleSelect('one-time')}
        style={frequency === 'one-time' ? activeStyle : inactiveStyle}
      >
        One-Time
      </button>
      <div style={dividerStyle} />
      <button
        type="button"
        aria-pressed={frequency === 'monthly'}
        onClick={() => handleSelect('monthly')}
        style={frequency === 'monthly' ? activeStyle : inactiveStyle}
      >
        Monthly
      </button>
    </div>
  );
};

export default DonationFrequencyToggle;


