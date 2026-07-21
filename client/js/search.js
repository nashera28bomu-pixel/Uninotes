document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  const headingEl = document.getElementById('search-heading');
  const coursesEl = document.getElementById('search-courses');
  const subjectsEl = document.getElementById('search-subjects');
  const resourcesEl = document.getElementById('search-resources');
  const inputEl = document.getElementById('search-input');

  inputEl.value = q;
  headingEl.textContent = q ? `Results for “${q}”` : 'Search';

  if (!q) {
    coursesEl.innerHTML = '';
    subjectsEl.innerHTML = UI.emptyState({ icon: '🔍', title: 'Type something to search', message: 'Search across courses, subjects, and resources.' });
    resourcesEl.innerHTML = '';
    return;
  }

  [coursesEl, subjectsEl, resourcesEl].forEach((el) => {
    el.innerHTML = '<div class="skeleton skeleton--row"></div>';
  });

  try {
    const { courses, subjects, resources } = await Api.search(q);

    coursesEl.innerHTML = courses.length
      ? courses.map(UI.courseCard).join('')
      : UI.emptyState({ title: 'No matching courses', message: 'Try a different search term.' });

    subjectsEl.innerHTML = subjects.length
      ? subjects.map(subjectResultCard).join('')
      : UI.emptyState({ title: 'No matching subjects', message: 'Try a different search term.' });

    resourcesEl.innerHTML = resources.length
      ? resources.map(UI.resourceCard).join('')
      : UI.emptyState({ icon: '🗂️', title: 'No matching notes', message: 'Try a different search term.' });
  } catch (err) {
    coursesEl.innerHTML = '';
    subjectsEl.innerHTML = UI.errorState({ message: err.message });
    resourcesEl.innerHTML = '';
  }
});

function subjectResultCard(subject) {
  const courseName = subject.semester && subject.semester.course ? subject.semester.course.name : '';
  const semesterName = subject.semester ? subject.semester.name : '';
  return `
    <a class="subject-card" href="subject.html?slug=${subject.slug}&name=${encodeURIComponent(subject.name)}">
      <span class="subject-card__name">${subject.name}</span>
      ${courseName ? `<span class="subject-card__code">${courseName} · ${semesterName}</span>` : ''}
      <span class="subject-card__arrow" aria-hidden="true">→</span>
    </a>`;
}
