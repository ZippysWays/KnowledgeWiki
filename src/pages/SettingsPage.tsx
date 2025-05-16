import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { WikiContext } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';
import { Save, AlertTriangle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Only admins can access settings
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      updateSettings(localSettings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Wiki Settings</h1>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="allowFreeEditing"
                name="allowFreeEditing"
                type="checkbox"
                checked={localSettings.allowFreeEditing}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="allowFreeEditing" className="font-medium text-gray-700 dark:text-gray-200">
                Allow Free Editing
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                When enabled, all registered users can edit pages. When disabled, only wiki admins can edit pages.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="requireApproval"
                name="requireApproval"
                type="checkbox"
                checked={localSettings.requireApproval}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!localSettings.allowFreeEditing}
              />
            </div>
            <div className="ml-3 text-sm">
              <label 
                htmlFor="requireApproval" 
                className={`font-medium ${
                  !localSettings.allowFreeEditing 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Require Approval for Edits
              </label>
              <p className={`${
                !localSettings.allowFreeEditing 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                When enabled, edits by non-admin users must be approved before they are published.
                (Only applies when free editing is enabled)
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="allowAnonymousViewing"
                name="allowAnonymousViewing"
                type="checkbox"
                checked={localSettings.allowAnonymousViewing}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="allowAnonymousViewing" className="font-medium text-gray-700 dark:text-gray-200">
                Allow Anonymous Viewing
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                When enabled, anyone can view wiki pages without logging in. When disabled, only registered users can view pages.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            {saveMessage && (
              <div className={`text-sm ${
                saveMessage.type === 'success' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {saveMessage.text}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1.5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              About Wiki Settings
            </h3>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              <p>
                These settings control how your wiki operates and who can contribute to it.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Allowing free editing makes your wiki more collaborative but can increase the risk of vandalism</li>
                <li>Requiring approval creates a moderation step to maintain quality</li>
                <li>Restricting anonymous viewing creates a private wiki for registered users only</li>
              </ul>
              <p className="mt-2">
                Choose the settings that best suit your community's needs. You can change these settings at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;