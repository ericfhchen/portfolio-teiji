'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export default function FinalResearchCredit() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hoverRef = useRef<HTMLSpanElement>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showHover, setShowHover] = useState(false);

  const getThemeColor = useCallback(() => {
    const themed = document.querySelector('[data-theme]') || document.documentElement;
    const computed = getComputedStyle(themed);
    return computed.getPropertyValue('--fg').trim() || '#000';
  }, []);

  const isMobile = useCallback(() => {
    return window.innerWidth <= 724 || 'ontouchstart' in window;
  }, []);

  const createCornerLines = useCallback(() => {
    if (svg) {
      svg.remove();
      setSvg(null);
    }

    requestAnimationFrame(() => {
      if (!hoverRef.current) return;

      const rect = hoverRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const color = getThemeColor();

      const screenCorners = [
        { x: 0, y: 0 },
        { x: vw, y: 0 },
        { x: 0, y: vh },
        { x: vw, y: vh },
      ];
      const blockCorners = [
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
        { x: rect.left, y: rect.bottom },
        { x: rect.right, y: rect.bottom },
      ];

      const ns = 'http://www.w3.org/2000/svg';
      const el = document.createElementNS(ns, 'svg');
      el.setAttribute('class', 'final-research-corner-lines');
      el.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;overflow:visible;`;
      el.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      el.setAttribute('preserveAspectRatio', 'none');
      el.setAttribute('aria-hidden', 'true');

      // Lines from screen corners to text corners
      screenCorners.forEach((sc, i) => {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', String(sc.x));
        line.setAttribute('y1', String(sc.y));
        line.setAttribute('x2', String(blockCorners[i].x));
        line.setAttribute('y2', String(blockCorners[i].y));
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '0.333');
        el.appendChild(line);
      });

      // Viewport border rects
      const borders = [
        { x: 0, y: 0, w: vw, h: 0.333 },
        { x: 0, y: vh - 0.333, w: vw, h: 0.333 },
        { x: 0, y: 0, w: 0.333, h: vh },
        { x: vw - 0.333, y: 0, w: 0.333, h: vh },
      ];
      borders.forEach(({ x, y, w, h }) => {
        const r = document.createElementNS(ns, 'rect');
        r.setAttribute('x', String(x));
        r.setAttribute('y', String(y));
        r.setAttribute('width', String(w));
        r.setAttribute('height', String(h));
        r.setAttribute('fill', color);
        el.appendChild(r);
      });

      document.body.appendChild(el);
      setSvg(el);
    });
  }, [svg, getThemeColor]);

  const removeCornerLines = useCallback(() => {
    if (svg) {
      svg.remove();
      setSvg(null);
    }
  }, [svg]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile()) {
      setIsHovering(true);
      setShowHover(true);
      createCornerLines();
    }
  }, [isMobile, createCornerLines]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile()) {
      setIsHovering(false);
      setShowHover(false);
      removeCornerLines();
    }
  }, [isMobile, removeCornerLines]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMobile()) {
      e.preventDefault();
      setShowHover(true);
      createCornerLines();

      setTimeout(() => {
        removeCornerLines();
        setShowHover(false);
        if (linkRef.current) {
          window.location.href = linkRef.current.href;
        }
      }, 1500);
    }
  }, [isMobile, createCornerLines, removeCornerLines]);

  // Update lines on resize/scroll while hovering
  useEffect(() => {
    if (!isHovering) return;

    const update = () => {
      if (isHovering) createCornerLines();
    };

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [isHovering, createCornerLines]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const el = document.querySelector('.final-research-corner-lines');
      if (el) el.remove();
    };
  }, []);

  return (
    <a
      ref={linkRef}
      href="https://finalresearch.org"
      target="_blank"
      rel="noopener noreferrer"
      className="relative inline-block text-var font-light no-underline cursor-pointer text-right transition-none text-[0.75rem] leading-tight"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span
        className="inline-block"
        style={{
          visibility: showHover ? 'hidden' : 'visible',
        }}
      >
        Website by FINAL RESEARCH
      </span>
      <span
        ref={hoverRef}
        className="absolute top-0 right-0 whitespace-nowrap"
        style={{
          opacity: showHover ? 1 : 0,
          visibility: showHover ? 'visible' : 'hidden',
        }}
      >
        FINALRESEARCH.ORG
      </span>
    </a>
  );
}
