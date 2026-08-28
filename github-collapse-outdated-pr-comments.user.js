// ==UserScript==
// @name         GitHub PR - Collapse Outdated Comments
// @namespace    https://github.com/eveoh354/github-collapse-outdated-pr-comments
// @version      1.1.1
// @description  Collapses outdated GitHub PR threads only when you wrote the latest reply.
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

  const automaticallyCollapsed = new WeakSet();
  let scheduled = false;

  const isPullRequestPage = () => /^\/[^/]+\/[^/]+\/pull\/\d+(?:\/|$)/.test(location.pathname);

  const isVisible = (element) => {
    if (!(element instanceof HTMLElement)) return false;
    return element.getClientRects().length > 0;
  };

  const getLoggedInUser = () =>
    document.querySelector('meta[name="user-login"]')?.getAttribute('content')?.toLowerCase();

  const getUsernameFromProfileLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return undefined;

    const match = link.pathname.match(/^\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]).toLowerCase() : undefined;
  };

  const getLastReplyAuthor = (thread) => {
    const authorLinks = thread.querySelectorAll(
      'a.author, ' +
        '[data-testid="comment-header"] a[data-testid="avatar-link"], ' +
        '[data-testid="comment-header"] a[data-hovercard-type="user"]',
    );

    const authors = [...authorLinks].map(getUsernameFromProfileLink).filter(Boolean);
    return authors.at(-1);
  };

  const hasOutdatedBadge = (thread) => {
    const badges = thread.querySelectorAll(
      '.Label, ' +
        '[class*="label" i], ' +
        '[data-testid*="outdated" i], ' +
        '[aria-label*="outdated" i], ' +
        '[title*="outdated" i]',
    );

    return [...badges].some((badge) => {
      const text = (badge.textContent ?? '').replace(/\s+/g, ' ').trim();
      const metadata = `${badge.getAttribute('data-testid') ?? ''} ${badge.getAttribute('aria-label') ?? ''} ${badge.getAttribute('title') ?? ''}`;
      return /^outdated$/i.test(text) || /\boutdated\b/i.test(metadata);
    });
  };

  const isOutdatedThread = (thread) => {
    if (thread.getAttribute('data-resolved') === 'true') return false;

    const header = thread.querySelector(':scope > .js-toggle-outdated-comments');
    const toggleText = header?.textContent ?? '';
    if (/\boutdated\b/i.test(toggleText)) return true;

    // GitHub's conversation view renders the Outdated badge in the nested file
    // header rather than in the collapsible thread header.
    if (hasOutdatedBadge(thread)) return true;

    // In GitHub's current markup, an unresolved collapsible thread with this
    // header class is an outdated thread. Resolved threads are excluded above.
    if (header && thread.getAttribute('data-resolved') === 'false') return true;

    return Boolean(
      thread.querySelector(
        ':scope > [aria-label*="outdated" i], ' +
          ':scope > [title*="outdated" i], ' +
          ':scope > [data-testid*="outdated" i], ' +
          ':scope > .outdated-comment',
      ),
    );
  };

  const findThread = (element) =>
    element.closest(
      'review-thread-collapsible, .js-resolvable-timeline-thread-container, .js-resolvable-thread, .review-thread',
    );

  const getReviewThreads = () => {
    const threads = new Set(document.querySelectorAll('review-thread-collapsible'));
    for (const toggle of document.querySelectorAll('.js-toggle-outdated-comments')) {
      const thread = findThread(toggle);
      if (thread) threads.add(thread);
    }
    return threads;
  };

  const getToggleButton = (thread, expanded) =>
    thread.querySelector(
      `[data-target="review-thread-collapsible.button"][aria-expanded="${expanded}"], ` +
        `:is(button, [role="button"])[data-action*="review-thread-collapsible#toggle"][aria-expanded="${expanded}"], ` +
        `.js-toggle-outdated-comments:is(button, [role="button"])[aria-expanded="${expanded}"]`,
    );

  const updateThreads = () => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    for (const thread of getReviewThreads()) {
      if (!isOutdatedThread(thread)) continue;

      const lastReplyAuthor = getLastReplyAuthor(thread);
      if (!lastReplyAuthor) continue;

      const expanded = getToggleButton(thread, 'true');
      const collapsed = getToggleButton(thread, 'false');
      const lastReplyIsMine = lastReplyAuthor === loggedInUser;

      if (lastReplyIsMine && expanded && isVisible(expanded)) {
        expanded.click();
        automaticallyCollapsed.add(thread);
        continue;
      }

      // If somebody replies after this script collapsed the thread, reopen it so
      // the new message cannot remain hidden in the same browser session.
      if (!lastReplyIsMine && automaticallyCollapsed.has(thread) && collapsed && isVisible(collapsed)) {
        automaticallyCollapsed.delete(thread);
        collapsed.click();
      }
    }
  };

  const collapseOutdatedThreads = () => {
    scheduled = false;
    if (!isPullRequestPage()) return;
    updateThreads();
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
