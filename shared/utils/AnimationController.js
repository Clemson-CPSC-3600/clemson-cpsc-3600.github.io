/**
 * AnimationController - Shared utility for managing animations across demos
 * Provides centralized animation loop management with priority-based execution
 */

export class AnimationController {
  constructor(options = {}) {
    // Animation registry
    this.animations = new Map();
    
    // State
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.currentTime = 0;
    this.deltaTime = 0;
    
    // Configuration
    this.speed = options.speed || 1.0;
    this.maxDeltaTime = options.maxDeltaTime || 100; // Cap delta time to prevent jumps
    this.targetFPS = options.targetFPS || 60;
    this.frameInterval = 1000 / this.targetFPS;
    
    // Performance monitoring
    this.frameCount = 0;
    this.fpsUpdateInterval = options.fpsUpdateInterval || 1000;
    this.lastFPSUpdate = 0;
    this.currentFPS = 0;
    
    // Callbacks
    this.onStart = options.onStart || null;
    this.onStop = options.onStop || null;
    this.onPause = options.onPause || null;
    this.onResume = options.onResume || null;
    this.onFPSUpdate = options.onFPSUpdate || null;
    
    // Bind animation loop
    this.animate = this.animate.bind(this);
  }
  
  /**
   * Register an animation
   * @param {string} id - Unique identifier for the animation
   * @param {Function} updateFn - Update function (deltaTime, currentTime) => void
   * @param {Object} options - Animation options
   * @returns {AnimationController} This controller for chaining
   */
  register(id, updateFn, options = {}) {
    if (typeof updateFn !== 'function') {
      throw new Error('Update function must be a function');
    }
    
    this.animations.set(id, {
      update: updateFn,
      enabled: options.enabled !== false,
      priority: options.priority || 0,
      beforeUpdate: options.beforeUpdate || null,
      afterUpdate: options.afterUpdate || null,
      errorHandler: options.errorHandler || null
    });
    
    return this;
  }
  
  /**
   * Unregister an animation
   * @param {string} id - Animation identifier
   * @returns {boolean} True if animation was removed
   */
  unregister(id) {
    return this.animations.delete(id);
  }
  
