import React from 'react';
import './ProgressBar.css'; // Import CSS for the progress bar

const ProgressBar = () => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-slider"></div>
      </div>
    </div>
  );
};

export default ProgressBar;
