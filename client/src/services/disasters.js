import api from './api';

export const disastersApi = {
  async list(params = {}) {
    const { data } = await api.get('/disasters', { params });
    return data.reports;
  },
  async create({ disasterType, description, severity, location, imageFile }) {
    const form = new FormData();
    form.append('disasterType', disasterType);
    form.append('description', description);
    form.append('severity', String(severity));
    form.append('location', JSON.stringify(location));
    if (imageFile) form.append('image', imageFile);

    const { data } = await api.post('/disasters', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.report;
  },
  async setStatus({ id, status }) {
    const { data } = await api.patch(`/disasters/${id}/status`, { status });
    return data.report;
  }
};
