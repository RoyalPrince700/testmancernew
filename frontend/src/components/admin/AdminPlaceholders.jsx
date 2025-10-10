// Media Management Component
const MediaManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
        <p className="text-gray-600">Upload and manage audio/video files for courses</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Media management interface coming soon...</p>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">View usage statistics and reports</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Settings panel coming soon...</p>
      </div>
    </div>
  );
};

export { MediaManagement, Analytics, Settings };
