document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const name = params.get('name') || 'Subject';

  const titleEl = document.getElementById('subject-title');
  const descEl = document.getElementById('subject-desc');
  const crumbEl = document.getElementById('crumb-subject');
  const listEl = document.getElementById('resource-list');

  crumbEl.textContent = name;
  titleEl.textContent = name;
  document.title = `${name} · CymorUniNotes`;

  if (!slug) {
    listEl.innerHTML = UI.errorState({ message: 'No subject was specified.' });
    return;
  }

  try {
    const resources = await Api.getResourcesForSubject(slug);
    descEl.textContent = resources.length
      ? `${resources.length} resource${resources.length === 1 ? '' : 's'} available for this subject.`
      : '';
    listEl.innerHTML = resources.length
      ? resources.map(UI.resourceCard).join('')
      : UI.emptyState({ icon: '🗂️', title: 'No notes here yet', message: 'This subject hasn\u2019t received any imported resources yet. Check back soon.' });
  } catch (err) {
    listEl.innerHTML = UI.errorState({ message: err.message });
  }
});
