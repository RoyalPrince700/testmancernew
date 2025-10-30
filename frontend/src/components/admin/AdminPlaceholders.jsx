import Card from '../ui/Card';

// Media Management Component
const MediaManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Media Management</h1>
        <p className="text-gray-600 text-sm">Upload and manage audio/video files for courses</p>
      </div>
      <Card className="p-6">
        <p className="text-gray-500">Media management interface coming soon...</p>
      </Card>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-600 text-sm">View usage statistics and reports</p>
      </div>
      <Card className="p-6">
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </Card>
    </div>
  );
};

// Settings Component
const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm">Configure system settings and preferences</p>
      </div>
      <Card className="p-6">
        <p className="text-gray-500">Settings panel coming soon...</p>
      </Card>
    </div>
  );
};

export { MediaManagement, Analytics, Settings };
