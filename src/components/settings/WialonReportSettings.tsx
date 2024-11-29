import React, { useState, useEffect } from 'react';
import { useWialon } from '../../context/WialonContext';
import { Select } from '../ui/Select';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  name: string;
  templates: Template[];
}

interface Template {
  id: string;
  name: string;
  type: string;
}

interface Unit {
  id: string;
  name: string;
}

const TIME_INTERVALS = [
  { value: '86400', label: 'Last day' },
  { value: '604800', label: 'Last week' },
  { value: '2592000', label: 'Last month' }
];

export default function WialonReportSettings() {
  const { isAuthenticated, executeReport } = useWialon();
  const [resources, setResources] = useState<Resource[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('86400');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadResources();
      loadUnits();
    }
  }, [isAuthenticated]);

  const loadResources = async () => {
    try {
      const data = await executeReport('loadResources');
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    }
  };

  const loadUnits = async () => {
    try {
      const data = await executeReport('loadUnits');
      setUnits(data);
    } catch (error) {
      toast.error('Failed to load units');
    }
  };

  const handleExecuteReport = async () => {
    if (!selectedResource || !selectedTemplate || !selectedUnit) {
      toast.error('Please select all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await executeReport('executeReport', {
        resourceId: selectedResource,
        templateId: selectedTemplate,
        unitId: selectedUnit,
        interval: selectedInterval
      });
      toast.success('Report executed successfully');
    } catch (error) {
      toast.error('Failed to execute report');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedResourceTemplates = resources.find(r => r.id === selectedResource)?.templates || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Report Automation</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <Select
              value={selectedResource}
              onChange={setSelectedResource}
              options={resources.map(r => ({ value: r.id, label: r.name }))}
              placeholder="Select resource"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <Select
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              options={selectedResourceTemplates.map(t => ({ value: t.id, label: t.name }))}
              placeholder="Select template"
              disabled={!selectedResource}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <Select
              value={selectedUnit}
              onChange={setSelectedUnit}
              options={units.map(u => ({ value: u.id, label: u.name }))}
              placeholder="Select unit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Interval
            </label>
            <Select
              value={selectedInterval}
              onChange={setSelectedInterval}
              options={TIME_INTERVALS}
              placeholder="Select interval"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleExecuteReport}
            disabled={isLoading || !isAuthenticated}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Executing...' : 'Execute Report'}
          </button>
        </div>
      </div>
    </div>
  );
}