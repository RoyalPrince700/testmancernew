// SubAdmin Placeholder Components
import { MdCloudUpload, MdBarChart, MdConstruction } from 'react-icons/md';
import Card from '../ui/Card';

export const SubAdminMediaManagement = () => (
  <Card className="p-8">
    <div className="text-center">
      <MdCloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Media Management</h3>
      <p className="text-gray-500 mb-6">
        Upload and manage audio/video content for your courses. Feature coming soon.
      </p>
      <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
        <MdConstruction className="w-5 h-5 text-gray-500 mr-2" />
        <span className="text-sm text-gray-600">Under Development</span>
      </div>
    </div>
  </Card>
);

export const SubAdminAnalytics = () => (
  <Card className="p-8">
    <div className="text-center">
      <MdBarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
      <p className="text-gray-500 mb-6">
        View detailed analytics about your courses and student performance. Feature coming soon.
      </p>
      <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
        <MdConstruction className="w-5 h-5 text-gray-500 mr-2" />
        <span className="text-sm text-gray-600">Under Development</span>
      </div>
    </div>
  </Card>
);
