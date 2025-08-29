class CodeViewer {
  constructor(element) {
    this.element = element;
    this.config = {
      language: element.dataset.language || 'javascript',
      filename: element.dataset.filename,
      highlights: element.dataset.highlights?.split(',').map(Number) || [],
      showLineNumbers: element.dataset.lineNumbers !== 'false'
    };
    
    this.enhance();
  }
  
  enhance() {
    this.addHeader();
    if (this.config.showLineNumbers) {
      this.addLineNumbers();
    }
    this.highlightLines();
    this.addCopyButton();
  }
  
  addHeader() {
    const header = document.createElement('div');
    header.className = 'code-header';
    
    if (this.config.filename) {
      const filename = document.createElement('span');
      filename.className = 'code-filename';
      filename.textContent = this.config.filename;
      header.appendChild(filename);
    }
    
    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = this.config.language;
    header.appendChild(language);
    
    this.element.insertBefore(header, this.element.firstChild);
  }
  
  addLineNumbers() {
    const code = this.element.querySelector('code');
    const lines = code.textContent.split('\n');
    
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');
    
    lines.forEach((_, i) => {
      const num = document.createElement('div');
      num.textContent = i + 1;
      if (this.config.highlights.includes(i + 1)) {
        num.className = 'highlighted';
      }
      lineNumbers.appendChild(num);
    });
    
    wrapper.appendChild(lineNumbers);
    code.parentElement.insertBefore(wrapper, code);
    wrapper.appendChild(code.parentElement.removeChild(code));
  }
  
  highlightLines() {
    if (this.config.highlights.length === 0) return;
    
    const code = this.element.querySelector('code');
    const lines = code.innerHTML.split('\n');
    
    const highlighted = lines.map((line, i) => {
      if (this.config.highlights.includes(i + 1)) {
        return `<span class="highlight-line">${line}</span>`;
      }
      return line;
    }).join('\n');
    
    code.innerHTML = highlighted;
  }
  
  addCopyButton() {
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.textContent = '📋 Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    button.addEventListener('click', () => this.copyCode());
    
    const header = this.element.querySelector('.code-header');
    header.appendChild(button);
  }
  
  async copyCode() {
    const code = this.element.querySelector('code').textContent;
    const button = this.element.querySelector('.code-copy-btn');
    
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = '✅ Copied!';
      setTimeout(() => {
        button.textContent = '📋 Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      button.textContent = '❌ Failed';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-component="code-viewer"]').forEach(el => {
    new CodeViewer(el);
  });
});