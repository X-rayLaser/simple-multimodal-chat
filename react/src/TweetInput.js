import React from 'react';

const TweetInput = ({ tweet, onChange, onRemove }) => {
  return (
    <div className="tweet-input">
      <textarea
        placeholder="Enter your tweet..."
        value={tweet.text}
        onChange={(e) => onChange(tweet.id, e.target.value)}
        rows="3" // Adjust rows for height
      />
      <button 
        type="button" 
        onClick={onRemove} 
        className="remove-button" // Apply common class for styling
      >
        Remove Tweet
      </button>
    </div>
  );
};

export default TweetInput;
