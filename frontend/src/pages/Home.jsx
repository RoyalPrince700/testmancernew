import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import LearningPathsSection from '../components/home/LearningPathsSection';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';
import { NewsSection, StoriesSection, ResearchSection } from '../components/home';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen pt-4 mr-3 ml-3 md:ml-0 md:pl-4">
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      <LearningPathsSection />
      <StatsSection />
      <NewsSection />
      <StoriesSection />
      <ResearchSection />
      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default Home;
