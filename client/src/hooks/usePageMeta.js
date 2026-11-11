import { useEffect } from 'react';

const SITE = 'DamJachai | দাম যাচাই';

function setMeta(name, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** Sets the document title and meta description for the current page. */
export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE;
    setMeta('description', description);
  }, [title, description]);
}
