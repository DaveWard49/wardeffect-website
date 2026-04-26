// Ward Effect Website — Google Translate Dropdown
// Include this script in every page. Add <div id="we-translator"></div> in nav.

(function(){
  const API_KEY = 'AIzaSyAtdQG8Z21UdGubI_XnLNPfu5BuWDmvS-8';

  const LANGUAGES = [
    {code:'en',    label:'🇬🇧 English'},
    {code:'af',    label:'🇿🇦 Afrikaans'},
    {code:'ar',    label:'🇸🇦 العربية'},
    {code:'bn',    label:'🇧🇩 Bengali'},
    {code:'zh-CN', label:'🇨🇳 中文 (简体)'},
    {code:'zh-TW', label:'🇹🇼 中文 (繁體)'},
    {code:'hr',    label:'🇭🇷 Hrvatski'},
    {code:'cs',    label:'🇨🇿 Čeština'},
    {code:'da',    label:'🇩🇰 Dansk'},
    {code:'nl',    label:'🇳🇱 Nederlands'},
    {code:'fi',    label:'🇫🇮 Suomi'},
    {code:'fr',    label:'🇫🇷 Français'},
    {code:'de',    label:'🇩🇪 Deutsch'},
    {code:'el',    label:'🇬🇷 Ελληνικά'},
    {code:'he',    label:'🇮🇱 עברית'},
    {code:'hi',    label:'🇮🇳 हिन्दी'},
    {code:'hu',    label:'🇭🇺 Magyar'},
    {code:'id',    label:'🇮🇩 Indonesia'},
    {code:'it',    label:'🇮🇹 Italiano'},
    {code:'ja',    label:'🇯🇵 日本語'},
    {code:'ko',    label:'🇰🇷 한국어'},
    {code:'ms',    label:'🇲🇾 Melayu'},
    {code:'no',    label:'🇳🇴 Norsk'},
    {code:'pl',    label:'🇵🇱 Polski'},
    {code:'pt',    label:'🇵🇹 Português'},
    {code:'ro',    label:'🇷🇴 Română'},
    {code:'ru',    label:'🇷🇺 Русский'},
    {code:'sk',    label:'🇸🇰 Slovenčina'},
    {code:'es',    label:'🇪🇸 Español'},
    {code:'sv',    label:'🇸🇪 Svenska'},
    {code:'th',    label:'🇹🇭 ไทย'},
    {code:'tl',    label:'🇵🇭 Filipino'},
    {code:'tr',    label:'🇹🇷 Türkçe'},
    {code:'uk',    label:'🇺🇦 Українська'},
    {code:'vi',    label:'🇻🇳 Tiếng Việt'}
  ];

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #we-translator{position:relative;display:flex;align-items:center;}
    #we-lang-btn{background:none;border:1px solid rgba(232,168,56,0.4);border-radius:4px;color:rgba(255,255,255,0.65);font-family:'Exo 2',sans-serif;font-size:0.82rem;padding:0.3rem 0.7rem;cursor:pointer;display:flex;align-items:center;gap:0.4rem;transition:border-color 0.2s,color 0.2s;white-space:nowrap;}
    #we-lang-btn:hover{border-color:#E8A838;color:#F2C46D;}
    #we-lang-dropdown{display:none;position:absolute;top:calc(100% + 8px);right:0;background:#112240;border:1px solid rgba(232,168,56,0.2);border-radius:6px;min-width:200px;max-height:320px;overflow-y:auto;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,0.4);}
    #we-lang-dropdown.open{display:block;}
    #we-lang-dropdown button{display:block;width:100%;text-align:left;background:none;border:none;padding:0.55rem 1rem;color:rgba(255,255,255,0.7);font-family:'Exo 2',sans-serif;font-size:0.85rem;cursor:pointer;transition:background 0.15s,color 0.15s;}
    #we-lang-dropdown button:hover{background:rgba(232,168,56,0.08);color:#F2C46D;}
    #we-lang-dropdown button.active{color:#E8A838;font-weight:600;}
    #we-translate-status{position:fixed;bottom:1.5rem;right:1.5rem;background:#112240;border:1px solid rgba(232,168,56,0.3);border-radius:6px;padding:0.6rem 1.2rem;color:#F2C46D;font-size:0.82rem;font-family:'Exo 2',sans-serif;display:none;z-index:9999;}
  `;
  document.head.appendChild(style);

  // Build widget HTML
  const container = document.getElementById('we-translator');
  if (!container) return;

  container.innerHTML = `
    <button id="we-lang-btn">🌐 <span id="we-lang-label">Language</span></button>
    <div id="we-lang-dropdown">
      ${LANGUAGES.map(l => `<button data-code="${l.code}">${l.label}</button>`).join('')}
    </div>
    <div id="we-translate-status">Translating...</div>
  `;

  const btn      = document.getElementById('we-lang-btn');
  const dropdown = document.getElementById('we-lang-dropdown');
  const label    = document.getElementById('we-lang-label');
  const status   = document.getElementById('we-translate-status');

  let currentLang = localStorage.getItem('we-lang') || 'en';
  let originalTexts = new Map();
  let isTranslating = false;

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));

  // Collect all text nodes
  function getTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (['SCRIPT','STYLE','NOSCRIPT'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('#we-translator')) return NodeFilter.FILTER_REJECT;
          if (node.textContent.trim() === '') return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const nodes = [];
    let node;
    while (node = walker.nextNode()) nodes.push(node);
    return nodes;
  }

  // Save originals on first load
  function saveOriginals() {
    if (originalTexts.size > 0) return;
    getTextNodes(document.body).forEach((node, i) => {
      originalTexts.set(node, node.textContent);
    });
  }

  // Restore English
  function restoreOriginal() {
    originalTexts.forEach((text, node) => {
      if (node.parentElement) node.textContent = text;
    });
  }

  // Translate page via Google API
  async function translatePage(langCode) {
    if (isTranslating) return;
    isTranslating = true;
    status.style.display = 'block';

    saveOriginals();

    if (langCode === 'en') {
      restoreOriginal();
      label.textContent = 'Language';
      localStorage.setItem('we-lang', 'en');
      status.style.display = 'none';
      isTranslating = false;
      return;
    }

    const nodes = getTextNodes(document.body);
    const texts = nodes.map(n => n.textContent);

    // Batch into chunks of 50
    const CHUNK = 50;
    const translated = [];

    for (let i = 0; i < texts.length; i += CHUNK) {
      const chunk = texts.slice(i, i + CHUNK);
      try {
        const res = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({q: chunk, source:'en', target: langCode, format:'text'})
          }
        );
        const data = await res.json();
        if (data.data && data.data.translations) {
          data.data.translations.forEach(t => translated.push(t.translatedText));
        } else {
          chunk.forEach(t => translated.push(t));
        }
      } catch(e) {
        chunk.forEach(t => translated.push(t));
      }
    }

    // Apply translations
    nodes.forEach((node, i) => {
      if (node.parentElement && translated[i]) node.textContent = translated[i];
    });

    const langObj = LANGUAGES.find(l => l.code === langCode);
    label.textContent = langObj ? langObj.label : langCode;
    localStorage.setItem('we-lang', langCode);
    currentLang = langCode;

    // Mark active
    dropdown.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.code === langCode);
    });

    status.style.display = 'none';
    isTranslating = false;
  }

  // Language button clicks
  dropdown.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('open');
      translatePage(b.dataset.code);
    });
  });

  // Auto-apply saved language on page load
  if (currentLang && currentLang !== 'en') {
    window.addEventListener('load', () => translatePage(currentLang));
  }

})();
