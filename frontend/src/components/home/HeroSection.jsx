import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaBook, FaTrophy, FaUsers } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';
import Section from '../ui/Section';
import Button from '../ui/Button';

const HeroSection = ({ isAuthenticated }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section className="relative mx-3 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-900 md:min-h-0 min-h-screen">

      {/* Decorative elements */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        {/* Light blue flares at top edges */}
        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
          {/* Large blue-to-teal gradient circle - top right edge */}
          <div className="absolute -top-40 -right-40 w-64 h-64 bg-gradient-to-br from-blue-300/5 via-teal-200/8 to-blue-200/5 rounded-full blur-2xl"></div>

          {/* Medium teal-to-green gradient circle - top left edge */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-tr from-teal-200/6 via-green-200/4 to-blue-300/6 rounded-full blur-xl"></div>

          {/* Small blue gradient circle - right edge above center */}
          <div className="absolute -top-8 right-16 w-32 h-32 bg-gradient-to-b from-blue-400/4 to-teal-300/3 rounded-full blur-lg"></div>

          {/* Light blue-to-green curved gradient shape - left edge above center */}
          <div className="absolute -top-4 -left-8 w-64 h-20 bg-gradient-to-r from-transparent via-blue-300/6 via-teal-200/4 to-green-200/3 rounded-full blur-xl"></div>
        </div>

        {/* Bottom wave */}
        <svg className="absolute -bottom-px left-0 right-0 w-full" height="90" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.22)" d="M0,64L48,58.7C96,53,192,43,288,37.3C384,32,480,32,576,37.3C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z" />
        </svg>
      </motion.div>

      <Section className="relative z-10 pt-14 pb-14 md:pt-20 md:pb-16 flex items-center md:items-start min-h-screen md:min-h-0">
        {/* Mobile Hero Section */}
        <div className="block md:hidden">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-5">
              <h1 className="text-3xl font-semibold text-white mb-4">
                <span className="tracking-wider">Excel with</span> <br /> <span className="tracking-tight">TestMancer</span>
              </h1>
            </div>

            <p className="text-sm text-semibold text-white mb-8 max-w-3xl mx-auto tracking-wide leading-relaxed">
              Built for undergraduates and tertiary institutions. Plus JAMB, WAEC,
              <span className="block mt-1">  ICAN, and TOEFL.</span>
            </p>

            <div className="flex flex-col gap-2 justify-center mb-8">
              {isAuthenticated ? (
                <Button to="/dashboard" size="xs" variant="ghost" className="group !bg-white !text-black !hover:bg-blue-50 !rounded-full py-4">
                  Continue Learning <FiArrowUpRight className="ml-2 -mr-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              ) : (
                <>
                  <Button to="/auth" size="xs" variant="ghost" className="group !bg-white !text-black !hover:bg-blue-50 !rounded-full py-4">
                    Get Started <FiArrowUpRight className="ml-2 -mr-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                  <Button to="/courses" variant="ghost" size="xs" className="!bg-transparent !text-white !hover:bg-white/10 !rounded-full py-4">
                  Learn more {'>'}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Desktop Hero Section */}
        <div className="hidden md:block">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-5">
              <h1 className="text-5xl font-normal text-white mb-4">
                <span className="tracking-wider">Excel with</span> <br /> <span className="tracking-tight">TestMancer</span>
              </h1>
            </div>

            <p className="text-base text-semibold text-white mb-8 max-w-3xl mx-auto tracking-wide leading-relaxed">
              Built for undergraduates and tertiary institutions.
              <span className="block mt-1">Plus JAMB, WAEC, ICAN, and TOEFL.</span>
            </p>

            <div className="flex flex-row gap-2 justify-center mb-8">
              {isAuthenticated ? (
                <Button to="/dashboard" size="sm" variant="ghost" className="group !bg-white !text-black !hover:bg-blue-50 !rounded-full">
                  Continue Learning <FiArrowUpRight className="ml-2 -mr-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              ) : (
                <>
                  <Button to="/auth" size="sm" variant="ghost" className="group !bg-white !text-black !hover:bg-blue-50 !rounded-full">
                    Get Started <FiArrowUpRight className="ml-2 -mr-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                  <Button to="/courses" variant="ghost" size="sm" className="!bg-transparent !text-white !hover:bg-white/10 !rounded-full">
                  Learn more {'>'}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </Section>
    </section>
  );
};

export default HeroSection;
