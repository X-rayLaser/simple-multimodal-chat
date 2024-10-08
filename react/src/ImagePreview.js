import React from 'react';

const ImagePreview = ({ url, onRemove }) => {
  return (
    <div className="image-preview">
      <img src={url} alt="Preview" className="image-preview__img" />
      <button className="image-preview__remove-btn" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

export default ImagePreview;
