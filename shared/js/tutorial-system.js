class TutorialSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sections = [];
    this.currentSection = 0;
    this.progress = 0;
    
    this.init();
  }
  
  init() {
    this.loadSections();
    this.createProgressBar();
    this.createNavigation();
    this.bindEvents();
  }
  
  loadSections() {
    this.sections = Array.from(
      this.container.querySelectorAll('.tutorial-section')
    );
  }
  
  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'tutorial-progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="progress-text">
        <span class="current-step">1</span> / 
        <span class="total-steps">${this.sections.length}</span>
      </div>
    `;
    
    this.container.insertBefore(progressBar, this.container.firstChild);
    this.progressBar = progressBar.querySelector('.progress-fill');
  }
  
  createNavigation() {
    const nav = document.createElement('div');
    nav.className = 'tutorial-nav';
    nav.innerHTML = `
      <button class="nav-prev" disabled>← Previous</button>
      <button class="nav-next">Next →</button>
    `;
    
    this.container.appendChild(nav);
    this.prevBtn = nav.querySelector('.nav-prev');
    this.nextBtn = nav.querySelector('.nav-next');
  }
  
  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.goToPrevious());
    this.nextBtn.addEventListener('click', () => this.goToNext());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goToPrevious();
      if (e.key === 'ArrowRight') this.goToNext();
    });
  }
  
  updateProgress() {
    this.progress = ((this.currentSection + 1) / this.sections.length) * 100;
    this.progressBar.style.width = `${this.progress}%`;
    
    document.querySelector('.current-step').textContent = this.currentSection + 1;
    
    this.prevBtn.disabled = this.currentSection === 0;
    this.nextBtn.disabled = this.currentSection === this.sections.length - 1;
    
    this.sections.forEach((section, i) => {
      section.style.display = i === this.currentSection ? 'block' : 'none';
    });
  }
  
  goToNext() {
    if (this.currentSection < this.sections.length - 1) {
      this.currentSection++;
      this.updateProgress();
      this.scrollToTop();
    }
  }
  
  goToPrevious() {
    if (this.currentSection > 0) {
      this.currentSection--;
      this.updateProgress();
      this.scrollToTop();
    }
  }
  
  scrollToTop() {
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}