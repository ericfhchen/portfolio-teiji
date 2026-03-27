'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function DebugOverlay() {
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const collect = useCallback((label = '') => {
    // Measure a plain fixed inset-0 element
    const full = document.createElement('div');
    full.style.cssText = 'position:fixed;top:0;bottom:0;left:0;right:0;pointer-events:none;visibility:hidden';
    document.body.appendChild(full);
    const fullRect = full.getBoundingClientRect();
    document.body.removeChild(full);

    // Measure safe area insets via env()
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-bottom,0px);visibility:hidden';
    document.body.appendChild(probe);
    const safeBottom = probe.getBoundingClientRect().height;
    probe.style.height = 'env(safe-area-inset-top,0px)';
    const safeTop = probe.getBoundingClientRect().height;
    document.body.removeChild(probe);

    // Find actual GridLines element
    const gridLines = document.querySelector('.fixed.inset-0.pointer-events-none.z-0');
    const glRect = gridLines?.getBoundingClientRect();

    // Probe safe area via CSS padding instead of height
    const safeProbe = document.createElement('div');
    safeProbe.style.cssText = 'position:fixed;bottom:0;left:0;width:1px;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden;box-sizing:content-box';
    document.body.appendChild(safeProbe);
    const safePaddingBottom = safeProbe.getBoundingClientRect().height;
    safeProbe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:0;padding-bottom:env(safe-area-inset-top,0px);visibility:hidden;box-sizing:content-box';
    const safePaddingTop = safeProbe.getBoundingClientRect().height;
    document.body.removeChild(safeProbe);

    // Check backgrounds
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlInline = document.documentElement.style.backgroundColor;
    const bodyInline = document.body.style.backgroundColor;
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const bodyTheme = document.body.getAttribute('data-theme');

    // Check the section layout div
    const themeDiv = document.querySelector('[data-theme]') as HTMLElement | null;
    const themeDivBg = themeDiv ? getComputedStyle(themeDiv).backgroundColor : 'N/A';
    const themeDivTheme = themeDiv?.getAttribute('data-theme');

    // CSS variable values
    const bgVar = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    const fgVar = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();

    const lines = [
      `[${new Date().toISOString().slice(11, 19)}${label}] ${pathname}`,
      `html bg: computed="${htmlBg}" inline="${htmlInline}" data-theme="${htmlTheme}"`,
      `body bg: computed="${bodyBg}" inline="${bodyInline}" data-theme="${bodyTheme}"`,
      `themeDiv bg: "${themeDivBg}" data-theme="${themeDivTheme}"`,
      `CSS vars: --bg="${bgVar}" --fg="${fgVar}"`,
      `safe-area(h): top=${safeTop} bottom=${safeBottom}`,
      `safe-area(pad): top=${safePaddingTop} bottom=${safePaddingBottom}`,
      `UA: ${navigator.userAgent.slice(-60)}`,
      `fixed inset-0: h=${Math.round(fullRect.height)} bot=${Math.round(fullRect.bottom)}`,
      `innerHeight=${window.innerHeight} screen=${screen.height}`,
      `visualVP: h=${window.visualViewport?.height}`,
      `viewport meta: ${document.querySelector('meta[name="viewport"]')?.getAttribute('content') || 'MISSING'}`,
      '---',
    ];
    return lines;
  }, [pathname]);

  useEffect(() => {
    setLogs(prev => [...collect(), ...prev].slice(0, 40));
  }, [pathname, collect]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLogs(prev => [...collect(' +1s'), ...prev].slice(0, 40));
    }, 1000);
    return () => clearTimeout(t);
  }, [pathname, collect]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(logs.join('\n')); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = logs.join('\n');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* Red test strip at absolute bottom — if visible, content reaches the edge */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 40,
        background: 'red', zIndex: 99998,
      }} />
      <div onClick={handleCopy} style={{
        position: 'fixed', top: 60, left: 4, right: 4, zIndex: 99999,
        background: 'rgba(0,0,0,0.9)', color: '#0f0', fontSize: 9,
        fontFamily: 'monospace', padding: 6, borderRadius: 4,
        whiteSpace: 'pre-wrap', maxHeight: '30vh', overflow: 'auto',
      }}>
        <div style={{ color: copied ? '#ff0' : '#0f0', fontWeight: 'bold', marginBottom: 2 }}>
          {copied ? 'COPIED!' : 'TAP TO COPY'}
        </div>
        {logs.join('\n')}
      </div>
    </>
  );
}
