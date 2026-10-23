// Small, strict HTML string helpers for the build-time transform. The pages are hand-written, well-formed HTML, so
// matching an element's own closing tag by depth is enough; anything unexpected stops the build.
import { fail } from './collect.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Markdown inline code and bold as the plugin's JSON and reports write them, escaped.
export const inline = (s) => esc(String(s).replace(/\*\*(.+?)\*\*/g, '$1')).replace(/`([^`]+)`/g, '<code>$1</code>');

// Every element whose opening tag carries `attr`, with the span of its inner HTML.
export function elementsWith(html, attr) {
  const out = [];
  const open = new RegExp(`<([a-z][a-z0-9-]*)\\b([^>]*?\\s${attr}="([^"]*)"[^>]*)>`, 'gi');
  for (const m of html.matchAll(open)) {
    const tag = m[1].toLowerCase();
    const start = m.index;
    const innerStart = start + m[0].length;
    if (/^(meta|link|img|base|input|br|hr|source)$/.test(tag)) {
      out.push({ tag, start, end: innerStart, innerStart, innerEnd: innerStart, value: m[3], openTag: m[0], void: true });
      continue;
    }
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = innerStart;
    let depth = 1;
    let close = null;
    for (let t; (t = re.exec(html));) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { close = t; break; }
    }
    if (!close) fail(`no closing </${tag}> for ${m[0].slice(0, 80)}`);
    out.push({ tag, start, end: close.index + close[0].length, innerStart, innerEnd: close.index, value: m[3], openTag: m[0] });
  }
  return out;
}

// Applies edits ({ start, end, text }) from the end of the string backwards, so earlier offsets stay valid.
export function splice(html, edits) {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  for (let i = 1; i < sorted.length; i++) if (sorted[i].end > sorted[i - 1].start) fail('overlapping edits in one page');
  let out = html;
  for (const e of sorted) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

// `<!-- @fact:name … -->…<!-- /@fact -->` regions: the build replaces everything between the two comments.
export function replaceRegions(html, render) {
  // The inner part never runs past another opening comment, so a stray one-line fact cannot swallow a region.
  return html.replace(/<!-- @fact:([a-z0-9-]+)\b[^]*?-->((?:(?!<!-- @fact:)[^])*?)<!-- \/@fact -->/g, (whole, name, inner) => {
    const out = render(name, inner);
    if (out === undefined) fail(`unknown fact region @fact:${name}`);
    return `<!-- @fact:${name} -->${out}<!-- /@fact -->`;
  });
}

// `<!-- @name … -->` single comments (proof slots and one-line facts), with their key="value" pairs.
export function replaceSlots(html, prefix, render) {
  const re = new RegExp(`([ \\t]*)<!-- @${prefix}:([a-z0-9-]+)\\b([^]*?)-->`, 'g');
  return html.replace(re, (whole, indent, name, rest) => {
    const params = Object.fromEntries([...rest.matchAll(/([a-z]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const out = render(name, params, indent);
    if (out === undefined) fail(`unknown slot @${prefix}:${name}`);
    return out ? indent + out : '';
  });
}

// Commands and paths break only at their spaces and after an inner "/" (ship, jury 2026-10-22 craft 2): every <code>
// that holds plain text gets a <wbr> after each "/" inside a word, and each piece that the browser could otherwise
// split (at a hyphen or a dash, a "|", "?", "!" or "%") is kept whole in a span.nobr. The text a Copy button reads
// is unchanged.
const BREAKS_INSIDE = /[-\u2013\u2014|?!%]/;
export function breakCode(html) {
  const body = /<body\b[^>]*>/.exec(html);
  if (!body) return html;
  const from = body.index + body[0].length;
  const head = html.slice(0, from);
  const rest = html.slice(from).replace(/<code\b([^>]*)>([^<]+)<\/code>/g, (whole, attrs, text) => {
    if (!/[\s/\u2013\u2014-]/.test(text)) return whole;
    const words = text.split(/( +)/).map((part) => {
      if (/^ +$/.test(part) || !part) return part;
      const pieces = part.split(/(?<=[^/\s]\/)(?=[^/])/);
      return pieces.map((p) => (BREAKS_INSIDE.test(p) ? `<span class="nobr">${p}</span>` : p)).join('<wbr>');
    });
    return `<code${attrs}>${words.join('')}</code>`;
  });
  return head + rest;
}

// The text of an element with its tags removed and entities decoded (enough for the pages' own markup).
export const textOf = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
