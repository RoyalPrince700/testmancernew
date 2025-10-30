// Utility for respecting prefers-reduced-motion
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Wrapper for motion components that disables animation when reduced motion is preferred
export const motionProps = (animationProps) => {
  if (prefersReducedMotion) {
    return {
      ...animationProps,
      initial: animationProps.initial || false,
      animate: animationProps.animate || false,
      transition: { duration: 0 },
      whileHover: undefined,
      whileTap: undefined,
    };
  }
  return animationProps;
};
