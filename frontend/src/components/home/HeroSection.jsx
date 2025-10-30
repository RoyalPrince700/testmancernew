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
    <section className="relative mx-3 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-900">

      {/* Decorative wave only */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        <svg className="absolute -bottom-px left-0 right-0 w-full" height="90" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.22)" d="M0,64L48,58.7C96,53,192,43,288,37.3C384,32,480,32,576,37.3C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z" />
        </svg>
      </motion.div>

      <Section className="relative z-10 pt-14 pb-14 md:pt-20 md:pb-16">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-5">
            <h1 className="text-2xl md:text-5xl font-normal tracking-tight text-white mb-4">
              Excel with TestMancer
            </h1>
          </div>

          <p className="text-sm md:text-base text-semibold text-white mb-8 max-w-3xl mx-auto tracking-wide leading-relaxed">
            Built for undergraduates and tertiary institutions.
            <span className="block mt-1">Plus JAMB, WAEC, ICAN, and TOEFL.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center mb-8">
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
                Learn more
                </Button>
              </>
            )}
          </div>


        </motion.div>
      </Section>
    </section>
  );
};

export default HeroSection;
