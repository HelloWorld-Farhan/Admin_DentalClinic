import { useEffect } from 'react';

let lockCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';
let savedPaddingRight = '';

/**
 * useBodyScrollLock
 * Prevents background window from scrolling when a modal or popup is open.
 * Safely handles nested / multiple modals using a reference counter.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      savedPaddingRight = document.body.style.paddingRight;

      // Compensate for scrollbar shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.setAttribute('data-modal-open', 'true');
    }

    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = savedBodyOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
        document.body.style.paddingRight = savedPaddingRight;
        document.body.removeAttribute('data-modal-open');
      }
    };
  }, [isLocked]);
}
