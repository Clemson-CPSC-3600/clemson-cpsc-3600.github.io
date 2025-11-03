/**
 * Breadcrumb Component
 * Creates breadcrumb navigation for site pages
 */

export class Breadcrumb {
  /**
   * Create breadcrumb navigation from URL path
   * @param {string} [customPath] - Optional custom path (defaults to current location)
   * @returns {HTMLElement} Breadcrumb navigation element
   */
  static create(customPath = null) {
    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');

    const path = customPath || window.location.pathname;
    const parts = path.split('/').filter(p => p && p !== 'index.html');

    // Always start with home
    const links = ['<a href="/">Home</a>'];

    // Build path progressively
    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 1;

      // Format the part name (convert kebab-case to Title Case)
      const displayName = Breadcrumb.formatName(part);

      if (isLast) {
        // Last item is not a link
        links.push(`<span>${displayName}</span>`);
      } else {
        // Intermediate items are links
        links.push(`<a href="${currentPath}/">${displayName}</a>`);
      }
    });

    nav.innerHTML = links.join(' / ');
    return nav;
  }

  /**
   * Format a path segment into a readable name
   * @param {string} segment - Path segment (e.g., "module1-big-picture" or "01-internet-structure")
   * @returns {string} Formatted name
   */
  static formatName(segment) {
    // Remove leading numbers and hyphens (e.g., "01-" or "module1-")
    let cleaned = segment.replace(/^\d+-/, '').replace(/^module\d+-/, 'Module ');

    // Convert kebab-case to Title Case
    return cleaned
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Create breadcrumb from custom segments
   * @param {Array<{label: string, href?: string}>} segments - Array of breadcrumb segments
   * @returns {HTMLElement} Breadcrumb navigation element
   */
  static createCustom(segments) {
    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');

    const links = segments.map((segment, index) => {
      const isLast = index === segments.length - 1;

      if (isLast || !segment.href) {
        return `<span>${segment.label}</span>`;
      } else {
        return `<a href="${segment.href}">${segment.label}</a>`;
      }
    });

    nav.innerHTML = links.join(' / ');
    return nav;
  }

  /**
   * Render breadcrumb into a container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string} [customPath] - Optional custom path
   */
  static render(container, customPath = null) {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('Breadcrumb: Container not found');
      return;
    }

    const breadcrumb = Breadcrumb.create(customPath);
    containerEl.appendChild(breadcrumb);
  }

  /**
   * Update existing breadcrumb
   * @param {HTMLElement} breadcrumbEl - Existing breadcrumb element
   * @param {string} [newPath] - New path to display
   */
  static update(breadcrumbEl, newPath = null) {
    const newBreadcrumb = Breadcrumb.create(newPath);
    breadcrumbEl.innerHTML = newBreadcrumb.innerHTML;
  }
}

export default Breadcrumb;
