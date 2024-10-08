import React, { useState, useEffect } from 'react';


const TweetGallery = ({ tweets }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Change tweet every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Trigger fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tweets.length);
        setFade(true); // Trigger fade in
      }, 1500); // Delay for fade-out effect
    }, 3000);

    return () => clearInterval(interval);
  }, [tweets.length]);

  const currentTweet = tweets[currentIndex];

  return (
    <div className={`tweet-gallery ${fade ? 'fade-in' : 'fade-out'}`}>
      <div className="tweet">
        <div className="tweet-body">{currentTweet.text}</div>
      </div>
    </div>
  );
};


export default TweetGallery;
