'use strict';
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  }
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.masthead')) closeMenu();
    });
    matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);
    menu.closest('.masthead').classList.add('menu-ready');
  }

  const log = document.getElementById('quest-log');
  if (log) log.hidden = false;
  const teaser = document.getElementById('now-teaser');
  const labels = { done: 'Done', in_progress: 'In progress', killed: 'Killed' };
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Los_Angeles'
  });
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function validLink(link) {
    if (typeof link !== 'string') return false;
    try {
      const url = new URL(link, location.origin);
      return url.protocol === 'https:' || (link.startsWith('/') && !link.startsWith('//'));
    } catch { return false; }
  }
  function validateFeed(data) {
    if (data.version !== 1 || !Array.isArray(data.entries)) throw new Error('Invalid quest log');
    const ids = new Set();
    const fields = new Set(['id', 'date', 'title', 'outcome', 'status', 'link', 'linkLabel']);
    for (const entry of data.entries) {
      if (!entry || Object.keys(entry).some(key => !fields.has(key))) throw new Error('Unexpected entry fields');
      if (typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id)) throw new Error('Invalid quest ID');
      ids.add(entry.id);
      if (!Object.hasOwn(labels, entry.status)) throw new Error('Invalid quest status');
      if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error('Invalid quest date');
      const date = new Date(`${entry.date}T12:00:00Z`);
      if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== entry.date) throw new Error('Invalid calendar date');
      if (typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 120) throw new Error('Invalid quest title');
      if (typeof entry.outcome !== 'string' || !entry.outcome.trim() || entry.outcome.length > 500) throw new Error('Invalid quest outcome');
      if (entry.link !== undefined && (!validLink(entry.link) || typeof entry.linkLabel !== 'string' || !entry.linkLabel.trim())) throw new Error('Invalid quest link');
    }
    return [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
  }
  function emptyLog() {
    const block = node('div', 'log-empty');
    block.append(node('span', 'eyebrow', 'NO PUBLIC ENTRIES YET'), node('h2', '', 'Quiet screen. Work still happening.'), node('p', '', 'The next entry goes here when there’s something worth sharing.'));
    const link = node('a', 'button button-ink', 'Explore the projects ↗');
    link.href = '/#projects';
    block.append(link);
    log.replaceChildren(block);
  }
  function renderLog(entries) {
    if (!entries.length) { emptyLog(); return; }
    const fragment = document.createDocumentFragment();
    let lastDate, list;
    for (const entry of entries) {
      if (lastDate !== entry.date) {
        const section = node('section', 'log-date-group');
        const heading = node('h2', 'log-date');
        const time = node('time', '', dateFormat.format(new Date(`${entry.date}T12:00:00Z`)));
        time.dateTime = entry.date;
        heading.append(time);
        list = node('ul', 'quest-rows');
        section.append(heading, list);
        fragment.append(section);
        lastDate = entry.date;
      }
      const row = node('li', 'quest-row');
      const status = node('span', `quest-status status-${entry.status.replace('_', '-')}`);
      const dot = node('span', 'status-dot');
      dot.setAttribute('aria-hidden', 'true');
      status.append(dot, document.createTextNode(labels[entry.status]));
      const copy = node('div', 'quest-copy');
      copy.append(node('h3', '', entry.title), node('p', '', entry.outcome));
      if (entry.link) {
        const link = node('a', 'quest-link', `${entry.linkLabel} ↗`);
        link.href = entry.link;
        copy.append(link);
      }
      row.append(status, copy);
      list.append(row);
    }
    log.replaceChildren(fragment);
  }
  async function loadLog() {
    try {
      // This endpoint contains public, approved copy only. Never put drafts here.
      const response = await fetch('/content/quests.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Quest log unavailable');
      const entries = validateFeed(await response.json());
      if (log) renderLog(entries);
      if (entries.length) {
        document.querySelectorAll('.now-nav').forEach(link => { link.hidden = false; });
        if (teaser) {
          document.getElementById('latest-quest').textContent = `${entries[0].title} — ${entries[0].outcome}`;
          teaser.hidden = false;
        }
      }
    } catch {
      if (log) {
        const block = node('div', 'log-empty');
        block.append(node('h2', '', 'The log won’t load right now.'), node('p', '', 'Try again in a moment. The projects are still here.'));
        const retry = node('button', 'button button-ink', 'Try again');
        retry.addEventListener('click', () => {
          log.setAttribute('aria-busy', 'true');
          log.replaceChildren(node('p', 'log-status', 'Opening the quest log…'));
          loadLog();
        });
        const link = node('a', 'quest-link', 'Explore the projects ↗');
        link.href = '/#projects';
        block.append(retry, link);
        log.replaceChildren(block);
      }
    } finally {
      if (log) log.setAttribute('aria-busy', 'false');
    }
  }
  loadLog();
})();
