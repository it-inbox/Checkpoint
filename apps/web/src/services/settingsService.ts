import axios from 'axios';
import { OrganizationSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<OrganizationSettings> {
    const response = await axios.get('/api/settings');
    return response.data;
  },

  async updateSettings(settings: OrganizationSettings): Promise<OrganizationSettings> {
    const response = await axios.post('/api/settings', settings);
    return response.data;
  },
};

export default settingsService;
