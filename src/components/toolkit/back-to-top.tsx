'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/lib/i18n';

/** Floating "back to top" button — appears after the first viewport of scrolling. */
export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setVisible(window.scrollY > 600);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-40 print:hidden"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                aria-label={t('totop')}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="h-10 w-10 rounded-full border border-border/60 bg-card/90 shadow-lg backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('totop')}</TooltipContent>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