  /**
   * Enable/disable an animation
   * @param {string} id - Animation identifier
   * @param {boolean} enabled - Whether to enable or disable
   */
  setEnabled(id, enabled) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.enabled = enabled;
    }
  }
  
  /**
   * Check if an animation is registered
   * @param {string} id - Animation identifier
   * @returns {boolean} True if animation exists
   */
  has(id) {
    return this.animations.has(id);
  }
  
  /**
   * Start the animation loop
   */
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.lastTime = performance.now();
      this.lastFPSUpdate = this.lastTime;
      this.frameCount = 0;
      
      if (this.onStart) {
        this.onStart();
      }
      
      requestAnimationFrame(this.animate);
    }
  }
  
  /**
   * Stop the animation loop
   */
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.isPaused = false;
      
      if (this.onStop) {
        this.onStop();
      }
    }
  }
  
  /**
   * Pause the animation loop
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      
      if (this.onPause) {
        this.onPause();
      }
    }
  }
  
  /**
   * Resume the animation loop
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now(); // Reset time to prevent jump
      
      if (this.onResume) {
        this.onResume();
      }
      
      requestAnimationFrame(this.animate);
    }
  }
  
  /**
   * Toggle play/pause state
   * @returns {boolean} True if now playing, false if paused
   */
  toggle() {
    if (!this.isRunning) {
      this.start();
      return true;
    } else if (this.isPaused) {
      this.resume();
      return true;
    } else {
      this.pause();
      return false;
    }
  }
  
  /**
   * Set playback speed
   * @param {number} speed - Speed multiplier (0.1 to 10)
   */
  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(10, speed));
  }
  
  /**
   * Get current FPS
   * @returns {number} Current frames per second
   */
  getFPS() {
    return this.currentFPS;
  }
  
  /**
   * Get animation statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      fps: this.currentFPS,
      speed: this.speed,
      animationCount: this.animations.size,
      enabledCount: Array.from(this.animations.values()).filter(a => a.enabled).length
    };
  }
  
  /**
   * Main animation loop
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  animate(timestamp) {
    if (!this.isRunning || this.isPaused) return;
    
    // Calculate delta time
    const rawDeltaTime = timestamp - this.lastTime;
    
    // Cap delta time to prevent large jumps
    this.deltaTime = Math.min(rawDeltaTime, this.maxDeltaTime) * this.speed;
    this.currentTime = timestamp;
    
    // Update FPS counter
    this.frameCount++;
    const fpsDelta = timestamp - this.lastFPSUpdate;
    if (fpsDelta >= this.fpsUpdateInterval) {
      this.currentFPS = Math.round((this.frameCount * 1000) / fpsDelta);
      this.frameCount = 0;
      this.lastFPSUpdate = timestamp;
      
      if (this.onFPSUpdate) {
        this.onFPSUpdate(this.currentFPS);
      }
    }
    
    // Sort animations by priority (higher priority runs first)
    const sortedAnimations = Array.from(this.animations.entries())
      .filter(([_, anim]) => anim.enabled)
      .sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));
    
    // Execute animations
    for (const [id, animation] of sortedAnimations) {
      try {
        // Before update callback
        if (animation.beforeUpdate) {
          animation.beforeUpdate(this.deltaTime, this.currentTime);
        }
        
        // Main update
        animation.update(this.deltaTime, this.currentTime);
        
        // After update callback
        if (animation.afterUpdate) {
          animation.afterUpdate(this.deltaTime, this.currentTime);
        }
      } catch (error) {
        // Handle errors gracefully
        if (animation.errorHandler) {
          animation.errorHandler(error, id);
        } else {
          console.error(`Animation error in '${id}':`, error);
        }
      }
    }
    
    // Update last time
    this.lastTime = timestamp;
    
    // Continue animation loop
    requestAnimationFrame(this.animate);
  }
  
  /**
   * Execute a single frame (useful for testing or manual stepping)
   * @param {number} deltaTime - Optional delta time to use
   */
  step(deltaTime = 16.67) {
    const sortedAnimations = Array.from(this.animations.entries())
      .filter(([_, anim]) => anim.enabled)
      .sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));
    
    for (const [id, animation] of sortedAnimations) {
      try {
        animation.update(deltaTime * this.speed, this.currentTime);
      } catch (error) {
        if (animation.errorHandler) {
          animation.errorHandler(error, id);
        } else {
          console.error(`Animation error in '${id}':`, error);
        }
      }
    }
    
    this.currentTime += deltaTime;
  }
  
  /**
   * Clear all animations
   */
  clear() {
    this.stop();
    this.animations.clear();
  }
  
  /**
   * Create a simple tween animation
   * @param {string} id - Animation ID
   * @param {Object} target - Object to animate
   * @param {Object} properties - Properties to animate
   * @param {number} duration - Duration in milliseconds
   * @param {Object} options - Tween options
   * @returns {Promise} Promise that resolves when tween completes
   */
  tween(id, target, properties, duration, options = {}) {
    return new Promise((resolve) => {
      const startValues = {};
      const endValues = {};
      let elapsed = 0;
      
      // Store initial values
      for (const prop in properties) {
        startValues[prop] = target[prop];
        endValues[prop] = properties[prop];
      }
      
      // Easing function (default to linear)
      const easing = options.easing || ((t) => t);
      
      // Register the tween animation
      this.register(id, (deltaTime) => {
        elapsed += deltaTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        // Update properties
        for (const prop in properties) {
          const start = startValues[prop];
          const end = endValues[prop];
          target[prop] = start + (end - start) * easedProgress;
        }
        
        // Check if complete
        if (progress >= 1) {
          this.unregister(id);
          if (options.onComplete) {
            options.onComplete();
          }
          resolve();
        }
      }, {
        priority: options.priority || 0
      });
      
      // Auto-start if not running
      if (!this.isRunning && options.autoStart !== false) {
        this.start();
      }
    });
  }
  
  /**
   * Common easing functions
   */
  static Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
      return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    easeInElastic: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
    },
    easeOutElastic: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  };
}

/**
 * RequestAnimationFrame polyfill for older browsers
 */
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
}