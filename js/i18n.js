/* ============================================
   NagaraSeva — i18n (Internationalization)
   ============================================ */

const translations = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.my_grievances': 'My Grievances',
    'nav.report_issue': 'Report Issue',
    'nav.city_map': 'City Map',
    'nav.admin_panel': 'Admin Panel',
    'nav.login': 'Login / Signup',
    'nav.admin': 'Admin',
    
    // Auth
    'auth.login.title': 'Sign In',
    'auth.signup.title': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullname': 'Full Name',
    'auth.phone': 'Phone',

    // Hero / Index
    'hero.label': 'EMPOWERING BENGALURU CITIZENS',
    'hero.title.line1': 'Your Voice.',
    'hero.title.line2': 'Your City.',
    'hero.title.line3': 'Your Power.',
    'hero.subtitle': 'Report civic grievances, track resolutions in real-time, and help build a smarter, cleaner Bengaluru with AI-powered insights.',
    'hero.report_btn': '🚨 Report a Grievance',
    'hero.track_btn': '📋 Track My Issues',
    
    // Stats
    'stat.filed': 'Grievances Filed',
    'stat.resolved': 'Issues Resolved',
    'stat.wards': 'Wards Covered',
    'stat.avg_time': 'Avg Resolution',

    // Lang Modal
    'modal.select_lang': 'Select Your Language',
    'modal.proceed': 'Proceed →'
  },
  kn: {
    // Nav
    'nav.home': 'ಮುಖಪುಟ',
    'nav.my_grievances': 'ನನ್ನ ದೂರುಗಳು',
    'nav.report_issue': 'ದೂರು ನೀಡಿ',
    'nav.city_map': 'ನಗರದ ನಕ್ಷೆ',
    'nav.admin_panel': 'ಆಡಳಿತ ಮಂಡಳಿ',
    'nav.login': 'ಲಾಗಿನ್ / ಸೈನ್ ಅಪ್',
    'nav.admin': 'ಆಡಳಿತ',
    
    // Auth
    'auth.login.title': 'ಸೈನ್ ಇನ್',
    'auth.signup.title': 'ಖಾತೆ ರಚಿಸಿ',
    'auth.email': 'ಇಮೇಲ್',
    'auth.password': 'ಪಾಸ್ವರ್ಡ್',
    'auth.fullname': 'ಪೂರ್ಣ ಹೆಸರು',
    'auth.phone': 'ದೂರವಾಣಿ',

    // Hero / Index
    'hero.label': 'ಬೆಂಗಳೂರು ನಾಗರಿಕರ ಸಬಲೀಕರಣ',
    'hero.title.line1': 'ನಿಮ್ಮ ಧ್ವನಿ.',
    'hero.title.line2': 'ನಿಮ್ಮ ನಗರ.',
    'hero.title.line3': 'ನಿಮ್ಮ ಶಕ್ತಿ.',
    'hero.subtitle': 'ನಾಗರಿಕ ದೂರುಗಳನ್ನು ವರದಿ ಮಾಡಿ, ನೈಜ ಸಮಯದಲ್ಲಿ ಪರಿಹಾರಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಮತ್ತು AI ಆಧಾರಿತ ಒಳನೋಟಗಳೊಂದಿಗೆ ಸ್ಮಾರ್ಟ್, ಸ್ವಚ್ಛ ಬೆಂಗಳೂರನ್ನು ನಿರ್ಮಿಸಲು ಸಹಾಯ ಮಾಡಿ.',
    'hero.report_btn': '🚨 ದೂರು ನೀಡಿ',
    'hero.track_btn': '📋 ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',

    // Stats
    'stat.filed': 'ದಾಖಲಾದ ದೂರುಗಳು',
    'stat.resolved': 'ಪರಿಹರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು',
    'stat.wards': 'ಒಳಗೊಂಡಿರುವ ವಾರ್ಡ್‌ಗಳು',
    'stat.avg_time': 'ಸರಾಸರಿ ಪರಿಹಾರ',

    // Lang Modal
    'modal.select_lang': 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'modal.proceed': 'ಮುಂದುವರಿಯಿರಿ →'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('nagaraseva_lang');
  }

  init() {
    if (!this.currentLang) {
      // Show language selection modal if not set
      this.showLanguageModal();
    } else {
      this.applyTranslations();
    }
    
    // Optional: bind a language switcher if it exists in the topbar
    const switcher = document.getElementById('lang-switcher');
    if (switcher) {
      switcher.value = this.currentLang || 'en';
      switcher.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
    // Setup floating switcher for all pages
    this.injectLanguageSwitcher();
  }

  injectLanguageSwitcher() {
    if (document.getElementById('floating-lang-switcher')) return;

    const switcherDiv = document.createElement('div');
    switcherDiv.id = 'floating-lang-switcher';
    switcherDiv.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      background: rgba(30, 30, 50, 0.95);
      border: 1px solid var(--border-accent, rgba(0,188,212,0.3));
      padding: 10px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    `;
    
    switcherDiv.onmouseenter = () => {
      switcherDiv.style.transform = 'translateY(-2px)';
      switcherDiv.style.boxShadow = '0 12px 40px rgba(0,188,212,0.2)';
    };
    switcherDiv.onmouseleave = () => {
      switcherDiv.style.transform = 'none';
      switcherDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
    };

    const icon = document.createElement('span');
    icon.innerHTML = '🌐';
    icon.style.fontSize = '18px';

    const select = document.createElement('select');
    select.id = 'global-lang-select';
    select.style.cssText = `
      background: transparent;
      border: none;
      color: white;
      font-size: 14px;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      padding-right: 5px;
    `;
    
    // Dropdown arrow embedded for custom appearance
    const arrow = document.createElement('span');
    arrow.innerHTML = '▼';
    arrow.style.cssText = 'font-size: 10px; color: rgba(255,255,255,0.7); margin-left: 2px; pointer-events: none;';

    const enOption = document.createElement('option');
    enOption.value = 'en';
    enOption.textContent = 'English';
    enOption.style.color = '#000';
    
    const knOption = document.createElement('option');
    knOption.value = 'kn';
    knOption.textContent = 'ಕನ್ನಡ';
    knOption.style.color = '#000';

    select.appendChild(enOption);
    select.appendChild(knOption);
    
    select.value = this.currentLang || 'en';

    select.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
      const topSwitcher = document.getElementById('lang-switcher');
      if (topSwitcher) topSwitcher.value = e.target.value;
    });

    switcherDiv.appendChild(icon);
    switcherDiv.appendChild(select);
    switcherDiv.appendChild(arrow);
    document.body.appendChild(switcherDiv);
  }

  showLanguageModal() {
    const overlay = document.createElement('div');
    overlay.id = 'lang-modal-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(13,13,26,0.95); z-index: 9999;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;

    overlay.innerHTML = `
      <div style="background: rgba(30, 30, 50, 0.95); border: 1px solid rgba(0,188,212,0.3); padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;">
        <div style="font-size: 48px; margin-bottom: 20px;">🌐</div>
        <h2 style="color: white; margin-bottom: 10px; font-size: 24px;">Welcome to NagaraSeva</h2>
        <p style="color: rgba(255,255,255,0.7); margin-bottom: 30px; font-size: 14px;">Please select your preferred language to proceed.<br>ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.</p>
        
        <div style="display: flex; gap: 15px; flex-direction: column;">
          <button class="lang-option-btn" data-lang="en" style="padding: 15px; border-radius: 10px; border: 2px solid var(--color-accent); background: rgba(0,188,212,0.1); color: white; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s;">
            English
          </button>
          <button class="lang-option-btn" data-lang="kn" style="padding: 15px; border-radius: 10px; border: 2px solid transparent; background: rgba(255,255,255,0.05); color: white; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s;">
            ಕನ್ನಡ (Kannada)
          </button>
        </div>
        
        <button id="lang-proceed-btn" style="margin-top: 30px; padding: 12px 30px; background: var(--color-accent); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; font-size: 16px; display: inline-block;">
          Proceed →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    let selectedLang = 'en';

    // Handle selection UI
    const btns = overlay.querySelectorAll('.lang-option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        btns.forEach(b => {
          b.style.borderColor = 'transparent';
          b.style.background = 'rgba(255,255,255,0.05)';
        });
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.background = 'rgba(0,188,212,0.1)';
        selectedLang = e.currentTarget.dataset.lang;
      });
    });

    // Handle proceed
    document.getElementById('lang-proceed-btn').addEventListener('click', () => {
      this.setLanguage(selectedLang);
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s ease';
      setTimeout(() => overlay.remove(), 400);
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('nagaraseva_lang', lang);
    this.applyTranslations();
  }

  applyTranslations() {
    const dict = translations[this.currentLang] || translations['en'];
    
    // 1. Translate elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // If it's an input/textarea placeholder
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          // If the element has embedded HTML (like spans inside h1), we need to be careful.
          // For simple text replacement:
          el.textContent = dict[key];
        }
      }
    });

    // 2. Special cases (like the hero title which has <br> and <span>)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && dict['hero.title.line1']) {
      heroTitle.innerHTML = `
        ${dict['hero.title.line1']}<br>
        <span class="highlight">${dict['hero.title.line2']}</span><br>
        ${dict['hero.title.line3']}
      `;
    }
  }
}

// Global instance
window.i18n = new I18nManager();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  window.i18n.init();
});
