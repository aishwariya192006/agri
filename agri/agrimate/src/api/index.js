import { api } from './client.js';

export const authApi = {
  signup: (data)          => api('/auth/signup',  { method: 'POST', body: data, auth: false }),
  signin: (data)          => api('/auth/signin',  { method: 'POST', body: data, auth: false }),
  me:     ()              => api('/auth/me'),
  updateProfile: (data)   => api('/auth/profile', { method: 'PUT', body: data }),
};

export const aiApi = {
  chat: (message, lang = 'en') => api('/ai/chat', { method: 'POST', body: { message, lang } }),
};

export const analysisApi = {
  disease: async (fileOrDataUrl) => {
    const formData = new FormData();
    if (fileOrDataUrl instanceof File) {
      formData.append('image', fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      const blob = await (await fetch(fileOrDataUrl)).blob();
      formData.append('image', blob, 'capture.jpg');
    } else {
      return api('/analysis/disease', { method: 'POST', body: { image: fileOrDataUrl } });
    }
    return api('/analysis/disease', { method: 'POST', formData });
  },
  soil: async (fileOrDataUrl) => {
    const formData = new FormData();
    if (fileOrDataUrl instanceof File) {
      formData.append('image', fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      const blob = await (await fetch(fileOrDataUrl)).blob();
      formData.append('image', blob, 'soil.jpg');
    } else {
      return api('/analysis/soil', { method: 'POST', body: { image: fileOrDataUrl } });
    }
    return api('/analysis/soil', { method: 'POST', formData });
  },
  history: () => api('/analysis/history'),
};

export const farmApi = {
  seeds:     (data) => api('/farm/seeds',     { method: 'POST', body: data }),
  profit:    (data) => api('/farm/profit',    { method: 'POST', body: data }),
  dashboard: ()     => api('/farm/dashboard'),
};

export const weatherApi = {
  forecast: () => api('/weather/forecast'),
};
