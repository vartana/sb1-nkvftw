const API_URL = '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },
  
  users: {
    list: () => fetchApi('/users'),
    create: (user: { email: string; name: string; password: string; role: string }) =>
      fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      }),
  },
  
  purchaseOrders: {
    list: () => fetchApi('/purchase-orders'),
    create: (data: { recipientEmail: string }) =>
      fetchApi('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    uploadFiles: (id: string, files: { [key: string]: File }) => {
      const formData = new FormData();
      Object.entries(files).forEach(([type, file]) => {
        formData.append(type, file);
      });
      
      return fetch(`${API_URL}/purchase-orders/${id}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
  },
};