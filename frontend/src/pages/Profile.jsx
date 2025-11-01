import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, logout, fetchUserData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    if (profile && currentUser) {
      setFollowing(
        currentUser.following?.some(id => id.toString() === profile._id.toString()) ||
        currentUser.following?.includes(profile._id)
      );
    }
  }, [profile, currentUser]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`/api/users/${userId}/follow`);
      setFollowing(!following);
      
      // Refresh profile data
      const response = await axios.get(`/api/users/${userId}`);
      setProfile(response.data);
      
      // Refresh current user context
      if (fetchUserData) {
        fetchUserData();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
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
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUser._id === profile._id;

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
              onClick={() => navigate('/feed')}
              className="btn btn-secondary btn-small"
            >
              Feed
            </button>
            {isOwnProfile && (
              <button
                onClick={logout}
                className="btn btn-danger btn-small"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div style={{ textAlign: 'center' }}>
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=1da1f2&color=fff&size=128`}
              alt={currentUser.displayName}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '15px',
                objectFit: 'cover'
              }}
            />
            <h3>{currentUser.displayName}</h3>
            <p style={{ color: '#657786', marginTop: '5px' }}>@{currentUser.username}</p>
          </div>
        </aside>

        <main className="content">
          <div className="profile-header">
            <div className="profile-info">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.displayName}&background=667eea&color=fff&size=128`}
                alt={profile.displayName}
                className="profile-avatar"
              />
              <div className="profile-details" style={{ flex: 1 }}>
                <h2>{profile.displayName}</h2>
                <p>@{profile.username}</p>
                {profile.bio && <p>{profile.bio}</p>}
                
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ marginTop: '10px' }}
                  >
                    {following ? '✓ Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
              <div className="profile-stat">
                <strong>{profile.followers?.length || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="profile-stat">
                <strong>{profile.following?.length || 0}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>

          <h2 style={{ marginBottom: '20px' }}>Posts</h2>

          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: '#657786', fontSize: '18px' }}>
                {isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
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

export default Profile;

