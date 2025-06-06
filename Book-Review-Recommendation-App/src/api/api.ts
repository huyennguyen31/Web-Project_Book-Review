const BASE_URL = 'http://10.0.2.2:4000/api';

export const login = async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }) 
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Lỗi server: không nhận được JSON từ login');
    }
  };

export const register = async (username: string, email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Lỗi server: không nhận được JSON từ register');
  }
};

export const fetchBooks = async () => {
  const res = await fetch(`${BASE_URL}/books`);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    throw new Error('Lỗi server: không nhận được JSON từ fetchBooks');
  }
};

export const fetchBookById = async (id: number) => {
  const res = await fetch(`${BASE_URL}/books/${id}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Lỗi server: không nhận được JSON từ fetchBookById');
  }
};

export const postComment = async (bookId: number, userId: number, content: string, rating: number) => {
    const res = await fetch(`http://10.0.2.2:4000/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, userId, content, rating })  
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ postComment error response:', text);
      throw new Error('Lỗi server: không nhận được JSON từ postComment');
    }
  };
  export const fetchBooksByGenre = async (genre : string) => {
    const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');
    const res = await fetch(`${BASE_URL}/books/genre/${encodeURIComponent(genreSlug)}`);
    if (!res.ok) throw new Error('Failed to fetch books by genre');
    return await res.json();
  };