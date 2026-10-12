# Markdown Editor

A dependency-free Markdown writing space with a side-by-side live preview. It supports headings, paragraphs, emphasis, ordered and unordered lists, blockquotes, inline/fenced code, links, and horizontal rules. The editor escapes raw HTML before rendering; scripts and HTML markup from a draft are displayed as text and never inserted as active markup. Link schemes are restricted to common safe protocols and relative links.

## Run

Open `index.html` in a modern browser. Drafts are saved in that browser's local storage under `draftspace.markdown.v1`; they are not sent to a server. Clearing browser storage removes the saved draft. Use **Load sample** to replace the current draft with the example.

## Checks

Run `tests/smoke-check.ps1` in PowerShell. It checks essential UI and safety implementation markers. For a manual check, enter `<script>alert(1)</script>` and confirm it appears as visible text in the preview without executing.
