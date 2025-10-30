import React from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import ArticleCard from '../ui/ArticleCard';
import ab4 from '../../assets/ab4.png';
import ab5 from '../../assets/ab5.png';

const StoriesSection = () => {
  const items = [
    { eyebrow: 'Success Story', title: 'From JAMB Failure to University Admission: A TestMancer Journey', meta: 'Student Success · Aug 22, 2025', imageSrc: ab4 },
    { eyebrow: 'Achievement', title: 'WAEC Excellence: Scoring 8 A\'s Using Gamified Learning', meta: 'Academic Excellence · Jul 15, 2025', imageSrc: ab5 },
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
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
            title="Success Stories"
            description="Stories of students achieving excellence."
            viewAllHref="/stories"
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
              <ArticleCard eyebrow={it.eyebrow} title={it.title} meta={it.meta} imageSrc={it.imageSrc} />
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default StoriesSection;


