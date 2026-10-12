const STORAGE_KEY = 'draftspace.markdown.v1';
const fence = String.fromCharCode(96).repeat(3);
const sample = [
  '# A small idea, getting clearer',
  '',
  'A good draft does not need to be perfect. It just needs a place to start.',
  '',
  '## Make room to think',
  '',
  '- Capture the useful bits',
  '- Turn questions into next steps',
  '- Keep your momentum gentle',
  '',
  '> The first version is allowed to be a beginning.',
  '',
  'Try **bold**, *emphasis*, and `inline code`. Add a [safe link](https://example.com) when you need one.',
  '',
  `${fence}js`,
  'const idea = "starts here";',
  fence,
  '',
  'Raw HTML such as <script>alert("nope")</script> is displayed as text, never run.'
].join('\n');
const input = document.querySelector('#markdown-input');
const preview = document.querySelector('#preview');
const saveState = document.querySelector('#save-state');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderInline(text) {
  let safe = escapeHtml(text);
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  safe = safe.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (match, label, href) => {
    const allowed = /^(https?:\/\/|mailto:|#|\.\.?\/|\/)/i.test(href) && !/^\/\//.test(href);
    return allowed ? `<a href="${href}" rel="noopener noreferrer">${label}</a>` : label;
  });
  return safe;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;
  let code = null;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${paragraph.map(renderInline).join('<br>')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(`<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${list.type}>`);
    list = null;
  };
  for (const line of lines) {
    if (code) {
      if (/^\s*\x60\x60\x60/.test(line)) {
        blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        code = null;
      } else code.push(line);
      continue;
    }
    if (/^\s*\x60\x60\x60/.test(line)) { flushParagraph(); flushList(); code = []; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const item = line.match(/^\s*([-*+] |\d+\. )(.+)$/);
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    if (heading) { flushParagraph(); flushList(); const level = heading[1].length; blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`); continue; }
    if (/^\s*>\s?/.test(line)) { flushParagraph(); flushList(); blocks.push(`<blockquote><p>${renderInline(line.replace(/^\s*>\s?/, ''))}</p></blockquote>`); continue; }
    if (/^\s*---+\s*$/.test(line)) { flushParagraph(); flushList(); blocks.push('<hr>'); continue; }
    if (item) {
      flushParagraph();
      const type = /^\s*\d+\./.test(line) ? 'ol' : 'ul';
      if (list && list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push(item[2]);
      continue;
    }
    flushList(); paragraph.push(line);
  }
  if (code) blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  flushParagraph(); flushList();
  return blocks.join('\n');
}

function updatePreview() {
  preview.innerHTML = renderMarkdown(input.value);
}

function saveDraft() {
  updatePreview();
  try {
    localStorage.setItem(STORAGE_KEY, input.value);
    saveState.textContent = 'Saved locally';
  } catch {
    saveState.textContent = 'Storage unavailable';
  }
}

try { input.value = localStorage.getItem(STORAGE_KEY) ?? sample; } catch { input.value = sample; }
updatePreview();
input.addEventListener('input', saveDraft);
document.querySelector('#reset-button').addEventListener('click', () => {
  input.value = sample;
  saveDraft();
  input.focus();
});
