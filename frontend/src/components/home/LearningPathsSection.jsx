import React from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import ab1 from '../../assets/ab1.png';
import ab2 from '../../assets/ab2.png';
import ab3 from '../../assets/ab3.png';
import ab4 from '../../assets/ab4.png';
import ab5 from '../../assets/ab5.png';
import ab6 from '../../assets/ab6.png';
import { useSidebar } from '../../contexts/SidebarContext';

const LearningPathsSection = () => {
  const { collapsed } = useSidebar();
  const learningPaths = [
    { name: 'Institutions', image: ab6, description: 'Degree program support', highlight: '200+ courses' },
    { name: 'WAEC', image: ab1, description: 'Nigerian secondary school certificate', highlight: '15 subjects available' },
    { name: 'JAMB', image: ab2, description: 'University entrance examination', highlight: '6 subjects available' },
    { name: 'Post-UTME', image: ab3, description: 'University admission screening', highlight: 'Covers multiple faculties' },
    { name: 'TOEFL', image: ab4, description: 'Test of English as a Foreign Language', highlight: '4 skill sections' },
    { name: 'IELTS', image: ab5, description: 'International English Language Testing', highlight: '4 skill sections' },
  ];

  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
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
            title="Learning paths for every goal"
            description="From WAEC to IELTS,
            pick your path and go."
            viewAllHref="/learningpaths"
          />
        </motion.div>

        {/* Responsive grid; collapsed => 2 cols, open => 1 col */}
        <motion.div
          className={`grid grid-cols-1 ${collapsed ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {learningPaths.map((path, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="!bg-transparent !border-0 !shadow-none p-0">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={path.image}
                      alt={path.name}
                      className="w-28 h-24 sm:w-32 sm:h-28 md:w-64 md:h-56 object-cover rounded-md"
                    />
                    {/* Centered overlay title inside the image */}
                    <div className="absolute inset-0 rounded-md flex items-center justify-center">
                      <div className="px-3 py-1 bg-black/40 rounded text-white text-sm md:text-base font-semibold">
                        {path.name}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm md:text-base">{path.description}</p>
                    {path.highlight ? (
                      <p className="mt-1 text-[12px] md:text-sm text-slate-500 font-medium">{path.highlight}</p>
                    ) : null}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default LearningPathsSection;
