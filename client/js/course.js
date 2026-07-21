document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const titleEl = document.getElementById('course-title');
  const descEl = document.getElementById('course-desc');
  const crumbEl = document.getElementById('crumb-course');
  const listEl = document.getElementById('semester-list');
  const headEl = document.querySelector('.section__head h2');

  if (!slug) {
    titleEl.innerHTML = 'Course not specified';
    listEl.innerHTML = UI.errorState({ message: 'No course was selected. Go back to the homepage and pick a field.' });
    return;
  }

  try {
    const course = await Api.getCourse(slug);
    document.title = `${course.name} · CymorUniNotes`;
    crumbEl.textContent = course.name;
    titleEl.innerHTML = `<span class="page-head__icon">${course.icon || '📚'}</span> ${course.name}`;
    descEl.textContent = course.description || '';
    headEl.textContent = slug === 'medicine-and-surgery' ? 'Years' : 'Semesters';
  } catch (err) {
    titleEl.textContent = 'Course not found';
    listEl.innerHTML = UI.errorState({ message: err.message });
    return;
  }

  try {
    const { data: semesters } = await Api.getSemesters(slug);
    listEl.innerHTML = semesters.length
      ? semesters.map((s) => UI.semesterCard(s, slug)).join('')
      : UI.emptyState({ title: 'Nothing here yet', message: 'Run the seed script on the backend to populate this course.' });
  } catch (err) {
    listEl.innerHTML = UI.errorState({ message: err.message });
  }
});
