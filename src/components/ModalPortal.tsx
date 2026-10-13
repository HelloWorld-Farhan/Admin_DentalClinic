import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal
 * Teleports modals directly to document.body to break out of any parent CSS
 * transform / filter / backdrop-blur stacking contexts.
 * This guarantees the backdrop covers the full screen (including header & sidebar)
 * and completely prevents background clicks and scrolling.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};

export default ModalPortal;
