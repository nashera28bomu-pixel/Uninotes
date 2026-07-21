// Shared render helpers used by every page script. Keeping these in one
// place means a card or empty-state only needs to look right once.
const UI = (() => {
  function el(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  function skeletonRow(count, className) {
    return Array.from({ length: count })
      .map(() => `<div class="skeleton ${className}"></div>`)
      .join('');
  }

  function emptyState({ icon = '📭', title, message }) {
    return `
      <div class="state-panel">
        <div class="state-icon" aria-hidden="true">${icon}</div>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>`;
  }

  function errorState({ message = 'Something went wrong.' }) {
    return `
      <div class="state-panel state-panel--error">
        <div class="state-icon" aria-hidden="true">⚠️</div>
        <h3>Couldn't load this</h3>
        <p>${message}</p>
      </div>`;
  }

  function courseCard(course) {
    return `
      <a class="course-card" href="course.html?slug=${course.slug}" data-field="${course.slug}">
        <span class="course-card__icon">${course.icon || '📚'}</span>
        <span class="course-card__body">
          <span class="course-card__name">${course.name}</span>
          <span class="course-card__desc">${course.description || ''}</span>
        </span>
        <span class="course-card__arrow" aria-hidden="true">→</span>
      </a>`;
  }

  function semesterCard(semester, courseSlug) {
    return `
      <a class="semester-card" href="semester.html?id=${semester._id}&course=${courseSlug}&name=${encodeURIComponent(semester.name)}">
        <span class="semester-card__order">${String(semester.order).padStart(2, '0')}</span>
        <span class="semester-card__name">${semester.name}</span>
        <span class="semester-card__arrow" aria-hidden="true">→</span>
      </a>`;
  }

  function subjectCard(subject) {
    return `
      <a class="subject-card" href="subject.html?slug=${subject.slug}&name=${encodeURIComponent(subject.name)}">
        <span class="subject-card__name">${subject.name}</span>
        ${subject.code ? `<span class="subject-card__code">${subject.code}</span>` : ''}
        ${subject.description ? `<span class="subject-card__desc">${subject.description}</span>` : ''}
        <span class="subject-card__arrow" aria-hidden="true">→</span>
      </a>`;
  }

  const TYPE_LABEL = { pdf: 'PDF', markdown: 'Notes', textbook: 'Textbook', link: 'Link' };

  function resourceCard(resource) {
    const subjectName = resource.subject && resource.subject.name ? resource.subject.name : '';
    return `
      <article class="resource-card">
        <div class="resource-card__top">
          <span class="badge badge--${resource.type}">${TYPE_LABEL[resource.type] || resource.type}</span>
          ${subjectName ? `<span class="resource-card__subject">${subjectName}</span>` : ''}
        </div>
        <h3 class="resource-card__title">${resource.title}</h3>
        <div class="resource-card__stats">
          <span>👁 ${resource.views ?? 0}</span>
          <span>⬇ ${resource.downloads ?? 0}</span>
        </div>
        <div class="resource-card__actions">
          <a class="btn btn--ghost" href="resource.html?id=${resource._id}">Preview</a>
          <a class="btn btn--solid" href="${resource.url}" download data-download-id="${resource._id}" target="_blank" rel="noopener">Download</a>
        </div>
      </article>`;
  }

  return {
    el,
    skeletonRow,
    emptyState,
    errorState,
    courseCard,
    semesterCard,
    subjectCard,
    resourceCard,
  };
})();
