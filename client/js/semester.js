document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const semesterId = params.get('id');
  const courseSlug = params.get('course');
  const semesterName = params.get('name') || 'Semester';

  const titleEl = document.getElementById('semester-title');
  const listEl = document.getElementById('subject-list');
  const crumbCourse = document.getElementById('crumb-course');
  const crumbSemester = document.getElementById('crumb-semester');

  if (courseSlug) {
    crumbCourse.href = `course.html?slug=${courseSlug}`;
    crumbCourse.textContent = courseSlug === 'medicine-and-surgery' ? 'Medicine and Surgery' : 'Computer Science';
  }
  crumbSemester.textContent = semesterName;
  titleEl.textContent = semesterName;
  document.title = `${semesterName} · CymorUniNotes`;

  if (!semesterId) {
    listEl.innerHTML = UI.errorState({ message: 'No semester was specified. Go back and pick one from the course page.' });
    return;
  }

  try {
    const { data: subjects } = await Api.getSubjects(semesterId);
    listEl.innerHTML = subjects.length
      ? subjects.map(UI.subjectCard).join('')
      : UI.emptyState({ title: 'No subjects yet', message: 'This semester hasn\u2019t been populated in the backend seed data.' });
  } catch (err) {
    listEl.innerHTML = UI.errorState({ message: err.message });
  }
});
