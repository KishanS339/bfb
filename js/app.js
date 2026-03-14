/* ============================================
   NagaraSeva — Shared Application Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Hamburger Menu Toggle ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
  }

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // ── Intersection Observer for Entrance Animations ──
  const animateElements = document.querySelectorAll('.animate-in');
  if (animateElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
  }

  // ── 3D Tilt Effect ──
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    const inner = card.querySelector('.tilt-card-inner') || card;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // ── Skeleton Loader Simulation ──
  const skeletonContainers = document.querySelectorAll('[data-skeleton]');
  skeletonContainers.forEach(container => {
    const delay = parseInt(container.dataset.skeleton) || 1500;
    const skeleton = container.querySelector('.skeleton-wrapper');
    const content = container.querySelector('.content-wrapper');
    
    if (skeleton && content) {
      content.style.display = 'none';
      setTimeout(() => {
        skeleton.style.opacity = '0';
        setTimeout(() => {
          skeleton.style.display = 'none';
          content.style.display = '';
          content.style.animation = 'fadeInUp 0.4s ease forwards';
        }, 300);
      }, delay);
    }
  });

  // ── Counter Animation ──
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = parseInt(el.dataset.duration) || 1500;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, duration, prefix, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target, duration, prefix, suffix) {
    const start = performance.now();
    const startVal = 0;
    
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // ── Ripple Effect ──
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── Smooth Tab Switching ──
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const parent = tabGroup.parentElement;
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const target = btn.dataset.tab;
        if (target && parent) {
          parent.querySelectorAll('.tab-panel').forEach(panel => {
            panel.style.display = panel.id === target ? '' : 'none';
            if (panel.id === target) {
              panel.style.animation = 'fadeInUp 0.3s ease forwards';
            }
          });
        }
      });
    });
  });

  // ── Filter Pills ──
  document.querySelectorAll('.filter-pills').forEach(pillGroup => {
    const pills = pillGroup.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.dataset.filterGroup === 'single') {
          pills.forEach(p => p.classList.remove('active'));
        }
        pill.classList.toggle('active');
      });
    });
  });

  // ── Toast Notification Helper ──
  window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size: 18px">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── Active Nav Highlight ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // ── Form Validation Helpers ──
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      
      form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = 'var(--color-danger)';
          input.addEventListener('input', function handler() {
            if (this.value.trim()) {
              this.style.borderColor = '';
              this.removeEventListener('input', handler);
            }
          });
        }
      });
      
      if (valid) {
        window.showToast('Form submitted successfully!', 'success');
      } else {
        window.showToast('Please fill in all required fields.', 'error');
      }
    });
  });

  // ── Search Filter ──
  document.querySelectorAll('.search-bar input').forEach(input => {
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const targetSelector = input.dataset.searchTarget;
      if (!targetSelector) return;
      
      document.querySelectorAll(targetSelector).forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });

});
