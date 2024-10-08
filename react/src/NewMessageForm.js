import React, { useState } from 'react';
import ImagePreview from './ImagePreview'; // Assuming ImagePreview is already implemented

const NewMessageForm = ({ onSubmit }) => {
  const [messageText, setMessageText] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleTextChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
    });

    Promise.all(imagePreviews).then((imageUrls) => {
      setUploadedImages([...uploadedImages, ...imageUrls]);
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() || uploadedImages.length > 0) {
      onSubmit({ messageText, images: uploadedImages });
      setMessageText('');
      setUploadedImages([]);
    }
  };

  return (
    <form className="new-message-form" onSubmit={handleSubmit}>
      <textarea
        className="message-text"
        value={messageText}
        onChange={handleTextChange}
        placeholder="Type your message here..."
        rows={4}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <div className="image-preview-container">
        {uploadedImages.map((image, index) => (
          <ImagePreview
            key={index}
            url={image}
            onRemove={() => handleRemoveImage(index)}
          />
        ))}
      </div>
      <button type="submit" className="submit-button">
        Send Message
      </button>
    </form>
  );
};

export default NewMessageForm;
