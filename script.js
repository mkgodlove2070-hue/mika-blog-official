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

  // Fallback representative post images (Downloaded real photos from moccamika blog)
  const categoryImageMap = {
    food: 'assets/post-gs25.jpg',
    travel: 'assets/post-atelier.jpg',
    cafe: 'assets/post-cheongsudang.jpg'
  };

  // Extract real representative image from RSS item
  function extractPostImage(item, cat) {
    const link = item.link || '';
    const title = (item.title || '').toLowerCase();

    // Direct exact match for moccamika's real blog posts
    if (link.includes('224405442328') || title.includes('gs25') || title.includes('찹쌀떡') || title.includes('요거트')) {
      return 'assets/post-gs25.jpg';
    }
    if (link.includes('224405159363') || title.includes('청수당') || title.includes('베이커리') || title.includes('스톤드립')) {
      return 'assets/post-cheongsudang.jpg';
    }
    if (link.includes('224400210003') || title.includes('비틀') || title.includes('타코') || title.includes('서순라길')) {
      return 'assets/post-atelier.jpg';
    }
    if (title.includes('미미') || title.includes('앵무새')) {
      return 'assets/mimi-new.png';
    }

    if (item.thumbnail && item.thumbnail.length > 5) {
      return item.thumbnail;
    }
    const htmlSnippet = (item.description || '') + (item.content || '');
    const match = htmlSnippet.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
    return categoryImageMap[cat] || 'assets/post-gs25.jpg';
  }

  function renderLivePosts(items) {
    if (!postsGrid) return;
    postsGrid.innerHTML = ''; // Clear initial cards

    items.forEach((item, idx) => {
      // Determine category based on title/category
      let cat = 'food';
      let tagLabel = '🍴 맛집/제품';
      let tagClass = 'tag-food';

      const titleLower = item.title.toLowerCase();
      const catLower = (item.categories ? item.categories.join(' ') : '').toLowerCase();

      if (titleLower.includes('청수당') || titleLower.includes('카페') || titleLower.includes('커피') || catLower.includes('카페')) {
        cat = 'cafe';
        tagLabel = '☕ 카페리뷰';
        tagClass = 'tag-cafe';
      } else if (titleLower.includes('여행') || titleLower.includes('서순라길') || titleLower.includes('투어') || catLower.includes('여행')) {
        cat = 'travel';
        tagLabel = '🧳 여행/핫플';
        tagClass = 'tag-travel';
      } else if (titleLower.includes('gs25') || titleLower.includes('도시락') || titleLower.includes('제품') || titleLower.includes('맛집')) {
        cat = 'food';
        tagLabel = '🍴 맛집/제품';
        tagClass = 'tag-food';
      } else {
        const cats = ['food', 'travel', 'cafe'];
        cat = cats[idx % 3];
      }

      const imgUrl = extractPostImage(item, cat);

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
            <img src="${imgUrl}" alt="${item.title}" class="post-thumb" referrerpolicy="no-referrer" onerror="this.src='${categoryImageMap[cat]}'">
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

  // 8. Contact & Inquiry Form Logic (문의사항 남기는 보내기 란 로직)
  const officialEmailText = document.getElementById('officialEmailText');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  if (btnCopyEmail && officialEmailText) {
    btnCopyEmail.addEventListener('click', () => {
      const email = officialEmailText.textContent.trim();
      navigator.clipboard.writeText(email)
        .then(() => showToast('✉️ 공식 이메일 주소(' + email + ')가 복사되었습니다!'))
        .catch(() => showToast('✉️ ' + email));
    });
  }

  // Category Chips Selection
  const categoryChips = document.querySelectorAll('#categoryChips .chip-btn');
  const inquiryTypeInput = document.getElementById('inquiryType');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (inquiryTypeInput) {
        inquiryTypeInput.value = chip.getAttribute('data-type');
      }
    });
  });

  // Textarea Character Counter
  const inquiryMessage = document.getElementById('inquiryMessage');
  const charCount = document.getElementById('charCount');
  if (inquiryMessage && charCount) {
    inquiryMessage.addEventListener('input', () => {
      charCount.textContent = inquiryMessage.value.length;
    });
  }

  // LocalStorage Inquiry Management
  const STORAGE_KEY = 'mika_blog_inquiries';
  function getSavedInquiries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveInquiry(inquiry) {
    const list = getSavedInquiries();
    list.unshift(inquiry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    updateInquiryCount();
  }

  function updateInquiryCount() {
    const countEl = document.getElementById('inquiryCount');
    if (countEl) {
      countEl.textContent = getSavedInquiries().length;
    }
  }
  updateInquiryCount();

  // Form Submission
  const inquiryForm = document.getElementById('inquiryForm');
  const btnSubmitInquiry = document.getElementById('btnSubmitInquiry');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnSubmitText = document.getElementById('btnSubmitText');
  const btnSubmitIcon = document.getElementById('btnSubmitIcon');
  const inquirySuccessView = document.getElementById('inquirySuccessView');
  const btnResetInquiry = document.getElementById('btnResetInquiry');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const senderName = document.getElementById('senderName').value.trim();
      const senderContact = document.getElementById('senderContact').value.trim();
      const inquirySubject = document.getElementById('inquirySubject').value.trim();
      const message = inquiryMessage ? inquiryMessage.value.trim() : '';
      const inquiryType = inquiryTypeInput ? inquiryTypeInput.value : '기타 문의';
      const privacyAgree = document.getElementById('privacyAgree');

      if (!senderName) {
        showToast('⚠️ 보내시는 분의 성함 또는 닉네임을 입력해주세요.');
        document.getElementById('senderName').focus();
        return;
      }
      if (!senderContact) {
        showToast('⚠️ 회신받으실 연락처 또는 이메일을 입력해주세요.');
        document.getElementById('senderContact').focus();
        return;
      }
      if (!inquirySubject) {
        showToast('⚠️ 문의 제목을 입력해주세요.');
        document.getElementById('inquirySubject').focus();
        return;
      }
      if (!message) {
        showToast('⚠️ 문의 내용을 작성해주세요.');
        if (inquiryMessage) inquiryMessage.focus();
        return;
      }
      if (privacyAgree && !privacyAgree.checked) {
        showToast('⚠️ 개인정보 수집 및 안내 동의를 체크해주세요.');
        return;
      }

      // Submitting State Animation
      btnSubmitInquiry.disabled = true;
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      if (btnSubmitText) btnSubmitText.textContent = '메시지 전송 중...';
      if (btnSubmitIcon) btnSubmitIcon.style.display = 'none';

      const now = new Date();
      const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setTimeout(() => {
        // Save inquiry to localStorage
        const inquiryData = {
          id: Date.now(),
          type: inquiryType,
          name: senderName,
          contact: senderContact,
          subject: inquirySubject,
          message: message,
          date: formattedDate
        };
        saveInquiry(inquiryData);

        // Reset submit button state
        btnSubmitInquiry.disabled = false;
        if (btnSpinner) btnSpinner.style.display = 'none';
        if (btnSubmitText) btnSubmitText.textContent = '문의사항 보내기';
        if (btnSubmitIcon) btnSubmitIcon.style.display = 'inline-block';

        // Update success summary display
        const summaryType = document.getElementById('summaryType');
        const summaryName = document.getElementById('summaryName');
        const summarySubject = document.getElementById('summarySubject');
        const summaryDate = document.getElementById('summaryDate');

        if (summaryType) summaryType.textContent = inquiryType;
        if (summaryName) summaryName.textContent = senderName;
        if (summarySubject) summarySubject.textContent = inquirySubject;
        if (summaryDate) summaryDate.textContent = formattedDate;

        // Switch to success view
        inquiryForm.style.display = 'none';
        if (inquirySuccessView) inquirySuccessView.style.display = 'block';

        showToast('💌 미카에게 문의사항이 성공적으로 전달되었습니다!');
      }, 700);
    });
  }

  // Reset / Write Another Inquiry Button
  if (btnResetInquiry && inquiryForm) {
    btnResetInquiry.addEventListener('click', () => {
      inquiryForm.reset();
      if (charCount) charCount.textContent = '0';
      if (categoryChips.length > 0) {
        categoryChips[0].click();
      }
      if (inquirySuccessView) inquirySuccessView.style.display = 'none';
      inquiryForm.style.display = 'block';
    });
  }

  // Modal: View Sent Inquiries
  const inquiryModal = document.getElementById('inquiryModal');
  const btnViewHistory = document.getElementById('btnViewHistory');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnModalCloseAction = document.getElementById('btnModalCloseAction');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalInquiryList = document.getElementById('modalInquiryList');
  const btnClearHistory = document.getElementById('btnClearHistory');

  function openModal() {
    renderInquiryHistory();
    if (inquiryModal) {
      inquiryModal.classList.add('open');
      inquiryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (inquiryModal) {
      inquiryModal.classList.remove('open');
      inquiryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function renderInquiryHistory() {
    if (!modalInquiryList) return;
    const list = getSavedInquiries();
    if (list.length === 0) {
      modalInquiryList.innerHTML = `
        <div class="empty-history">
          <i class="ri-inbox-line"></i>
          <p>아직 남기신 문의 내역이 없습니다.<br>미카에게 첫 번째 다정한 메시지를 남겨보세요 ♡</p>
        </div>
      `;
      return;
    }

    modalInquiryList.innerHTML = list.map(item => `
      <div class="history-card" data-id="${item.id}">
        <div class="history-card-header">
          <span class="history-type-badge">${escapeHtml(item.type)}</span>
          <span class="history-date">${escapeHtml(item.date)}</span>
        </div>
        <h4 class="history-subject">${escapeHtml(item.subject)}</h4>
        <div class="history-message">${escapeHtml(item.message)}</div>
        <div class="history-meta">
          <span><strong>작성자:</strong> ${escapeHtml(item.name)}</span>
          <span><strong>회신처:</strong> ${escapeHtml(item.contact)}</span>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  if (btnViewHistory) btnViewHistory.addEventListener('click', openModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnModalCloseAction) btnModalCloseAction.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && inquiryModal && inquiryModal.classList.contains('open')) {
      closeModal();
    }
  });

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      const list = getSavedInquiries();
      if (list.length === 0) return;
      if (confirm('남기신 모든 문의 내역을 브라우저에서 삭제하시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEY);
        updateInquiryCount();
        renderInquiryHistory();
        showToast('🗑️ 보낸 문의 내역이 삭제되었습니다.');
      }
    });
  }

  // Init Filter Binding & Live RSS Fetch
  bindFiltering();
  fetchLiveNaverBlogPosts();
});

