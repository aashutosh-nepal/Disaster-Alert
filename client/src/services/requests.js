import api from './api';

export const requestsApi = {
  async list({ lng, lat, radiusKm } = {}) {
    const params = {};
    if (lng != null && lat != null && radiusKm != null) {
      params.lng = lng;
      params.lat = lat;
      params.radiusKm = radiusKm;
    }

    const { data } = await api.get('/requests', { params });
    return data.requests;
  },

  async create({ type, quantity, location }) {
    const { data } = await api.post('/requests', { type, quantity, location });
    return data.request;
  },

  async accept({ id }) {
    const { data } = await api.post(`/requests/${id}/accept`);
    return data.request;
  },

  async setStatus({ id, status }) {
    const { data } = await api.patch(`/requests/${id}/status`, { status });
    return data.request;
  },

  async setPriority({ id, priority }) {
    const { data } = await api.patch(`/requests/${id}/priority`, { priority });
    return data.request;
  }
};
