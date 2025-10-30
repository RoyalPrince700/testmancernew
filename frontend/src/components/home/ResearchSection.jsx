import React from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import ArticleCard from '../ui/ArticleCard';

const ResearchSection = () => {
  const items = [
    { eyebrow: 'Research', title: 'Gamification Impact on Exam Performance: A TestMancer Study', meta: 'Education Research · Sep 12, 2025', gradientClass: 'bg-gradient-to-br from-slate-200 to-slate-100' },
    { eyebrow: 'Methodology', title: 'Adaptive Learning Algorithms for Nigerian Exam Preparation', meta: 'Learning Science · Aug 28, 2025', gradientClass: 'bg-gradient-to-br from-primary-200 to-emerald-200' },
  ];

  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <motion.div ref={sectionRef}>
      <Section className="bg-white !py-14 md:!py-16 ">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeader
            title="Research & Insights"
            description="Discover the science behind effective learning."
            viewAllHref="/research"
          />
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {items.map((it, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <ArticleCard eyebrow={it.eyebrow} title={it.title} meta={it.meta} gradientClass={it.gradientClass} />
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default ResearchSection;


