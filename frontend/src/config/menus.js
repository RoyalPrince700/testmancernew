import {
  MdHome,
  MdMenuBook,
  MdLibraryBooks,
  MdAssessment,
  MdLeaderboard,
  MdSettings,
  MdHelp,
  MdPeople,
  MdCloudUpload,
  MdBarChart,
  MdGrade,
} from 'react-icons/md';

export const menus = {
  guest: [
    {
      title: 'Navigation',
      items: [
        { key: 'home', name: 'Home', icon: MdHome, href: '/' },
        { key: 'auth', name: 'Sign In', icon: MdPeople, href: '/auth' },
      ],
    },
  ],
  user: [
    {
      title: 'Main',
      items: [
        { key: 'overview', name: 'Overview', icon: MdHome },
        { key: 'courses', name: 'My Courses', icon: MdMenuBook },
        { key: 'resources', name: 'Resources', icon: MdLibraryBooks },
        { key: 'activity', name: 'CA/Exam', icon: MdAssessment },
        { key: 'results', name: 'Results', icon: MdLeaderboard },
        { key: 'leaderboard', name: 'Leaderboard', icon: MdLeaderboard },
        { key: 'settings', name: 'Settings', icon: MdSettings },
        { key: 'help', name: 'Help', icon: MdHelp },
      ],
    },
  ],
  admin: [
    {
      title: 'Management',
      items: [
        { key: 'dashboard', name: 'Dashboard', icon: MdHome },
        { key: 'courses', name: 'Courses', icon: MdMenuBook },
        { key: 'users', name: 'Users', icon: MdPeople },
        { key: 'media', name: 'Media', icon: MdCloudUpload },
      ],
    },
    {
      title: 'Insights & System',
      items: [
        { key: 'analytics', name: 'Analytics', icon: MdBarChart },
        { key: 'settings', name: 'Settings', icon: MdSettings },
      ],
    },
  ],
  subadmin: [
    {
      title: 'Content Management',
      items: [
        { key: 'dashboard', name: 'Dashboard', icon: MdHome },
        { key: 'courses', name: 'Courses', icon: MdMenuBook },
        { key: 'assessments', name: 'CA/Exam', icon: MdGrade },
        { key: 'resources', name: 'Resources', icon: MdLibraryBooks },
        { key: 'media', name: 'Media', icon: MdCloudUpload },
      ],
    },
    {
      title: 'Insights',
      items: [
        { key: 'analytics', name: 'Analytics', icon: MdBarChart },
      ],
    },
  ],
};

export default menus;


