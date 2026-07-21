// Thin wrapper around fetch - every call returns the API's `data` payload
// directly and throws a plain Error with a readable message on failure, so
// page scripts don't need to repeat status-checking logic everywhere.
const Api = (() => {
  const BASE = window.CYMOR_CONFIG.API_BASE_URL;

  async function request(path, options = {}) {
    let res;
    try {
      res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
    } catch (networkErr) {
      throw new Error('Could not reach the server. Check your connection and try again.');
    }

    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      throw new Error((body && body.message) || `Request failed (${res.status})`);
    }

    return body;
  }

  return {
    getCourses: () => request('/courses').then((r) => r.data),
    getCourse: (slug) => request(`/courses/${slug}`).then((r) => r.data),
    getSemesters: (slug) => request(`/courses/${slug}/semesters`).then((r) => r),
    getSubjects: (semesterId) => request(`/semesters/${semesterId}/subjects`).then((r) => r),
    getResourcesForSubject: (slug) => request(`/subjects/${slug}/resources`).then((r) => r.data),
    getResource: (id) => request(`/resources/${id}`).then((r) => r.data),
    listResources: (sort, limit = 6) => request(`/resources?sort=${sort}&limit=${limit}`).then((r) => r.data),
    registerView: (id) => request(`/resources/${id}/view`, { method: 'POST' }),
    registerDownload: (id) => request(`/resources/${id}/download`, { method: 'POST' }),
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
  };
})();
