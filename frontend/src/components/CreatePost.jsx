import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImage(response.data.imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content && !image) {
      alert('Please add some content or image to your post');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/posts', { content, image });
      onPostCreated(response.data);
      setContent('');
      setImage('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows="4"
          />
        </div>

        {image && (
          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <img
              src={image}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
            <button
              type="button"
              onClick={() => setImage('')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#e0245e',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="flex-between">
          <label
            className="btn btn-secondary btn-small"
            style={{ cursor: 'pointer' }}
          >
            {uploading ? 'Uploading...' : '📷 Add Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || uploading || (!content && !image)}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

