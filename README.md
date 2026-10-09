# Agent Chintu

The public site at https://agentchintu.com is served from this repository's `main` branch with GitHub Pages. Preserve `CNAME`, `.nojekyll`, and the original artwork.

## Pages

- `/`: introduction, projects, lore, example side quests and the No-BS code.
- `/now-playing/`: occasional public quest log. No sample accomplishments are published.

## Adding a public quest

PK reviews and approves the exact date, title, outcome, status and link before publication. Drafts, source conversations and private evidence stay outside this public repository. There is no automatic collection or publishing of activity.

Edit `content/quests.json` on GitHub. Keep `version` as `1`; add approved objects to `entries`. Each object has:

- `id`: unique, stable identifier.
- `date`: calendar date in `YYYY-MM-DD`, using PK's America/Los_Angeles day.
- `title`: concise quest name, at most 120 characters.
- `outcome`: useful result or honest progress, at most 500 characters.
- `status`: `done`, `in_progress`, or `killed` (intentionally dropped).
- `link` and `linkLabel`: optional public HTTPS link and descriptive label.

Do not add approval records, unpublished entries or private fields to this file. The entire file is publicly accessible. Reapprove changed wording, dates, statuses and links before committing. To withdraw an entry, remove it and commit; use GitHub history to restore a previously approved version. Public Git history is permanent enough that it must never contain private material.

The log sorts newest dates first and preserves file order within each day. It reads the JSON at runtime; no page layout or application build is needed. GitHub Pages still deploys a content commit, and its CDN may take several minutes to update. After publishing or withdrawing an entry, verify the public JSON and page reflect the change.

The homepage teaser and main-navigation link appear only when the feed has entries. An unobtrusive footer link always leads to the log. Empty and failed feeds have separate messages. No XP, streaks, filters or custom admin are included.

## Projects

The BACKCHANNEL card is in the `#projects` section of `index.html`. Add future issue cards using the same `project-feature` structure, only when there is a genuine project and public destination. Issue numbers identify projects; the numbered homepage sections are separate.

## Preview

Run a static HTTP server from this directory, for example `python3 -m http.server 8765 --bind 127.0.0.1`, and open http://127.0.0.1:8765. Check mobile navigation, the mascot and motion pause, all three side-quest examples, project links and the log before publishing.
