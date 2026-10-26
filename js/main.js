/**
 * ============================================================================
 * TRILLO TRAVEL UI - CLIENT CONTROLLER & INTERACTIVE ENGINE
 * ============================================================================
 * Features:
 * 1. Multi-tab travel booking explorer (Hotel, Flight, Car Rental, Tours)
 * 2. Real-time dynamic search input with destination query matching
 * 3. Interactive booking modal with live price calculation & room counter
 * 4. Dropdown notification systems for Bookmarks & Concierge Chat
 * 5. Review helpfulness upvoting with LocalStorage persistence
 * 6. Accessible keyboard control (ESC dismissal, focus traps)
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Destination & Service Mock Data Registry
  // --------------------------------------------------------------------------
  const DESTINATION_CATALOG = {
    hotel: {
      name: 'Hotel Las Palmas',
      location: 'Albufeira, Portugal',
      stars: 5,
      rating: '8.6',
      votes: '429 votes',
      roomsLeft: 4,
      basePrice: 180,
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80'
      ],
      captions: ['Main Ocean Infinity Pool', 'Luxury King Terrace Suite', 'Private Algarve Beachfront'],
      desc1: 'Nestled along the sun-drenched clifftops of Albufeira, Hotel Las Palmas delivers world-class Mediterranean hospitality. Experience panoramic ocean views, Michelin-starred coastal dining, and immediate access to pristine sandy beaches.',
      desc2: 'Every deluxe suite features handcrafted teak furnishings, a private oceanfront sun balcony, and personalized 24/7 concierge assistance designed for discerning global travelers.',
      amenities: [
        'Close to the beach',
        'Free breakfast included',
        'Free airport shuttle',
        'Free wifi in all rooms',
        'Air conditioning & heating',
        'Pets allowed',
        'We speak all languages',
        'Perfect for families'
      ]
    },
    flight: {
      name: 'Transatlantic Luxury Wing',
      location: 'Lisbon (LIS) to New York (JFK)',
      stars: 5,
      rating: '9.2',
      votes: '812 votes',
      roomsLeft: 6,
      basePrice: 420,
      photos: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&auto=format&fit=crop&q=80'
      ],
      captions: ['Boeing 787 Dreamliner', 'Lie-Flat First Class Pods', 'Gourmet In-Flight Dining'],
      desc1: 'Experience seamless sky travel with ultra-quiet carbon cabin pressurization, private lie-flat sleeping suites, and curated sommelier wine pairings at 38,000 feet.',
      desc2: 'Includes fast-track lounge privileges at Lisbon and New York with private shower suites, high-speed satellite Wi-Fi, and generous two-bag free check-in.',
      amenities: [
        'Lie-flat sleeper pods',
        'Gourmet dining menu',
        'Satellite Wi-Fi aboard',
        'Priority boarding gate',
        'Chauffeur airport transfer',
        'Noise-canceling headsets',
        'Personal concierge desk',
        'Zero carbon offset option'
      ]
    },
    'car-rental': {
      name: 'Porsche Macan GTS & Cabrios',
      location: 'Faro Airport & Albufeira Hub',
      stars: 5,
      rating: '9.0',
      votes: '194 votes',
      roomsLeft: 3,
      basePrice: 95,
      photos: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
      ],
      captions: ['Porsche GTS Cabriolet', 'Keyless Digital Delivery', 'Full Comprehensive Coverage'],
      desc1: 'Explore the scenic coastlines of Southern Portugal with our handpicked fleet of premium convertibles and luxury SUVs delivered directly to your villa doorstep.',
      desc2: 'Features zero-deductible insurance, unlimited mileage along the Algarve, integrated GPS navigation, and flexible toll electronic transponders included standard.',
      amenities: [
        'Unlimited coastal mileage',
        'Zero excess liability',
        'Keyless smartphone unlock',
        'Apple CarPlay & Android Auto',
        'Free second driver add-on',
        'Child booster seats available',
        '24/7 roadside mechanical aid',
        'Clean hybrid engine fleet'
      ]
    },
    tours: {
      name: 'Benagil Sea Caves & Dolphin Safari',
      location: 'Marina de Portimão, Portugal',
      stars: 5,
      rating: '9.8',
      votes: '1,420 votes',
      roomsLeft: 8,
      basePrice: 65,
      photos: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80'
      ],
      captions: ['Benagil Cathedral Cave', 'Wild Dolphin Pod Encounter', 'Sunset Champagne Cruise'],
      desc1: 'Board our bespoke high-speed catamaran for a private excursion through prehistoric sea arches and secret secluded grottos inaccessible by land.',
      desc2: 'Led by certified marine biologists with sonar tracking to observe wild bottlenose dolphins in their natural migratory habitat before an Algarve sunset toast.',
      amenities: [
        'Certified marine biologists',
        'All snorkeling gear included',
        'Complementary champagne & tapas',
        'GoPro video recording package',
        'Small group max 10 guests',
        'Restroom on catamaran board',
        'Lifejackets for all sizes',
        'Weather guarantee refund'
      ]
    }
  };

  // --------------------------------------------------------------------------
  // 2. Application State Model
  // --------------------------------------------------------------------------
  const state = {
    currentTab: 'hotel',
    activeModal: false,
    savedBookmarks: 7,
    unreadMessages: 13,
    helpfulVotes: JSON.parse(localStorage.getItem('trillo_helpful_reviews') || '{}'),
    bookingData: {
      roomsLeft: 4,
      selectedTierPrice: 180,
      nights: 3
    }
  };

  // --------------------------------------------------------------------------
  // 3. DOM Element Selectors Cache
  // --------------------------------------------------------------------------
  const DOM = {
    sidebarMenu: document.getElementById('sidebarMenu'),
    propertyHeading: document.getElementById('propertyHeading'),
    locationBtn: document.getElementById('locationBtn'),
    ratingScore: document.getElementById('ratingScore'),
    voteCountLabel: document.getElementById('voteCountLabel'),
    galleryPhotos: [
      document.getElementById('galleryPhoto1'),
      document.getElementById('galleryPhoto2'),
      document.getElementById('galleryPhoto3')
    ],
    descParagraph1: document.getElementById('descParagraph1'),
    descParagraph2: document.getElementById('descParagraph2'),
    amenitiesList: document.getElementById('amenitiesList'),
    availableRoomsCount: document.getElementById('availableRoomsCount'),
    ctaHeading: document.getElementById('ctaHeading'),
    openBookingModalBtn: document.getElementById('openBookingModalBtn'),
    bookingModalOverlay: document.getElementById('bookingModalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    bookingForm: document.getElementById('bookingForm'),
    bookingDestination: document.getElementById('bookingDestination'),
    bookingDates: document.getElementById('bookingDates'),
    roomTypeSelect: document.getElementById('roomType'),
    guestCountSelect: document.getElementById('guestCount'),
    estimatedTotalAmount: document.getElementById('estimatedTotalAmount'),
    searchInput: document.getElementById('searchInput'),
    searchForm: document.getElementById('searchForm'),
    bookmarkBtn: document.getElementById('bookmarkBtn'),
    bookmarkDropdown: document.getElementById('bookmarkDropdown'),
    chatBtn: document.getElementById('chatBtn'),
    chatDropdown: document.getElementById('chatDropdown'),
    globalToast: document.getElementById('globalToast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // --------------------------------------------------------------------------
  // 4. Tab Navigation Controller
  // --------------------------------------------------------------------------
  function switchTab(tabKey) {
    if (!DESTINATION_CATALOG[tabKey]) return;

    state.currentTab = tabKey;
    const data = DESTINATION_CATALOG[tabKey];

    // Update active nav item highlight
    const items = DOM.sidebarMenu.querySelectorAll('.side-nav__item');
    items.forEach(function (item) {
      if (item.dataset.tab === tabKey) {
        item.classList.add('side-nav__item--active');
      } else {
        item.classList.remove('side-nav__item--active');
      }
    });

    // Update Property Overview Header
    if (DOM.propertyHeading) DOM.propertyHeading.textContent = data.name;
    if (DOM.locationBtn) DOM.locationBtn.textContent = data.location;
    if (DOM.ratingScore) DOM.ratingScore.textContent = data.rating;
    if (DOM.voteCountLabel) DOM.voteCountLabel.textContent = data.votes;

    // Update Gallery Photos with fade transition
    data.photos.forEach(function (url, idx) {
      if (DOM.galleryPhotos[idx]) {
        DOM.galleryPhotos[idx].style.opacity = '0.5';
        setTimeout(function () {
          DOM.galleryPhotos[idx].src = url;
          DOM.galleryPhotos[idx].style.opacity = '1';
        }, 150);
      }
    });

    // Update Descriptions
    if (DOM.descParagraph1) DOM.descParagraph1.textContent = data.desc1;
    if (DOM.descParagraph2) DOM.descParagraph2.textContent = data.desc2;

    // Update Amenities List
    if (DOM.amenitiesList) {
      DOM.amenitiesList.innerHTML = '';
      data.amenities.forEach(function (amenity) {
        const li = document.createElement('li');
        li.className = 'list__item';
        li.textContent = amenity;
        DOM.amenitiesList.appendChild(li);
      });
    }

    // Update Booking CTA Section
    state.bookingData.roomsLeft = data.roomsLeft;
    state.bookingData.selectedTierPrice = data.basePrice;
    if (DOM.availableRoomsCount) DOM.availableRoomsCount.textContent = data.roomsLeft;
    if (DOM.bookingDestination) DOM.bookingDestination.value = data.name + ' (' + data.location + ')';

    recalculateBookingTotal();
    showToast('Viewing ' + data.name);
  }

  // --------------------------------------------------------------------------
  // 5. Booking Modal & Price Calculator
  // --------------------------------------------------------------------------
  function recalculateBookingTotal() {
    if (!DOM.roomTypeSelect || !DOM.estimatedTotalAmount) return;
    const tierPrice = parseInt(DOM.roomTypeSelect.value, 10) || state.bookingData.selectedTierPrice;
    const total = tierPrice * state.bookingData.nights;
    DOM.estimatedTotalAmount.textContent = '$' + total + ' USD';
  }

  function openBookingModal() {
    if (!DOM.bookingModalOverlay) return;
    DOM.bookingModalOverlay.classList.add('active');
    state.activeModal = true;
    document.body.style.overflow = 'hidden';

    // Set default check-in date to tomorrow
    if (DOM.bookingDates && !DOM.bookingDates.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      DOM.bookingDates.value = tomorrow.toISOString().split('T')[0];
    }
  }

  function closeBookingModal() {
    if (!DOM.bookingModalOverlay) return;
    DOM.bookingModalOverlay.classList.remove('active');
    state.activeModal = false;
    document.body.style.overflow = '';
  }

  function handleBookingSubmit(e) {
    e.preventDefault();

    if (state.bookingData.roomsLeft > 0) {
      state.bookingData.roomsLeft -= 1;
      if (DOM.availableRoomsCount) DOM.availableRoomsCount.textContent = state.bookingData.roomsLeft;
    }

    closeBookingModal();
    showToast('Reservation confirmed! Confirmation code: TR-' + Math.floor(100000 + Math.random() * 900000));
  }

  // --------------------------------------------------------------------------
  // 6. Toast Notification Manager
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    if (!DOM.globalToast || !DOM.toastMessage) return;
    DOM.toastMessage.textContent = message;
    DOM.globalToast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      DOM.globalToast.classList.remove('show');
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // 7. Review Reaction Handler (LocalStorage)
  // --------------------------------------------------------------------------
  function setupReviewReactions() {
    const buttons = document.querySelectorAll('.review__helpful-btn');
    buttons.forEach(function (btn) {
      const reviewId = btn.dataset.review;
      const countSpan = btn.querySelector('.helpful-count');

      // Hydrate state from localStorage
      if (state.helpfulVotes[reviewId]) {
        btn.classList.add('voted');
      }

      btn.addEventListener('click', function () {
        const count = parseInt(countSpan.textContent, 10);
        if (state.helpfulVotes[reviewId]) {
          // Untoggle
          delete state.helpfulVotes[reviewId];
          btn.classList.remove('voted');
          countSpan.textContent = count - 1;
          showToast('Vote removed');
        } else {
          // Upvote
          state.helpfulVotes[reviewId] = true;
          btn.classList.add('voted');
          countSpan.textContent = count + 1;
          showToast('Thanks for your review feedback!');
        }
        localStorage.setItem('trillo_helpful_reviews', JSON.stringify(state.helpfulVotes));
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. Live Search Query Handler
  // --------------------------------------------------------------------------
  function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) return;

    // Search against catalogs
    let matchedTab = null;
    Object.keys(DESTINATION_CATALOG).forEach(function (key) {
      const item = DESTINATION_CATALOG[key];
      if (
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.amenities.some(function (a) { return a.toLowerCase().includes(query); })
      ) {
        if (!matchedTab) matchedTab = key;
      }
    });

    if (matchedTab && matchedTab !== state.currentTab) {
      switchTab(matchedTab);
      showToast('Found destination matching "' + query + '"');
    }
  }

  // --------------------------------------------------------------------------
  // 9. Dropdown Menu Toggle Handlers
  // --------------------------------------------------------------------------
  function toggleDropdown(dropdownElement) {
    const isOpen = dropdownElement.classList.contains('active');
    closeAllDropdowns();
    if (!isOpen) {
      dropdownElement.classList.add('active');
    }
  }

  function closeAllDropdowns() {
    if (DOM.bookmarkDropdown) DOM.bookmarkDropdown.classList.remove('active');
    if (DOM.chatDropdown) DOM.chatDropdown.classList.remove('active');
  }

  // --------------------------------------------------------------------------
  // 10. Event Listener Wire-up
  // --------------------------------------------------------------------------
  function init() {
    // Sidebar Tab Clicking
    if (DOM.sidebarMenu) {
      DOM.sidebarMenu.addEventListener('click', function (e) {
        const item = e.target.closest('.side-nav__item');
        if (item && item.dataset.tab) {
          e.preventDefault();
          switchTab(item.dataset.tab);
        }
      });
    }

    // Booking Modal Listeners
    if (DOM.openBookingModalBtn) {
      DOM.openBookingModalBtn.addEventListener('click', openBookingModal);
    }
    if (DOM.closeModalBtn) {
      DOM.closeModalBtn.addEventListener('click', closeBookingModal);
    }
    if (DOM.bookingModalOverlay) {
      DOM.bookingModalOverlay.addEventListener('click', function (e) {
        if (e.target === DOM.bookingModalOverlay) {
          closeBookingModal();
        }
      });
    }
    if (DOM.roomTypeSelect) {
      DOM.roomTypeSelect.addEventListener('change', recalculateBookingTotal);
    }
    if (DOM.bookingForm) {
      DOM.bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Dropdown Toggles
    if (DOM.bookmarkBtn) {
      DOM.bookmarkBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(DOM.bookmarkDropdown);
      });
    }
    if (DOM.chatBtn) {
      DOM.chatBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(DOM.chatDropdown);
      });
    }

    // Close Dropdowns on document click
    document.addEventListener('click', function () {
      closeAllDropdowns();
    });

    // Keyboard Shortcuts (Escape to dismiss)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (state.activeModal) closeBookingModal();
        closeAllDropdowns();
      }
    });

    // Search Input Real-time Filtering
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', handleSearchInput);
    }

    // Location button micro-interaction
    if (DOM.locationBtn) {
      DOM.locationBtn.addEventListener('click', function () {
        showToast('Viewing local Portugal weather: 24°C, Sunny Mediterranean breeze.');
      });
    }

    // Setup review voting persistence
    setupReviewReactions();

    // Initial price calculation
    recalculateBookingTotal();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
