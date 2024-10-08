import React, { useState } from 'react';
import { useSubmit } from 'react-router-dom';
import ProgressBar from './ProgressBar'; // Import ProgressBar component

const PersonDisplay = ({ person, onGenerate, onStartChat }) => {
  const { name, avatar, age, language, education, pictures, tweets, system_prompt, generating } = person;
  
  const [showPopup, setShowPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [promptVisible, setPromptVisible] = useState(Boolean(system_prompt));
  const submit = useSubmit();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      setSelectedImage(null);
    }, 300);
  };

  const handleGenerateClick = () => {
    if (!generating) {
      onGenerate(person);
      setPromptVisible(true);
      console.log("about to submit!")
    }
  };

  return (
    <div className="person-display">
      <div className="name-header">
        <h1>{name}</h1>
      </div>

      <div className="info-container">
        {avatar ? (
          <img src={avatar} alt="avatar" className="avatar" />
        ) : (
          <p>No avatar provided</p>
        )}

        <div className="person-info">
          <p><strong>Age:</strong> {age}</p>
          <p><strong>Language:</strong> {language}</p>
          <p><strong>Education:</strong> {education}</p>
        </div>
      </div>

      <h2>Pictures</h2>
      {pictures && pictures.length > 0 ? (
        <div className="pictures-grid">
          {pictures.map((picture, index) => (
            <img
              key={index}
              src={picture}
              alt={`picture-${index}`}
              className="picture-item"
              onClick={() => handleImageClick(picture)}
            />
          ))}
        </div>
      ) : (
        <p>No pictures provided</p>
      )}

      <h2>Tweets</h2>
      {tweets && tweets.length > 0 ? (
        tweets.map((tweet) => (
          <div className="tweet" key={tweet.id}>
            <div className="tweet-body">{tweet.text}</div>
          </div>
        ))
      ) : (
        <p>No tweets provided</p>
      )}

      {system_prompt && (
        <div className="system-prompt-container">
          <textarea
            className="system-prompt"
            value={system_prompt}
            readOnly
            rows={5}
          />
        </div>
      )}

      {/* Disable button if generating is true */}
      <button
        className="generate-button"
        onClick={handleGenerateClick}
        disabled={generating}
      >
        {system_prompt ? 'Regenerate' : 'Generate system prompt'}
      </button>
      {system_prompt && (
        <button className="generate-button ms-2" onClick={() => onStartChat(system_prompt)}>Start new chat</button>
      )}

      {/* Display ProgressBar when generating is true */}
      {generating && <ProgressBar />}

      {selectedImage && (
        <div className={`popup ${showPopup ? 'show' : ''}`}>
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}></button>
            <img src={selectedImage} alt="full-size" className="full-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonDisplay;
