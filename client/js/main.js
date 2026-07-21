document.addEventListener('DOMContentLoaded', async () => {
  const courseGrid = document.getElementById('course-grid');
  const recentEl = document.getElementById('recent-resources');
  const popularEl = document.getElementById('popular-resources');

  try {
    const courses = await Api.getCourses();
    courseGrid.innerHTML = courses.length
      ? courses.map(UI.courseCard).join('')
      : UI.emptyState({ title: 'No courses yet', message: 'Run the seed script on the backend to add Computer Science and Medicine and Surgery.' });
  } catch (err) {
    courseGrid.innerHTML = UI.errorState({ message: err.message });
  }

  try {
    const recent = await Api.listResources('recent', 8);
    recentEl.innerHTML = recent.length
      ? recent.map(UI.resourceCard).join('')
      : UI.emptyState({ icon: '🗂️', title: 'Nothing imported yet', message: 'Run `npm run import` on the backend to pull in notes.' });
  } catch (err) {
    recentEl.innerHTML = UI.errorState({ message: err.message });
  }

  try {
    const popular = await Api.listResources('popular', 8);
    popularEl.innerHTML = popular.length
      ? popular.map(UI.resourceCard).join('')
      : UI.emptyState({ icon: '⭐', title: 'No stats yet', message: 'Popular notes will appear here as students view and download resources.' });
  } catch (err) {
    popularEl.innerHTML = UI.errorState({ message: err.message });
  }
});
