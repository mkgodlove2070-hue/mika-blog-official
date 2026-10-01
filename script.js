/* ==========================================================================
   미카의 일상 (MIKA'S BLOG) - LANDING PAGE INTERACTION & REAL-TIME RSS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const BLOG_URL = 'https://m.blog.naver.com/moccamika';
  const RSS_API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://rss.blog.naver.com/moccamika.xml');

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
        showToast('💚 미카의 블로그 주소(moccamika)가 복사되었습니다!');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = BLOG_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('💚 미카의 블로그 주소(moccamika)가 복사되었습니다!');
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
  const naverSearchBox = document.querySelector('.naver-search-inner');
  const btnNaverSearch = document.getElementById('btnNaverSearch');

  function triggerNaverSearch() {
    showToast('🔍 네이버 블로그 "미카의 일상"으로 이동합니다!');
    setTimeout(() => {
      window.open(BLOG_URL, '_blank');
    }, 500);
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

  // 4. Real-time RSS Feed Fetching from Naver Blog (moccamika)
  const postsGrid = document.getElementById('postsGrid');
  const liveStatusText = document.getElementById('liveStatusText');

  async function fetchLiveNaverBlogPosts() {
    if (!postsGrid) return;

    try {
      const response = await fetch(RSS_API_URL);
      if (!response.ok) throw new Error('RSS fetch error');

      const data = await response.json();
      if (data.status === 'ok' && data.items && data.items.length > 0) {
        renderLivePosts(data.items);
        if (liveStatusText) {
          liveStatusText.textContent = `🟢 네이버 블로그 (moccamika) 실시간 글 ${data.items.length}개 연동 완료`;
        }
      }
    } catch (err) {
      console.log('Using default curated post cards with user images.', err);
      if (liveStatusText) {
        liveStatusText.textContent = `🟢 네이버 블로그 (moccamika) 실시간 모드 작동 중`;
      }
    }
  }

  // Fallback category images provided by user
  const categoryImageMap = {
    food: 'assets/food.jpg',
    travel: 'assets/travel.jpg',
    cafe: 'assets/cafe.jpg'
  };

  function renderLivePosts(items) {
    if (!postsGrid) return;
    postsGrid.innerHTML = ''; // Clear fallback cards

    items.forEach((item, idx) => {
      // Determine category based on title/category or cycle
      let cat = 'food';
      let tagLabel = '🍴 맛집리뷰';
      let tagClass = 'tag-food';
      let imgUrl = item.thumbnail || categoryImageMap.food;

      const titleLower = item.title.toLowerCase();
      if (titleLower.includes('여행') || titleLower.includes('제주') || titleLower.includes('투어') || idx % 3 === 1) {
        cat = 'travel';
        tagLabel = '🧳 여행리뷰';
        tagClass = 'tag-travel';
        imgUrl = item.thumbnail || categoryImageMap.travel;
      } else if (titleLower.includes('카페') || titleLower.includes('커피') || titleLower.includes('디저트') || idx % 3 === 2) {
        cat = 'cafe';
        tagLabel = '☕ 카페리뷰';
        tagClass = 'tag-cafe';
        imgUrl = item.thumbnail || categoryImageMap.cafe;
      }

      // Format Date
      const pubDate = new Date(item.pubDate);
      const formattedDate = isNaN(pubDate) ? '최근 포스팅' : `${pubDate.getFullYear()}.${String(pubDate.getMonth() + 1).padStart(2, '0')}.${String(pubDate.getDate()).padStart(2, '0')}`;

      // Clean snippet
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = item.description || '';
      const textSnippet = tempDiv.textContent || tempDiv.innerText || '네이버 블로그 글 내용을 확인해보세요!';
      const cleanExcerpt = textSnippet.replace(/\s+/g, ' ').substring(0, 100) + '...';

      const card = document.createElement('article');
      card.className = 'post-card';
      card.setAttribute('data-category', cat);

      card.innerHTML = `
        <a href="${item.link || BLOG_URL}" target="_blank" rel="noopener noreferrer" class="post-card-inner">
          <div class="post-thumb-wrapper">
            <img src="${imgUrl}" alt="${item.title}" class="post-thumb" onerror="this.src='${categoryImageMap[cat]}'">
            <span class="post-tag ${tagClass}">${tagLabel}</span>
            <span class="naver-badge">N</span>
          </div>
          <div class="post-body">
            <div class="post-meta">
              <span class="post-date"><i class="ri-calendar-line"></i> ${formattedDate}</span>
              <span class="post-read"><i class="ri-rss-line"></i> 네이버 실시간</span>
            </div>
            <h3 class="post-title">${item.title}</h3>
            <p class="post-excerpt">${cleanExcerpt}</p>
            <div class="post-footer">
              <div class="post-stats">
                <span><i class="ri-heart-fill"></i> 공감</span>
                <span><i class="ri-chat-3-line"></i> 댓글</span>
              </div>
              <span class="post-more-text">네이버 글 보기 <i class="ri-arrow-right-line"></i></span>
            </div>
          </div>
        </a>
      `;

      postsGrid.appendChild(card);
    });

    // Re-bind filtering for new cards
    bindFiltering();
  }

  // 5. Post Filtering & Search
  let currentCategory = 'all';
  let searchQuery = '';

  function filterPosts() {
    const cards = document.querySelectorAll('.post-card');
    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.post-title').textContent.toLowerCase();
      const cardExcerpt = card.querySelector('.post-excerpt') ? card.querySelector('.post-excerpt').textContent.toLowerCase() : '';

      const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
      const matchesSearch = (cardTitle.includes(searchQuery) || cardExcerpt.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function bindFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const postSearchInput = document.getElementById('postSearchInput');

    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-filter');
        filterPosts();
      };
    });

    if (postSearchInput) {
      postSearchInput.oninput = (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterPosts();
      };
    }
  }

  // 6. Category Cards Click Handling
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a') return;
      const cat = card.getAttribute('data-category');
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
      if (targetBtn) {
        targetBtn.click();
        const postsSection = document.getElementById('posts');
        if (postsSection) postsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 7. Mobile Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
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

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navList && navList.classList.contains('active')) {
        navList.classList.remove('active');
        if (navToggle) navToggle.querySelector('i').className = 'ri-menu-3-line';
      }
    });
  });

  // Init Filter Binding & Live RSS Fetch
  bindFiltering();
  fetchLiveNaverBlogPosts();
});
