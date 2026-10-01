/* ==========================================================================
   미카의 일상 (MIKA'S BLOG) - LANDING PAGE INTERACTION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const BLOG_URL = 'https://m.blog.naver.com/moccamika';

  // 1. Toast Notification Function
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 2. Clipboard Copy Functionality
  function copyBlogUrl() {
    navigator.clipboard.writeText(BLOG_URL)
      .then(() => {
        showToast('💚 미카의 블로그 주소가 복사되었습니다!');
      })
      .catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = BLOG_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('💚 미카의 블로그 주소가 복사되었습니다!');
      });
  }

  // Copy Buttons Binding
  const btnCopyNav = document.getElementById('btnCopyNav');
  const btnCopyCta = document.getElementById('btnCopyCta');
  const btnSmallCopy = document.getElementById('btnSmallCopy');

  if (btnCopyNav) btnCopyNav.addEventListener('click', copyBlogUrl);
  if (btnCopyCta) btnCopyCta.addEventListener('click', copyBlogUrl);
  if (btnSmallCopy) btnSmallCopy.addEventListener('click', copyBlogUrl);

  // 3. Naver Search Bar Action
  const naverSearchInput = document.getElementById('naverSearchInput');
  const btnNaverSearch = document.getElementById('btnNaverSearch');
  const naverSearchBox = document.querySelector('.naver-search-inner');

  function triggerNaverSearch() {
    showToast('🔍 네이버 블로그 "미카의 일상"으로 이동합니다!');
    setTimeout(() => {
      window.open(BLOG_URL, '_blank');
    }, 600);
  }

  if (naverSearchBox) {
    naverSearchBox.addEventListener('click', triggerNaverSearch);
  }
  if (btnNaverSearch) {
    btnNaverSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerNaverSearch();
    });
  }

  // 4. Blog Posts Category Filtering & Search
  const filterBtns = document.querySelectorAll('.filter-btn');
  const postCards = document.querySelectorAll('.post-card');
  const postSearchInput = document.getElementById('postSearchInput');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterPosts() {
    postCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.post-title').textContent.toLowerCase();
      const cardExcerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();

      const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
      const matchesSearch = (cardTitle.includes(searchQuery) || cardExcerpt.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      filterPosts();
    });
  });

  if (postSearchInput) {
    postSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterPosts();
    });
  }

  // 5. Category Card Clicks (Filter or Jump)
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a') return;
      const cat = card.getAttribute('data-category');
      const targetFilterBtn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
      if (targetFilterBtn) {
        targetFilterBtn.click();
        const postsSection = document.getElementById('posts');
        if (postsSection) {
          postsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 6. Mobile Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navList = document.querySelector('.nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (navList.classList.contains('active')) {
        icon.className = 'ri-close-line';
      } else {
        icon.className = 'ri-menu-3-line';
      }
    });
  }

  // Close nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navList && navList.classList.contains('active')) {
        navList.classList.remove('active');
        if (navToggle) {
          navToggle.querySelector('i').className = 'ri-menu-3-line';
        }
      }
    });
  });

  // 7. Header Scroll Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
});
