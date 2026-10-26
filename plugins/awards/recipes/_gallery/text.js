// Text for the gallery's file panel: a small Markdown renderer for the recipe READMEs and a tokenising highlighter
// for their JavaScript, CSS and HTML. Both escape everything they do not mark up.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- highlighting ----------

const KEYWORDS = 'import|from|export|default|const|let|var|function|return|if|else|for|while|do|of|in|new|class|extends|super|this|async|await|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false|break|continue|switch|case|yield|delete|void|static|get|set';
const JS = new RegExp(String.raw`(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(\x60(?:\\[\s\S]|[^\x60\\])*\x60|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(${KEYWORDS})\b|(\b0x[\da-f]+\b|\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b)`, 'gi');
const CSS = /(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(@[\w-]+|!important)|(--?[\w-]+)(?=:\s)|(#[\da-f]{3,8}\b|-?\b\d*\.?\d+(?:px|rem|em|vw|vh|svh|dvh|%|ms|s|deg|fr|ch)?\b)/gi;
const TAG = /(<!--[\s\S]*?-->)|(<\/?[\w-]+)([^>]*?)(\/?>)/g;
const ATTR = /([\w:@.-]+)(=)("[^"]*"|'[^']*')?/g;

// Wrap one token; a token that spans lines is wrapped line by line so the per-line rows stay well formed.
const wrap = (cls, text) => text.split('\n').map((t) => (t ? `<span class="${cls}">${esc(t)}</span>` : '')).join('\n');

function tokens(src, re, classes) {
  let out = '';
  let last = 0;
  for (const m of src.matchAll(re)) {
    out += esc(src.slice(last, m.index));
    const k = m.slice(1).findIndex((g) => g !== undefined);
    out += k < 0 ? esc(m[0]) : wrap(classes[k], m[0]);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

function html(src) {
  let out = '';
  let last = 0;
  for (const m of src.matchAll(TAG)) {
    out += esc(src.slice(last, m.index));
    if (m[1]) out += wrap('tk-c', m[1]);
    else {
      out += wrap('tk-t', m[2]);
      let a = 0;
      for (const at of m[3].matchAll(ATTR)) {
        out += esc(m[3].slice(a, at.index)) + wrap('tk-a', at[1]) + esc(at[2]) + (at[3] ? wrap('tk-s', at[3]) : '');
        a = at.index + at[0].length;
      }
      out += esc(m[3].slice(a)) + wrap('tk-t', m[4]);
    }
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

export function languageOf(file) {
  const ext = file.split('.').pop().toLowerCase();
  if (['js', 'mjs', 'jsx', 'ts', 'tsx', 'javascript', 'json'].includes(ext)) return 'js';
  if (['css', 'scss'].includes(ext)) return 'css';
  if (['html', 'vue', 'svelte', 'astro', 'xml', 'svg'].includes(ext)) return 'html';
  return 'text';
}

export function highlight(src, lang) {
  if (lang === 'js') return tokens(src, JS, ['tk-c', 'tk-s', 'tk-k', 'tk-n']);
  if (lang === 'css') return tokens(src, CSS, ['tk-c', 'tk-s', 'tk-k', 'tk-a', 'tk-n']);
  if (lang === 'html') return html(src);
  return esc(src);
}

// Numbered rows for the code panel.
export const numbered = (highlighted) => highlighted.replace(/\n$/, '').split('\n').map((l) => `<span class="ln">${l || ' '}</span>`).join('');

// ---------- markdown ----------

const REF = /\[(recipe|site|clone|pattern):([^\]\s]+)\]/g;

// links: { ref(kind, target) → html, href(url) → absolute url }
function inline(s, links) {
  return s.split(/(`+[^`]*?`+)/).map((part, i) => {
    if (i % 2) {
      const inner = part.replace(/^`+|`+$/g, '');
      const only = /^\[(recipe|site|clone|pattern):([^\]\s]+)\]$/.exec(inner);
      return only ? links.ref(only[1], only[2]) : `<code>${esc(inner)}</code>`;
    }
    return esc(part)
      .replace(REF, (_, kind, target) => links.ref(kind, target))
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => `<a href="${esc(links.href(url.replace(/&amp;/g, '&')))}">${text}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  }).join('');
}

const BLOCK = /^(```|#{1,6}\s|>\s?|\|)|^\s*([-*]|\d+\.)\s/;

export function markdown(src, links) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const buf = [];
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) buf.push(lines[i]);
      i++;
      out.push(`<pre tabindex="0"><code>${highlight(buf.join('\n'), languageOf(`x.${lang || 'txt'}`))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      // The dialog's title is the h2, so the README's levels start one below it.
      const n = Math.min(6, h[1].length + 1);
      out.push(`<h${n}>${inline(h[2], links)}</h${n}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]); i++) buf.push(lines[i].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(buf.join('\n'), links)}</blockquote>`);
      continue;
    }
    if (line.startsWith('|') && /^\|?\s*:?-{3,}/.test(lines[i + 1] ?? '')) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => inline(c.trim().replace(/\\\|/g, '|'), links));
      const head = cells(line);
      const rows = [];
      for (i += 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(cells(lines[i]));
      out.push(`<table tabindex="0"><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      const ordered = /\d/.test(li[2]);
      const items = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && m[1].length <= li[1].length + 1) { items.push(m[3]); i++; continue; }
        // continuation lines (and deeper items, flattened into their parent) belong to the last item
        if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length) { items[items.length - 1] += ` ${lines[i].trim().replace(/^([-*]|\d+\.)\s+/, '· ')}`; i++; continue; }
        break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t, links)}</li>`).join('')}</${tag}>`);
      continue;
    }
    const buf = [];
    for (; i < lines.length && lines[i].trim() && !(buf.length && BLOCK.test(lines[i])); i++) buf.push(lines[i].trim());
    out.push(`<p>${inline(buf.join(' '), links)}</p>`);
  }
  return out.join('\n');
}
