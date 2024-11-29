import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useWialon } from '../../context/WialonContext';
import { Save, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApiSettings() {
  const { settings, updateSettings, clearSettings } = useSettings();
  const { login } = useWialon();
  const [formData, setFormData] = useState({
    wialonApiToken: settings.wialonApiToken || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    
    // Test connection when saving
    await handleTestConnection();
  };

  const handleClear = () => {
    clearSettings();
    setFormData({
      wialonApiToken: ''
    });
    toast.success('API settings cleared');
  };

  const handleTestConnection = async () => {
    if (!formData.wialonApiToken) {
      toast.error('Please enter an API token');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login();
      if (success) {
        toast.success('Successfully connected to Wialon');
        updateSettings(formData);
      } else {
        toast.error('Failed to connect to Wialon');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wialon API Token
          </label>
          <input
            type="text"
            value={formData.wialonApiToken}
            onChange={(e) => setFormData({ ...formData, wialonApiToken: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter your Wialon API token"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isLoading || !formData.wialonApiToken}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Test Connection
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Clear Settings
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}