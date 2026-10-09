import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Bearer Token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('csms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth Services
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);

// Attendance Services
export const getMyAttendanceApi = (targetThreshold = 0.75) => API.get(`/attendance/me?targetThreshold=${targetThreshold}`);
export const calculateAttendanceApi = (params) => API.get('/attendance/calculator', { params });
export const recordAttendanceApi = (data) => API.post('/attendance/records', data);
export const getSubjectAttendanceApi = (subjectId) => API.get(`/attendance/subject/${subjectId}`);

// Results & Academic Progression Services
export const getMyResultsApi = () => API.get('/results/me');
export const enterResultApi = (data) => API.post('/results', data);
export const getProgressionEligibilityApi = () => API.get('/academic/eligibility');

// Club Services
export const getClubsApi = (params) => API.get('/clubs', { params });
export const getClubByIdApi = (id) => API.get(`/clubs/${id}`);
export const applyForClubApi = (clubId, data) => API.post(`/clubs/${clubId}/apply`, data);
export const getMyMembershipsApi = () => API.get('/clubs/me/memberships');
export const reviewApplicationApi = (membershipId, data) => API.patch(`/clubs/applications/${membershipId}`, data);
export const createClubEventApi = (clubId, data) => API.post(`/clubs/${clubId}/events`, data);
export const registerForEventApi = (eventId) => API.post(`/clubs/events/${eventId}/register`);

// Achievers Q&A Services
export const getQuestionsApi = (params) => API.get('/qa/questions', { params });
export const createQuestionApi = (data) => API.post('/qa/questions', data);
export const getQuestionByIdApi = (id) => API.get(`/qa/questions/${id}`);
export const answerQuestionApi = (id, data) => API.post(`/qa/questions/${id}/answers`, data);
export const voteContentApi = (data) => API.post('/qa/vote', data);
export const acceptAnswerApi = (answerId) => API.patch(`/qa/answers/${answerId}/accept`);
export const getAchieversApi = () => API.get('/qa/achievers');
export const verifyAchieverApi = (data) => API.post('/qa/achievers/verify', data);

// Admin Services
export const getAdminDashboardApi = () => API.get('/admin/dashboard');
export const getUsersApi = (params) => API.get('/admin/users', { params });
export const createDepartmentApi = (data) => API.post('/admin/departments', data);
export const createSubjectApi = (data) => API.post('/admin/subjects', data);
export const createPromotionRuleApi = (data) => API.post('/admin/promotion-rules', data);
export const getPromotionRulesApi = () => API.get('/admin/promotion-rules');
export const publishAnnouncementApi = (data) => API.post('/admin/announcements', data);

// Notification Services
export const getNotificationsApi = () => API.get('/notifications');
export const markNotificationReadApi = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => API.patch('/notifications/read-all');

export default API;
