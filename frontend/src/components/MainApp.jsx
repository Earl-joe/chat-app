import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import UserAvatar from './UserAvatar';
import PostCard from './PostCard';
import {
  BackIcon,
  CameraIcon,
  ChatIcon,
  CloseIcon,
  FeedIcon,
  MoonIcon,
  PostIcon,
  ProfileIcon,
  SearchIcon,
  SendIcon,
  SunIcon,
} from './Icons';

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function lastMessagePreview(msg, myId) {
  if (!msg) return 'Start a conversation';
  const prefix = String(msg.sender) === String(myId) ? 'You: ' : '';
  if (msg.image) return `${prefix}Photo`;
  return `${prefix}${msg.text}`;
}

function FeedView({ onViewProfile }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const load = () => api.getPosts().then(setPosts).catch(console.error);
  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || posting) return;
    setPosting(true);
    try {
      await api.createPost(text.trim(), image);
      setText('');
      setImage(null);
      setPreview(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const clearPreview = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="feed-view animate-fade-in">
      <div className="feed-composer">
        <UserAvatar user={user} size={40} />
        <form onSubmit={handlePost} className="composer-form">
          <textarea
            placeholder={`What's on your mind, ${user.username}?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          {preview && (
            <div className="composer-preview">
              <img src={preview} alt="Preview" />
              <button type="button" className="composer-preview-remove" onClick={clearPreview} aria-label="Remove image">
                <CloseIcon size={14} />
              </button>
            </div>
          )}
          <div className="composer-actions">
            <label className="composer-photo-btn">
              <CameraIcon size={18} />
              Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={posting || (!text.trim() && !image)}>
              Post
            </button>
          </div>
        </form>
      </div>

      <div className="feed-list">
        {posts.length === 0 && (
          <div className="empty-state">
            <PostIcon size={48} className="empty-state-icon" />
            <p>No posts yet. Be the first to share something.</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onViewProfile={onViewProfile} />
        ))}
      </div>
    </div>
  );
}

function ProfileView({ profileUser, isOwn, onMessage, onBack }) {
  const { user, updateUser } = useAuth();
  const target = isOwn ? user : profileUser;
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(target?.username || '');
  const [bio, setBio] = useState(target?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (target?._id || target?.id) {
      api.getUserPosts(target._id || target.id).then(setPosts).catch(console.error);
    }
  }, [target]);

  useEffect(() => {
    setUsername(target?.username || '');
    setBio(target?.bio || '');
  }, [target]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ username, bio }, avatarFile);
      updateUser(updated);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!target) return null;

  return (
    <div className="profile-view animate-fade-in">
      {!isOwn && (
        <button type="button" className="back-btn" onClick={onBack}>
          <BackIcon size={18} />
          Back
        </button>
      )}

      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="profile-avatar-large" />
          ) : (
            <UserAvatar user={target} size={96} />
          )}
          {isOwn && editing && (
            <label className="avatar-edit-btn" aria-label="Change avatar">
              <CameraIcon size={16} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }}
              />
            </label>
          )}
        </div>

        {editing ? (
          <div className="profile-edit-form">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} maxLength={200} />
            <div className="profile-edit-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>{target.username}</h2>
            <p className="profile-email">{target.email}</p>
            {target.bio && <p className="profile-bio">{target.bio}</p>}
            <div className="profile-actions">
              {isOwn ? (
                <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
              ) : (
                <button type="button" className="btn btn-primary profile-message-btn" onClick={() => onMessage(target)}>
                  <ChatIcon size={18} />
                  Message
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="profile-posts">
        <h3>Posts</h3>
        {posts.length === 0 ? (
          <p className="empty-text">No posts yet</p>
        ) : (
          <div className="profile-posts-list">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ chatUser, onBack, onViewProfile }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);

  const load = useCallback(() => {
    if (!chatUser) return;
    api.getMessages(chatUser._id).then(setMessages).catch(console.error);
  }, [chatUser]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || sending) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(chatUser._id, text.trim(), image);
      setMessages((prev) => [...prev, msg]);
      setText('');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window animate-fade-in">
      <div className="chat-window-header">
        <button type="button" className="back-btn mobile-only" onClick={onBack} aria-label="Back">
          <BackIcon size={20} />
        </button>
        <button type="button" className="chat-user-btn" onClick={() => onViewProfile(chatUser)}>
          <UserAvatar user={chatUser} size={36} />
          <div>
            <strong>{chatUser.username}</strong>
            <span>Active now</span>
          </div>
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, i) => {
          const isSent = String(msg.sender._id || msg.sender) === String(user.id);
          return (
            <div
              key={msg._id}
              className={`message ${isSent ? 'sent' : 'received'} animate-message`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
            >
              {msg.text && <div>{msg.text}</div>}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Shared"
                  onClick={() => window.open(msg.image, '_blank')}
                />
              )}
              <div className="message-time">{formatTime(msg.createdAt)}</div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}>Remove</button>
        </div>
      )}

      <form className="message-input-area" onSubmit={handleSend}>
        <label className="image-btn" title="Send image">
          <CameraIcon size={20} />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); }
            }}
          />
        </label>
        <input
          type="text"
          placeholder="Aa"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={sending || (!text.trim() && !image)} aria-label="Send">
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  );
}

export default function MainApp() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifyMessage, requestPermission } = useNotifications();

  const [tab, setTab] = useState('chats');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const prevUnreadRef = useRef({});
  const isFirstLoadRef = useRef(true);

  const loadConversations = useCallback(async () => {
    try {
      const [convs, unread] = await Promise.all([
        api.getConversations(),
        api.getUnreadCount(),
      ]);
      setTotalUnread(unread.count);

      convs.forEach((c) => {
        if (isFirstLoadRef.current) {
          prevUnreadRef.current[c.user._id] = c.unreadCount;
          return;
        }
        const prev = prevUnreadRef.current[c.user._id] || 0;
        if (c.unreadCount > prev && c.user._id !== selectedUser?._id) {
          notifyMessage(c.user.username, c.lastMessage?.text);
        }
        prevUnreadRef.current[c.user._id] = c.unreadCount;
      });
      isFirstLoadRef.current = false;

      setConversations(convs);
    } catch (err) {
      console.error(err);
    }
  }, [selectedUser, notifyMessage]);

  useEffect(() => {
    requestPermission();
    api.getUsers().then(setAllUsers).catch(console.error);
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [loadConversations, requestPermission]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api.searchUsers(search).then(setSearchResults).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const displayUsers = search.trim() ? searchResults : allUsers;

  const openChat = (u) => {
    setSelectedUser(u);
    setViewProfile(null);
    setTab('chats');
    prevUnreadRef.current[u._id] = 0;
    api.markRead(u._id).catch(console.error);
    loadConversations();
  };

  const openProfile = (u) => {
    if (u._id === user.id || u.id === user.id) {
      setViewProfile(null);
      setTab('profile');
    } else {
      api.getUser(u._id || u.id).then(setViewProfile).catch(console.error);
    }
    setSelectedUser(null);
  };

  const showSidebar = tab === 'chats' && !viewProfile;
  const showChat = tab === 'chats' && selectedUser && !viewProfile;
  const showProfile = tab === 'profile' || viewProfile;
  const showFeed = tab === 'feed';

  return (
    <div className="messenger-app">
      <header className="messenger-header">
        <div className="header-brand">
          <ChatIcon size={24} className="brand-icon" />
          <h1>Messenger</h1>
        </div>
        <div className="header-actions">
          {totalUnread > 0 && tab !== 'chats' && (
            <span className="header-badge">{totalUnread}</span>
          )}
          <button type="button" className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
          <button
            type="button"
            className="header-profile-btn"
            onClick={() => { setTab('profile'); setViewProfile(null); setSelectedUser(null); }}
          >
            <UserAvatar user={user} size={32} />
          </button>
          <button type="button" className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="messenger-body">
        {showSidebar && (
          <aside className={`sidebar ${showChat ? 'sidebar-collapsed-mobile' : ''}`}>
            <div className="search-box">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search Messenger"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {!search.trim() && conversations.length > 0 && (
              <div className="sidebar-section">
                <h3>Chats</h3>
                <div className="user-list">
                  {conversations.map((c) => (
                    <div
                      key={c.user._id}
                      className={`user-item ${selectedUser?._id === c.user._id ? 'active' : ''}`}
                      onClick={() => openChat(c.user)}
                    >
                      <UserAvatar user={c.user} size={48} />
                      <div className="user-info">
                        <div className="user-info-top">
                          <strong>{c.user.username}</strong>
                          <span className="conv-time">{formatTime(c.lastMessage?.createdAt)}</span>
                        </div>
                        <span className="conv-preview">{lastMessagePreview(c.lastMessage, user.id)}</span>
                      </div>
                      {c.unreadCount > 0 && <span className="unread-badge">{c.unreadCount}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <h3>{search.trim() ? 'Results' : 'Contacts'}</h3>
              <div className="user-list">
                {displayUsers.length === 0 && (
                  <p className="empty-text">{search.trim() ? 'No users found' : 'No other users yet'}</p>
                )}
                {displayUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                    onClick={() => openChat(u)}
                  >
                    <UserAvatar user={u} size={48} />
                    <div className="user-info">
                      <strong>{u.username}</strong>
                      <span>{u.bio || u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        <main className={`main-content ${showChat ? 'show-chat-mobile' : ''}`}>
          {showFeed && <FeedView onViewProfile={openProfile} />}

          {showProfile && (
            <ProfileView
              profileUser={viewProfile}
              isOwn={!viewProfile}
              onMessage={(u) => openChat(u)}
              onBack={() => setViewProfile(null)}
            />
          )}

          {tab === 'chats' && !showChat && !showProfile && (
            <div className="chat-placeholder animate-fade-in">
              <ChatIcon size={64} className="placeholder-icon" />
              <h2>Your Messages</h2>
              <p>Select a conversation or contact to start chatting</p>
            </div>
          )}

          {showChat && (
            <ChatWindow
              chatUser={selectedUser}
              onBack={() => setSelectedUser(null)}
              onViewProfile={openProfile}
            />
          )}
        </main>
      </div>

      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-btn ${tab === 'chats' ? 'active' : ''}`}
          onClick={() => { setTab('chats'); setViewProfile(null); }}
        >
          <ChatIcon size={22} />
          Chats
          {totalUnread > 0 && <span className="nav-badge">{totalUnread}</span>}
        </button>
        <button
          type="button"
          className={`nav-btn ${tab === 'feed' ? 'active' : ''}`}
          onClick={() => { setTab('feed'); setSelectedUser(null); setViewProfile(null); }}
        >
          <FeedIcon size={22} />
          Feed
        </button>
        <button
          type="button"
          className={`nav-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => { setTab('profile'); setSelectedUser(null); setViewProfile(null); }}
        >
          <ProfileIcon size={22} />
          Profile
        </button>
      </nav>
    </div>
  );
}
