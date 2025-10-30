import React from 'react';
import { motion, useInView } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import Section from '../ui/Section';
import Button from '../ui/Button';

const CTASection = ({ isAuthenticated }) => {
  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <motion.div ref={sectionRef}>
      <Section className="bg-gray-50 !py-14 md:!py-16 mx-3">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Start your learning journey
          </motion.h2>
          <motion.p
            className="text-lg text-slate-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Join thousands of students learning effectively with TestMancer.
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button to="/dashboard" size="sm" variant="ghost" className="group !bg-gray-100 !text-black !hover:bg-blue-50 !rounded-full">
              Continue Learning <FiArrowUpRight className="ml-2 -mr-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </motion.div>
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default CTASection;
