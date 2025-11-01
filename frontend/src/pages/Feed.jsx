import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      const updatedPost = response.data.post;
      
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comment`, {
        content: comment
      });
      
      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Loading posts...</h2>
      </div>
    );
  }

  return (
    <div>
      <nav style={{
        background: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#1da1f2', margin: 0 }}>Mini Twitter</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/profile/${user._id}`)}
              className="btn btn-secondary btn-small"
            >
              My Profile
            </button>
            <button
              onClick={logout}
              className="btn btn-danger btn-small"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div style={{ textAlign: 'center' }}>
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=1da1f2&color=fff&size=128`}
              alt={user.displayName}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '15px',
                objectFit: 'cover'
              }}
            />
            <h3>{user.displayName}</h3>
            <p style={{ color: '#657786', marginTop: '5px' }}>@{user.username}</p>
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ marginBottom: '15px' }}>Quick Links</h4>
            <button
              onClick={() => navigate(`/profile/${user._id}`)}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              My Posts
            </button>
          </div>
        </aside>

        <main className="content">
          <CreatePost onPostCreated={handlePostCreated} />
          
          <h2 style={{ marginBottom: '20px' }}>Recent Posts</h2>
          
          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: '#657786', fontSize: '18px' }}>
                No posts yet. Be the first to share something!
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default Feed;

