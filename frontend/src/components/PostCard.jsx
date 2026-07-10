import UserAvatar from './UserAvatar';

function formatDate(date) {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostCard({ post, onViewProfile, compact = false }) {
  const author = post.author;

  return (
    <article className={`post-card ${compact ? 'post-card-compact' : ''}`}>
      <div className="post-header">
        <button
          type="button"
          className="post-author"
          onClick={() => onViewProfile?.(author)}
          disabled={!onViewProfile}
        >
          <UserAvatar user={author} size={40} />
          <div className="post-author-meta">
            <strong>{author?.username}</strong>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </button>
      </div>

      <div className="post-body">
        {post.text && <p className="post-text">{post.text}</p>}
        {post.image && (
          <div className={`post-image-container${post.text ? '' : ' post-image-only'}`}>
            <img
              src={post.image}
              alt={post.text ? `Post by ${author?.username}` : `Photo by ${author?.username}`}
              className="post-image"
              loading="lazy"
              onClick={() => window.open(post.image, '_blank')}
            />
          </div>
        )}
      </div>
    </article>
  );
}
