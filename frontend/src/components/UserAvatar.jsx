export default function UserAvatar({ user, size = 40 }) {
  const name = user?.username || '?';
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className="user-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="user-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
