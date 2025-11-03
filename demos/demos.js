/**
 * Demos page interactivity
 */

// Add smooth scroll behavior for any internal links
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add loading animation when clicking demo links
  document.querySelectorAll('.demo-card a.btn-primary').forEach(link => {
    link.addEventListener('click', function(e) {
      // Don't prevent default - we want the navigation to happen
      // Just add a visual effect
      const card = this.closest('.demo-card');
      if (card) {
        card.classList.add('loading');
      }
    });
  });

  // Add hover effect for feature tags
  document.querySelectorAll('.feature-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.2s';
    });
    
    tag.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Show a tooltip for coming soon items
  document.querySelectorAll('.demo-card.coming-soon').forEach(card => {
    card.addEventListener('mouseenter', function() {
      const button = this.querySelector('.btn-disabled');
      if (button && !button.dataset.tooltipAdded) {
        button.dataset.tooltipAdded = 'true';
        button.setAttribute('title', 'This demo is currently under development');
      }
    });
  });

  // Track demo card views (for analytics if needed)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        if (!card.dataset.viewed) {
          card.dataset.viewed = 'true';
          // Could send analytics here
          console.log(`Demo card viewed: ${card.querySelector('h2')?.textContent}`);
        }
      }
    });
  }, observerOptions);

  // Observe all demo cards
  document.querySelectorAll('.demo-card').forEach(card => {
    observer.observe(card);
  });

  // Add keyboard navigation for demo cards
  const demoCards = Array.from(document.querySelectorAll('.demo-card:not(.coming-soon) a.btn-primary'));
  let currentFocus = -1;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Let default tab behavior work
      return;
    }
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      currentFocus = (currentFocus + 1) % demoCards.length;
      demoCards[currentFocus]?.focus();
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      currentFocus = currentFocus <= 0 ? demoCards.length - 1 : currentFocus - 1;
      demoCards[currentFocus]?.focus();
    }
  });

  // Update year in footer if needed
  const currentYear = new Date().getFullYear();
  const footerYear = document.querySelector('.site-footer p');
  if (footerYear && !footerYear.textContent.includes(currentYear.toString())) {
    footerYear.textContent = footerYear.textContent.replace(/\d{4}/, currentYear.toString());
  }
});

// Export for potential use by other modules
export default {
  initDemos: () => {
    console.log('Demos page initialized');
  }
};