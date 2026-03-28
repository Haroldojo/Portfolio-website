import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
});

export const getProfile = () => api.get('/profile/');
export const getStats = () => api.get('/stats/');
export const getSkills = () => api.get('/skills/');
export const getExperience = () => api.get('/experience/');
export const getEducation = () => api.get('/education/');
export const getProjects = (category) => {
    const params = category && category !== 'all' ? { category } : {};
    return api.get('/projects/', { params });
};
export const getProjectDetail = (slug) => api.get(`/projects/${slug}/`);
export const submitContact = (data) => api.post('/contact/', data);
export const aiSearch = (query) => api.post('/ai-search/', { query });

export default api;
