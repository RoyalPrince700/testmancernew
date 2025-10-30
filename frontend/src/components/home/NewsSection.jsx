import React from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import ArticleCard from '../ui/ArticleCard';
import ab1 from '../../assets/ab1.png';
import ab2 from '../../assets/ab2.png';
import ab3 from '../../assets/ab3.png';
import { useSidebar } from '../../contexts/SidebarContext';

const NewsSection = () => {
  const { collapsed } = useSidebar();
  const items = [
    { eyebrow: 'Feature', title: 'JAMB 2025 Preparation Courses Now Available', meta: 'Platform · Oct 15, 2025', imageSrc: ab1 },
    { eyebrow: 'Update', title: 'New WAEC Chemistry Interactive Modules Released', meta: 'Content · Oct 8, 2025', imageSrc: ab2 },
    { eyebrow: 'Achievement', title: '100,000+ Students Now Using TestMancer Platform', meta: 'Milestone · Sep 28, 2025', imageSrc: ab3 },
  ];

  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
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
            title="Latest Updates"
            description="Stay informed with features and achievements."
            viewAllHref="/news"
          />
        </motion.div>
        <motion.div
          className={`grid grid-cols-1 ${collapsed ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8`}
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

export default NewsSection;


