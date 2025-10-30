import React from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import ab1 from '../../assets/ab1.png';
import ab2 from '../../assets/ab2.png';
import ab3 from '../../assets/ab3.png';

const FeaturesSection = () => {
  const features = [
    {
      image: ab1,
      title: 'Interactive Courses',
    },
    {
      image: ab2,
      title: 'Gamified Learning',
    },
    {
      image: ab3,
      title: 'Personalized Experience',
    },
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
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
            title="Why choose TestMancer?"
            description="Effective learning with just what you need."
            viewAllHref="/features"
          />
        </motion.div>

        {/* Desktop/tablet grid (3 columns). Image card only; headline sits outside */}
        <motion.div
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 "
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="overflow-hidden hover:shadow-medium transition-shadow duration-200">
                <div className="h-56 w-full">
                  <img src={feature.image} alt={feature.title} className="h-full w-full object-cover" />
                </div>
              </Card>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{feature.title}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile horizontal swipe with peek of next card. Headline sits outside */}
        <motion.div
          className="md:hidden px-4 overflow-x-auto snap-x snap-mandatory"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex gap-4 pr-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} className="snap-start min-w-[85%]">
                <Card className="overflow-hidden hover:shadow-medium transition-shadow duration-200">
                  <div className="h-56 w-full">
                    <img src={feature.image} alt={feature.title} className="h-full w-full object-cover" />
                  </div>
                </Card>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default FeaturesSection;
