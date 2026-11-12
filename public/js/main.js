/**
 * MUSENIX Musical - Client-side Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DUAL CATEGORY TABS SWITCHER
  const tabButtons = document.querySelectorAll('.cat-tab-btn');
  const tabContents = document.querySelectorAll('.cat-tab-content');

  function switchTab(targetId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === targetId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      switchTab(target);
    });
  });

  // Check URL hash on page load
  if (window.location.hash === '#download-ios') {
    switchTab('tab-ios');
    const el = document.getElementById('download');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else if (window.location.hash === '#download-android') {
    switchTab('tab-android');
    const el = document.getElementById('download');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // 2. LIVE MUSIC PLAYER DEMO CONTROLLER
  const tracks = [
    {
      title: 'Penjaga Hati',
      artist: 'Nadhif Basalamah',
      src: '/audio/nadhif-penjaga-hati.m4a',
      cover: '/images/logo.png',
    },
    {
      title: 'Hati-Hati di Jalan',
      artist: 'Tulus',
      src: '/audio/tulus-hati-hati-di-jalan.mp3',
      cover: '/images/logo.png',
    }
  ];

  let currentTrackIdx = 0;
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.src = tracks[currentTrackIdx].src;

  const playBtn = document.getElementById('webPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const waveEl = document.getElementById('equalizerWave');
  const seekbar = document.getElementById('webSeekbar');
  const curTimeEl = document.getElementById('webCurTime');
  const durTimeEl = document.getElementById('webDurTime');
  const trackTitleEl = document.getElementById('webTrackTitle');
  const trackArtistEl = document.getElementById('webTrackArtist');
  const pillSongs = document.querySelectorAll('.pill-song');

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function loadTrack(idx, autoPlay = true) {
    currentTrackIdx = idx;
    const t = tracks[idx];
    audio.src = t.src;
    trackTitleEl.textContent = t.title;
    trackArtistEl.textContent = t.artist;

    pillSongs.forEach((p, i) => {
      if (i === idx) p.classList.add('active');
      else p.classList.remove('active');
    });

    if (autoPlay) {
      audio.play().then(() => {
        updatePlayState(true);
      }).catch(() => {
        updatePlayState(false);
      });
    }
  }

  function updatePlayState(isPlaying) {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      waveEl.classList.add('playing');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      waveEl.classList.remove('playing');
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          updatePlayState(true);
        }).catch(err => {
          console.log('Play blocked or loading:', err);
        });
      } else {
        audio.pause();
        updatePlayState(false);
      }
    });
  }

  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      const progress = (audio.currentTime / audio.duration) * 100;
      seekbar.value = progress;
      curTimeEl.textContent = formatTime(audio.currentTime);
      durTimeEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    durTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    // Loop or next track
    const nextIdx = (currentTrackIdx + 1) % tracks.length;
    loadTrack(nextIdx, true);
  });

  if (seekbar) {
    seekbar.addEventListener('input', () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        audio.currentTime = (seekbar.value / 100) * audio.duration;
      }
    });
  }

  pillSongs.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      loadTrack(idx, true);
    });
  });

  // Next / Prev buttons
  const prevBtn = document.getElementById('webPrevBtn');
  const nextBtn = document.getElementById('webNextBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
      loadTrack(prevIdx, true);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextIdx = (currentTrackIdx + 1) % tracks.length;
      loadTrack(nextIdx, true);
    });
  }

  // 3. FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 4. MOBILE MENU & DRAWER CONTROLLER
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    if (mobileNav) mobileNav.classList.add('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('open');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('open');
    if (menuToggle) menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Expose globally for inline onclick handlers
  window.closeMobileNav = closeMobileNav;
  window.openMobileNav = openMobileNav;

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileNav && mobileNav.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  // 5. FETCH LIVE API INFO
  fetch('/api/info')
    .then(res => res.json())
    .then(data => {
      const apkSizeEl = document.getElementById('apkFileSize');
      if (apkSizeEl && data.platform && data.platform.android) {
        apkSizeEl.textContent = data.platform.android.fileSize;
      }
      const ipaSizeEl = document.getElementById('ipaFileSize');
      if (ipaSizeEl && data.platform && data.platform.ios) {
        ipaSizeEl.textContent = data.platform.ios.fileSize;
      }
      const winSizeEl = document.getElementById('winFileSize');
      if (winSizeEl && data.platform && data.platform.windows) {
        winSizeEl.textContent = data.platform.windows.fileSize + ' (.zip)';
      }
    })
    .catch(() => {});
});

