class SiteNavigation {
  constructor() {
    this.currentPath = window.location.pathname;
    const base = '/networking-visualizations';
    this.navItems = [
      { path: base + '/', label: 'Home', icon: '🏠' },
      { path: base + '/demos/', label: 'Demos', icon: '🎮' },
      { path: base + '/tutorials/', label: 'Tutorials', icon: '📚' },
      { path: base + '/examples/', label: 'Examples', icon: '💻' }
    ];
  }
  
  render() {
    const nav = document.createElement('nav');
    nav.className = 'site-navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    const ul = document.createElement('ul');
    
    this.navItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = `${item.icon} ${item.label}`;
      a.className = this.isActive(item.path) ? 'active' : '';
      
      if (this.isActive(item.path)) {
        a.setAttribute('aria-current', 'page');
      }
      
      li.appendChild(a);
      ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    return nav;
  }
  
  isActive(path) {
    if (path === '/') {
      return this.currentPath === '/';
    }
    return this.currentPath.startsWith(path);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = new SiteNavigation();
  document.body.insertBefore(nav.render(), document.body.firstChild);
});