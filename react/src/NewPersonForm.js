import React, { useState } from 'react';
import ImagePreview from './ImagePreview'; // Import ImagePreview component
import TweetInput from './TweetInput'; // Import the new TweetInput component

const NewPersonForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    id: Math.floor(Math.random() * 10000), // Random id
    name: '',
    age: '',
    language: 'English',
    education: '',
    tweets: [],
    avatar: null,
    pictures: [],
  });

  // Handle input changes for basic fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle avatar upload and convert to data URI
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result, // Set avatar to data URI
      }));
    };

    if (file) {
      reader.readAsDataURL(file); // Convert image to data URI
    }
  };

  // Handle adding pictures and convert to data URI
  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file); // Convert image to data URI
      });
    });

    Promise.all(readers).then((dataURIs) => {
      setFormData((prev) => ({
        ...prev,
        pictures: [...prev.pictures, ...dataURIs], // Add the data URIs to pictures
      }));
    });
  };

  // Handle adding a new tweet
  const addTweet = () => {
    setFormData((prev) => ({
      ...prev,
      tweets: [...prev.tweets, { text: '', collapsed: true, id: prev.tweets.length + 1 }],
    }));
  };

  // Handle removing a tweet
  const removeTweet = (id) => {
    setFormData((prev) => ({
      ...prev,
      tweets: prev.tweets.filter((tweet) => tweet.id !== id),
    }));
  };

  // Handle tweet text change
  const handleTweetChange = (id, value) => {
    const updatedTweets = formData.tweets.map((tweet) =>
      tweet.id === id ? { ...tweet, text: value } : tweet
    );
    setFormData((prev) => ({
      ...prev,
      tweets: updatedTweets,
    }));
  };

  // Handle removing a picture
  const removePicture = (index) => {
    setFormData((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  // Handle removing avatar
  const removeAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Call parent component's onSubmit method
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Language:</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
          >
            <option value="English">English</option>
            <option value="Japanese">Japanese</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>

        <div>
          <label>Education:</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Avatar:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          {formData.avatar && (
            <ImagePreview url={formData.avatar} onRemove={removeAvatar} />
          )}
        </div>

        <div>
          <label>Tweets:</label>
          {formData.tweets.map((tweet) => (
            <TweetInput 
              key={tweet.id} 
              tweet={tweet} 
              onChange={handleTweetChange} 
              onRemove={() => removeTweet(tweet.id)} 
            />
          ))}
          <button type="button" onClick={addTweet} className="add-tweet-button">
            Add Tweet
          </button>
        </div>

        <div>
          <label>Pictures:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePicturesChange}
          />
          {formData.pictures.length > 0 && (
            <div className="pictures-container">
              {formData.pictures.map((pic, index) => (
                <ImagePreview key={index} url={pic} onRemove={() => removePicture(index)} />
              ))}
            </div>
          )}
        </div>

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default NewPersonForm;
