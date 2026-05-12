import axios from 'axios';
import { toast } from 'sonner';


// Create a configured Axios instance
const api = axios.create({
  // Use VITE_API_URL from .env if available, otherwise default to local development URL
  baseURL: import.meta.env.VITE_API_URL || 'https://interview-platform-backend-i5jv.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',

  },
  timeout: 15000,
});

// Request Interceptor
// Automatically attaches the authentication token to every request
api.interceptors.request.use(
  (config) => {
    // Retrieve token from local storage (or your state management solution)
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
// Handles global responses and error mapping
api.interceptors.response.use(
  (response) => {
    // Unwrap the response data if the backend uses a global wrapper
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'An unexpected error occurred';

    // Handle authentication errors globally
    if (status === 401) {
      console.warn('Unauthorized access - Token expired or invalid.');
      localStorage.removeItem('auth_token');
      // Optionally redirect to login page:
      // window.location.href = '/login';
    }
    // Handle permissions errors
    else if (status === 403) {
      toast.error("Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor. Hesabınız henüz onaylanmamış olabilir.");
    }
    // Provide generic toast for server errors if desired (can be turned off)
    else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ==========================================
// Centralized API Request Handlers
// ==========================================

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/Auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

export const courseAPI = {
  getAll: async () => {
    const response = await api.get('/Courses');
    return response.data;
  },
  getMyCourses: async () => {
    const response = await api.get('/Courses/my-courses');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/Courses/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/Courses', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/Courses/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/Courses/${id}`);
    return response.data;
  },
  // New Question Management under Courses
  addQuestions: async (courseId, questions) => {
    const response = await api.post(`/Courses/${courseId}/questions`, questions);
    return response.data;
  },
  updateQuestion: async (questionId, data) => {
    const response = await api.put(`/Courses/questions/${questionId}`, data);
    return response.data;
  },
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/Courses/questions/${questionId}`);
    return response.data;
  }
};

export const evaluationAPI = {
  evaluate: async (data) => {
    const response = await api.post('/Evaluation', data);
    return response.data;
  }
};

export const courseAttemptAPI = {
  start: async (data) => {
    const response = await api.post('/CourseAttempts/start', data);
    return response.data;
  },
  submitAnswer: async (attemptId, data) => {
    const response = await api.post(`/CourseAttempts/${attemptId}/submit-answer`, data);
    return response.data;
  },
  complete: async (attemptId) => {
    const response = await api.post(`/CourseAttempts/${attemptId}/complete`);
    return response.data;
  },
  getById: async (attemptId) => {
    const response = await api.get(`/CourseAttempts/${attemptId}`);
    return response.data;
  },
  getMyAttempts: async () => {
    const response = await api.get('/CourseAttempts/my-attempts');
    return response.data;
  }
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/Users/profile');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/Users');
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/Users/requests');
    return response.data;
  },
  approveRequest: async (id) => {
    const response = await api.post(`/Users/${id}/approve`);
    return response.data;
  },
  updateRole: async (id, newRole) => {
    const response = await api.put(`/Users/${id}/role?newRole=${newRole}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
  }
};

export default api;
