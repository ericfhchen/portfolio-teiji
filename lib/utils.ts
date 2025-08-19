export function parseSearchParams(searchParams: URLSearchParams) {
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const item = searchParams.get('item') || null;
  
  return { tags, item };
}

export function createSearchParams(tags: string[], item?: string | null) {
  const params = new URLSearchParams();
  
  if (tags.length > 0) {
    params.set('tags', tags.join(','));
  }
  
  if (item) {
    params.set('item', item);
  }
  
  return params.toString();
}

export function toggleTag(currentTags: string[], tag: string): string[] {
  if (currentTags.includes(tag)) {
    return currentTags.filter(t => t !== tag);
  }
  return [...currentTags, tag];
}

export function parseItemParam(item: string | null): { parentSlug: string; index: number } | null {
  if (!item) return null;
  
  const [parentSlug, indexStr] = item.split(':');
  const index = parseInt(indexStr, 10);
  
  if (!parentSlug || isNaN(index)) return null;
  
  return { parentSlug, index };
}

export function createItemParam(parentSlug: string, index: number): string {
  return `${parentSlug}:${index}`;
}

// Simple focus trap utility
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}