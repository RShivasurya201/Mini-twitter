import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, currentUser, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  const isLiked = currentUser && post.likes?.some(like => like.user?._id === currentUser._id || like.user === currentUser._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    onLike(post._id);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="card post-card">
      <div
        className="flex"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/profile/${post.author._id}`)}
      >
        <img
          src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.displayName}&background=1da1f2&color=fff`}
          alt={post.author.displayName}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            marginRight: '15px',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <h3 style={{ margin: 0 }}>{post.author.displayName}</h3>
            <span style={{ color: '#657786' }}>@{post.author.username}</span>
            <span style={{ color: '#657786' }}>·</span>
            <span style={{ color: '#657786' }}>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '15px', marginLeft: '65px' }}>
        {post.content && (
          <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#333' }}>
            {post.content}
          </p>
        )}

        {post.image && (
          <img
            src={post.image}
            alt="Post"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '15px'
            }}
          />
        )}

        <div style={{ display: 'flex', gap: '30px', marginTop: '15px', marginBottom: '15px' }}>
          <button
            onClick={handleLike}
            className="btn btn-small"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: isLiked ? '#e0245e' : '#657786'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="btn btn-small"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#657786'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{commentCount}</span>
          </button>
        </div>

        {showComments && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            {currentUser ? (
              <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
                <div className="flex" style={{ gap: '10px' }}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-small"
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => navigate('/login')}
                >
                  Login to comment
                </button>
              </div>
            )}

            {post.comments && post.comments.length > 0 ? (
              <div style={{ marginTop: '15px' }}>
                {post.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px',
                      background: '#f5f5f5',
                      borderRadius: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <strong style={{ color: '#333' }}>
                        {comment.user?.displayName || 'User'}
                      </strong>
                      <span style={{ color: '#657786', fontSize: '14px' }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#333' }}>{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#657786', textAlign: 'center', marginTop: '15px' }}>
                No comments yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;

