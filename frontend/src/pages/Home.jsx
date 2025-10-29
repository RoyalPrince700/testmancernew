import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import LearningPathsSection from '../components/home/LearningPathsSection';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      <LearningPathsSection />
      <StatsSection />
      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default Home;
