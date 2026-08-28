// ==UserScript==
// @name         GitHub PR - Collapse Outdated Comments
// @namespace    https://github.com/eveoh354/github-collapse-outdated-pr-comments
// @version      1.0.0
// @description  Automatically collapses expanded outdated review threads in GitHub pull requests.
// @author       eveoh354
// @homepageURL  https://github.com/eveoh354/github-collapse-outdated-pr-comments
// @supportURL   https://github.com/eveoh354/github-collapse-outdated-pr-comments/issues
// @downloadURL  https://raw.githubusercontent.com/eveoh354/github-collapse-outdated-pr-comments/main/github-collapse-outdated-pr-comments.user.js
// @updateURL    https://raw.githubusercontent.com/eveoh354/github-collapse-outdated-pr-comments/main/github-collapse-outdated-pr-comments.user.js
// @match        https://github.com/*/*/pull/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==

(() => {
  'use strict';

  const processed = new WeakSet();
  let scheduled = false;

  const isPullRequestPage = () => /^\/[^/]+\/[^/]+\/pull\/\d+(?:\/|$)/.test(location.pathname);

  const isVisible = (element) => {
    if (!(element instanceof HTMLElement)) return false;
    return element.getClientRects().length > 0;
  };

  const normalizedText = (element) =>
    (element?.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

  const hasOutdatedMarker = (thread) => {
    const semanticMarker = thread.querySelector(
      '[aria-label*="outdated" i], [title*="outdated" i], [data-testid*="outdated" i], .outdated-comment',
    );
    if (semanticMarker) return true;

    const possibleBadges = thread.querySelectorAll(
      '.Label, [class*="badge" i], [class*="label" i], summary, h3, h4',
    );
    return [...possibleBadges].some((element) => /^(outdated|过时)$/.test(normalizedText(element)));
  };

  const clickOnce = (button) => {
    if (!(button instanceof HTMLElement) || processed.has(button) || !isVisible(button)) return false;
    processed.add(button);
    button.click();
    return true;
  };

  const collapseLegacyThreads = () => {
    for (const button of document.querySelectorAll('.js-toggle-outdated-comments')) {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const explicitlyCollapse = /\b(collapse|hide)\b/i.test(
        `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''} ${button.getAttribute('title') ?? ''}`,
      );

      // Avoid expanding a thread GitHub has already collapsed.
      if (expanded || explicitlyCollapse) clickOnce(button);
    }
  };

  const collapseModernThreads = () => {
    for (const thread of document.querySelectorAll('review-thread-collapsible.open')) {
      if (processed.has(thread) || !hasOutdatedMarker(thread)) continue;

      const button = thread.querySelector(
        ':is(button, [role="button"])[aria-expanded="true"], ' +
          ':is(button, [role="button"])[data-target*="collapsible" i], ' +
          ':is(button, [role="button"])[data-action*="toggle" i]',
      );

      if (button && clickOnce(button)) processed.add(thread);
    }
  };

  const collapseOutdatedThreads = () => {
    scheduled = false;
    if (!isPullRequestPage()) return;
    collapseLegacyThreads();
    collapseModernThreads();
  };

  const scheduleCollapse = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(collapseOutdatedThreads);
  };

  const observer = new MutationObserver(scheduleCollapse);

  const start = () => {
    observer.disconnect();
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    scheduleCollapse();
  };

  // GitHub uses client-side navigation, so a traditional page-load hook is not enough.
  document.addEventListener('turbo:load', start);
  document.addEventListener('pjax:end', start);
  window.addEventListener('popstate', start);
  start();
})();
