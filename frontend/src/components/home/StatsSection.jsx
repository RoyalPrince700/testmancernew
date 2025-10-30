import React from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';

// Animated counter component
const AnimatedCounter = ({ value }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Extract numeric value
  const numericValue = React.useMemo(() => {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }, [value]);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });

  // Transform the spring value to formatted string
  const displayValue = useTransform(springValue, (val) => {
    const formatted = Math.floor(val);
    if (value.includes('K+')) return `${formatted}K+`;
    if (value.includes('%')) return `${formatted}%`;
    return formatted.toString();
  });

  React.useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  return (
    <motion.div ref={ref} className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
      {displayValue}
    </motion.div>
  );
};

const StatsSection = () => {
  const items = [
    { value: '10K+', label: 'Active learners' },
    { value: '500+', label: 'Courses available' },
    { value: '95%', label: 'Success rate' },
  ];

  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div ref={sectionRef}>
      <Section className="bg-white !py-14 md:!py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeader
            title="Trusted by learners worldwide"
            description="Join thousands of students achieving their academic goals"
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {items.map((it) => (
            <motion.div key={it.label} variants={itemVariants}>
              <Card className="p-8 text-center bg-gradient-to-br from-slate-50 to-transparent hover:shadow-lg transition-shadow duration-300">
                <AnimatedCounter value={it.value} />
                <div className="text-sm text-slate-500">{it.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default StatsSection;
