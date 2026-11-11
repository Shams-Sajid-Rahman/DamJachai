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

/**
 * Sets the document title, meta description and Open Graph tags for the current page.
 * `noindex` keeps private pages (admin, login, favorites) out of search results.
 */
export function usePageMeta({ title, description, noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : SITE;
    document.title = fullTitle;
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setProperty('og:title', fullTitle);
    setProperty('og:description', description);
    setProperty('og:url', window.location.href);
  }, [title, description, noindex]);
}

function setProperty(property, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
