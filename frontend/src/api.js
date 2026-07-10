const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (body) =>
    request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getMe: () => request('/users/me'),

  updateProfile: (data, avatar) => {
    const form = new FormData();
    if (data.username) form.append('username', data.username);
    if (data.bio !== undefined) form.append('bio', data.bio);
    if (avatar) form.append('avatar', avatar);
    return request('/users/me', { method: 'PUT', body: form });
  },

  getUsers: () => request('/users'),

  getUser: (id) => request(`/users/${id}`),

  searchUsers: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),

  getConversations: () => request('/messages/conversations'),

  getUnreadCount: () => request('/messages/unread-count'),

  getMessages: (userId) => request(`/messages/${userId}`),

  markRead: (userId) => request(`/messages/${userId}/read`, { method: 'PUT' }),

  sendMessage: (receiver, text, image) => {
    const form = new FormData();
    form.append('receiver', receiver);
    if (text) form.append('text', text);
    if (image) form.append('image', image);
    return request('/messages', { method: 'POST', body: form });
  },

  getPosts: () => request('/posts'),

  getUserPosts: (userId) => request(`/posts/user/${userId}`),

  createPost: (text, image) => {
    const form = new FormData();
    if (text) form.append('text', text);
    if (image) form.append('image', image);
    return request('/posts', { method: 'POST', body: form });
  },
};
