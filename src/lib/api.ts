export const api = {
  async get(endpoint: string) {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) {
      let message = 'Terjadi kesalahan';
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (e) {
        message = await res.text();
      }
      throw new Error(message);
    }
    return res.json();
  },
  async post(endpoint: string, data: any) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let message = 'Terjadi kesalahan';
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (e) {
        message = await res.text();
      }
      throw new Error(message);
    }
    return res.json();
  },
  async delete(endpoint: string) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      let message = 'Terjadi kesalahan';
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (e) {
        message = await res.text();
      }
      throw new Error(message);
    }
    return res.json();
  },
  async put(endpoint: string, data: any) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let message = 'Terjadi kesalahan';
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (e) {
        message = await res.text();
      }
      throw new Error(message);
    }
    return res.json();
  }
};
