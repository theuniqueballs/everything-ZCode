'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Shared, subtle scroll-reveal primitives (opacity + y, 300–400ms).
 * Used across toolkit sections so motion stays consistent.
 * All wrappers are client-side only; sections using them are 'use client'.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

/** Fade+up reveal when the block scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: EASE, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers its StaggerItem children as it enters the viewport. */
export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

/** Child of StaggerGroup: fades+slides in with an incremental delay. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUpVariants}>
      {children}
    </motion.div>
  );
}
