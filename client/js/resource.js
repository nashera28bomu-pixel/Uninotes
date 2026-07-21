// Tiny, dependency-free, XSS-safe markdown renderer. Escapes everything
// first, then reintroduces only the handful of tags we generate ourselves -
// safe to use on untrusted, imported markdown files.
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdown(raw) {
  const escaped = escapeHtml(raw);
  const lines = escaped.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.*)/);
    const listItem = line.match(/^[-*]\s+(.*)/);

    if (heading) {
      if (inList) { html += '</ul>'; inList = false; }
      const level = heading[1].length + 2; // start at h3 to stay under page title
      html += `<h${level}>${inlineFormat(heading[2])}</h${level}>`;
    } else if (listItem) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineFormat(listItem[1])}</li>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${inlineFormat(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const titleEl = document.getElementById('resource-title');
  const crumbEl = document.getElementById('crumb-resource');
  const bodyEl = document.getElementById('resource-body');

  if (!id) {
    bodyEl.innerHTML = UI.errorState({ message: 'No resource was specified.' });
    return;
  }

  let resource;
  try {
    resource = await Api.getResource(id);
  } catch (err) {
    titleEl.textContent = 'Not found';
    bodyEl.innerHTML = UI.errorState({ message: err.message });
    return;
  }

  document.title = `${resource.title} · CymorUniNotes`;
  crumbEl.textContent = resource.title;
  titleEl.textContent = resource.title;

  const subjectName = resource.subject && resource.subject.name ? resource.subject.name : '';

  const toolbar = `
    <div class="viewer__toolbar">
      <div class="viewer__meta">
        ${subjectName ? `<span>${subjectName}</span>` : ''}
        <span>👁 <span id="view-count">${resource.views ?? 0}</span></span>
        <span>⬇ <span id="download-count">${resource.downloads ?? 0}</span></span>
      </div>
      <a class="btn btn--solid" id="download-btn" href="${resource.url}" download target="_blank" rel="noopener" style="flex:none;">Download</a>
    </div>`;

  if (resource.type === 'pdf' || resource.type === 'textbook') {
    bodyEl.innerHTML = `
      <div class="viewer">
        ${toolbar}
        <iframe class="viewer__frame" src="${resource.url}" title="${resource.title}" loading="lazy"></iframe>
      </div>
      ${resource.attribution ? `<p class="attribution-note">Source: ${resource.attribution} — licensed ${resource.license}.</p>` : ''}`;
  } else if (resource.type === 'markdown') {
    bodyEl.innerHTML = `
      <div class="viewer">
        ${toolbar}
        <div id="markdown-body" style="padding:28px; max-height:72vh; overflow:auto;">Loading note...</div>
      </div>
      ${resource.attribution ? `<p class="attribution-note">Source: ${resource.attribution} — licensed ${resource.license}.</p>` : ''}`;

    try {
      const res = await fetch(resource.url);
      const text = await res.text();
      document.getElementById('markdown-body').innerHTML = renderMarkdown(text);
    } catch {
      document.getElementById('markdown-body').innerHTML = UI.errorState({ message: 'Could not load this note\u2019s content. You can still download it directly.' });
    }
  } else {
    bodyEl.innerHTML = `
      <div class="viewer">
        ${toolbar}
        <div style="padding:28px;">This resource links to an external site — use Download to open it.</div>
      </div>`;
  }

  // Register a view once per page load.
  Api.registerView(id).catch(() => {});

  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      Api.registerDownload(id).catch(() => {});
    });
  }
});
