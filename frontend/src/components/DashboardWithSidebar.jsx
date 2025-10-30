import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
// Removed unused auth import

// Import dashboard components - lazy load heavy ones
import {
  DashboardOverview,
  PersonalizedCourses
} from './dashboard';
// DashboardLayout removed - now using global AppLayout
import Card from './ui/Card';
import { menus } from '../config/menus';

// Lazy load heavy components
const Resources = lazy(() => import('./dashboard/Resources'));
const RecentAssessments = lazy(() => import('./dashboard/RecentAssessments'));
const Results = lazy(() => import('./dashboard/Results'));
const LeaderboardTab = lazy(() => import('../pages/Leaderboard'));

// Loading skeleton for lazy components
const LoadingSkeleton = () => (
  <Card className="p-4 sm:p-6">
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    </div>
  </Card>
);

const DashboardWithSidebar = ({ stats, recentAssessments, personalizedCourses, loading = false }) => {
  const { activeTab } = useNavigation();
  const [prefetchedTabs, setPrefetchedTabs] = useState(new Set());

  // Prefetch commonly accessed tabs when active tab changes
  useEffect(() => {
    if (!prefetchedTabs.has(activeTab)) {
      setPrefetchedTabs(prev => new Set([...prev, activeTab]));
      // Import the component to trigger lazy loading
      switch (activeTab) {
        case 'resources':
          import('./dashboard/Resources');
          break;
        case 'activity':
          import('./dashboard/RecentAssessments');
          break;
        case 'results':
          import('./dashboard/Results');
          break;
        case 'leaderboard':
          import('../pages/Leaderboard');
          break;
      }
    }
  }, [activeTab, prefetchedTabs]);

  return (
    <div className="page-container py-5">
      {activeTab === 'overview' && (
        loading ? <LoadingSkeleton /> : <DashboardOverview stats={stats} />
      )}
      {activeTab === 'courses' && (
        <PersonalizedCourses
          personalizedCourses={personalizedCourses}
          courseProgress={stats?.courseProgress || []}
        />)
      }
      {activeTab === 'resources' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <Resources />
        </Suspense>
      )}
      {activeTab === 'activity' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <RecentAssessments recentAssessments={recentAssessments} />
        </Suspense>
      )}
      {activeTab === 'results' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <Results personalizedCourses={personalizedCourses} />
        </Suspense>
      )}
      {activeTab === 'leaderboard' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <LeaderboardTab />
        </Suspense>
      )}
      {activeTab === 'settings' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Settings</h2>
          <p className="text-[13px] sm:text-sm text-gray-600">Settings component coming soon...</p>
        </Card>
      )}
      {activeTab === 'help' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Help & Support</h2>
          <p className="text-[13px] sm:text-sm text-gray-600">Help component coming soon...</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardWithSidebar;
