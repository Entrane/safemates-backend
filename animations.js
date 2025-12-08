/* ============================================================================
   MATCHMATES - ANIMATIONS & INTERACTIONS
   Animations fluides, transitions et interactions utilisateur
   ============================================================================ */

(function() {
  'use strict';

  // ===== INITIALISATION =====
  document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initHeaderScroll();
    initDropdowns();
    initTabs();
    initModals();
    initTooltips();
    initLazyLoading();
    initSmoothScroll();
    initCardHoverEffects();
    initFormEnhancements();
    initCountUpAnimations();
  });

  // ===== ANIMATIONS AU SCROLL =====
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    // Observer tous les éléments avec l'attribut data-animate
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    // Animation des cartes au scroll
    document.querySelectorAll('.card, .game-card, .stat-card').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.animationDelay = `${index * 0.1}s`;
      observer.observe(el);
    });
  }

  // ===== HEADER AVEC EFFET DE SCROLL =====
  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Ajouter la classe 'scrolled' quand on scroll
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Masquer le header quand on scroll vers le bas (optionnel)
      // if (currentScroll > lastScroll && currentScroll > 200) {
      //   header.style.transform = 'translateY(-100%)';
      // } else {
      //   header.style.transform = 'translateY(0)';
      // }

      lastScroll = currentScroll;
    });
  }

  // ===== DROPDOWNS =====
  function initDropdowns() {
    document.querySelectorAll('[data-dropdown-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = toggle.getAttribute('data-dropdown-toggle');
        const dropdown = document.querySelector(`[data-dropdown="${targetId}"]`);

        if (!dropdown) return;

        // Fermer les autres dropdowns
        document.querySelectorAll('.dropdown').forEach((d) => {
          if (d !== dropdown.parentElement) {
            d.classList.remove('open');
          }
        });

        // Toggle le dropdown actuel
        dropdown.parentElement.classList.toggle('open');
      });
    });

    // Fermer les dropdowns en cliquant en dehors
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach((d) => {
        d.classList.remove('open');
      });
    });
  }

  // ===== TABS =====
  function initTabs() {
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        const tabGroup = tab.closest('[data-tab-group]');

        if (!tabGroup) return;

        // Désactiver tous les tabs et contenus
        tabGroup.querySelectorAll('[data-tab]').forEach((t) => {
          t.classList.remove('active');
        });

        tabGroup.querySelectorAll('[data-tab-content]').forEach((c) => {
          c.classList.remove('active');
        });

        // Activer le tab et le contenu sélectionné
        tab.classList.add('active');
        const content = tabGroup.querySelector(`[data-tab-content="${tabName}"]`);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }

  // ===== MODALS =====
  function initModals() {
    // Ouvrir les modals
    document.querySelectorAll('[data-modal-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-open');
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if (modal) {
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';

          // Animation d'entrée
          setTimeout(() => {
            modal.style.opacity = '1';
          }, 10);
        }
      });
    });

    // Fermer les modals
    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('[data-modal]');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    // Fermer en cliquant sur le backdrop
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeModal(backdrop);
        }
      });
    });

    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-modal]').forEach((modal) => {
          if (modal.style.display === 'flex') {
            closeModal(modal);
          }
        });
      }
    });
  }

  function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  // ===== TOOLTIPS =====
  function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        // Tooltip déjà géré par CSS
      });
    });
  }

  // ===== LAZY LOADING IMAGES =====
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ===== EFFETS HOVER SUR LES CARTES =====
  function initCardHoverEffects() {
    document.querySelectorAll('.game-card, .card, .profile-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        // Effet 3D subtil (désactiver si trop intense)
        // card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== AMÉLIORATIONS DES FORMULAIRES =====
  function initFormEnhancements() {
    // Animation des labels flottants
    document.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
      const label = input.previousElementSibling;

      input.addEventListener('focus', () => {
        if (label && label.classList.contains('form-label')) {
          label.style.transform = 'translateY(-5px)';
          label.style.fontSize = '0.85rem';
          label.style.color = 'var(--primary-color)';
        }
      });

      input.addEventListener('blur', () => {
        if (label && label.classList.contains('form-label') && !input.value) {
          label.style.transform = '';
          label.style.fontSize = '';
          label.style.color = '';
        }
      });
    });

    // Indicateur de force du mot de passe
    document.querySelectorAll('input[type="password"]').forEach((input) => {
      input.addEventListener('input', () => {
        const strength = calculatePasswordStrength(input.value);
        // Vous pouvez ajouter un indicateur visuel ici
      });
    });

    // Validation en temps réel
    document.querySelectorAll('.form-input[required]').forEach((input) => {
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.classList.add('invalid');
          input.classList.remove('valid');
        } else {
          input.classList.add('valid');
          input.classList.remove('invalid');
        }
      });
    });
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  }

  // ===== ANIMATIONS COUNT UP =====
  function initCountUpAnimations() {
    const animateValue = (element, start, end, duration) => {
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          element.textContent = Math.round(end);
          clearInterval(timer);
        } else {
          element.textContent = Math.round(current);
        }
      }, 16);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const endValue = parseInt(el.getAttribute('data-count'));
            if (endValue) {
              animateValue(el, 0, endValue, 2000);
              observer.unobserve(el);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-count]').forEach((el) => {
      observer.observe(el);
    });
  }

  // ===== ANIMATIONS DE TEXTE =====
  function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  // ===== PARTICULES DE FOND (OPTIONNEL) =====
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Dessiner les connexions entre particules proches
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(34, 197, 94, ${1 - distance / 100})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // Décommenter pour activer les particules (peut impacter les performances)
  // initParticles();

  // ===== NOTIFICATIONS TOAST =====
  window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideInFromRight 0.5s ease-out;
      max-width: 400px;
    `;

    const colors = {
      success: 'var(--primary-color)',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.style.borderLeftWidth = '4px';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutToRight 0.5s ease-out';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, duration);
  };

  // ===== UTILITAIRES GLOBAUX =====
  window.MatchMatesUI = {
    showToast,
    closeModal,
    typeWriter
  };

})();
