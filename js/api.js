/* ============================================
   NagaraSeva — Frontend API Client
   ============================================ */

const API_BASE = '/api';

class NagaraSevaAPI {

  // ── Auth Token Management ──
  static getToken() {
    return localStorage.getItem('nagaraseva_token');
  }

  static setToken(token) {
    localStorage.setItem('nagaraseva_token', token);
  }

  static getUser() {
    const data = localStorage.getItem('nagaraseva_user');
    return data ? JSON.parse(data) : null;
  }

  static setUser(user) {
    localStorage.setItem('nagaraseva_user', JSON.stringify(user));
  }

  static logout() {
    localStorage.removeItem('nagaraseva_token');
    localStorage.removeItem('nagaraseva_user');
    window.location.href = '/index.html';
  }

  static isLoggedIn() {
    return !!this.getToken();
  }

  // ── HTTP Helper ──
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // ── Auth Endpoints ──
  static async signup(name, email, password, phone = '') {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  static async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  static async getMe() {
    return await this.request('/auth/me');
  }

  // ── Grievance Endpoints ──
  static async getGrievances(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return await this.request(`/grievances${query ? '?' + query : ''}`);
  }

  static async getMyGrievances() {
    return await this.request('/grievances/my');
  }

  static async getGrievance(id) {
    return await this.request(`/grievances/${id}`);
  }

  static async getStats() {
    return await this.request('/grievances/stats');
  }

  static async createGrievance(grievanceData) {
    return await this.request('/grievances', {
      method: 'POST',
      body: JSON.stringify(grievanceData)
    });
  }

  static async updateGrievance(id, updates) {
    return await this.request(`/grievances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  static async addComment(id, text, isInternal = false) {
    return await this.request(`/grievances/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, isInternal })
    });
  }

  static async deleteGrievance(id) {
    return await this.request(`/grievances/${id}`, {
      method: 'DELETE'
    });
  }

  // ── Health Check ──
  static async healthCheck() {
    return await this.request('/health');
  }
}

// Make globally available
window.NagaraSevaAPI = NagaraSevaAPI;
