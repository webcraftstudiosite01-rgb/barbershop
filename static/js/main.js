/**
 * ATELIER // 96 — Premium Barbershop Engine (Static & Dynamic Hybrid)
 * Interactive Booking Wizard, Portfolio Lightbox, Dynamic Slots with Static Fallback
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollAnimations();
  initCategoryTabs();
  initPortfolioFilters();
  initPortfolioLightbox();
  initBookingWizard();
});

// -------------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------------
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -------------------------------------------------------------------
// MOBILE NAVIGATION
// -------------------------------------------------------------------
function initMobileNav() {
  const burgerBtn = document.querySelector('.burger-btn');
  const navLinks = document.querySelector('.nav-links');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

// -------------------------------------------------------------------
// SCROLL REVEAL ANIMATIONS
// -------------------------------------------------------------------
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

// -------------------------------------------------------------------
// SERVICES CATEGORY TABS
// -------------------------------------------------------------------
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tabs .tab-btn');
  const serviceCards = document.querySelectorAll('.services-grid .service-card');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCategory = tab.dataset.category;

      serviceCards.forEach(card => {
        if (targetCategory === 'all' || card.dataset.category === targetCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// -------------------------------------------------------------------
// PORTFOLIO FILTER
// -------------------------------------------------------------------
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter .filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-grid .portfolio-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tag = btn.dataset.tag;

      portfolioItems.forEach(item => {
        if (tag === 'all' || item.dataset.tag === tag) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// -------------------------------------------------------------------
// PORTFOLIO LIGHTBOX
// -------------------------------------------------------------------
function initPortfolioLightbox() {
  const items = document.querySelectorAll('.portfolio-item');
  const modal = document.getElementById('portfolioLightbox');
  if (!modal) return;

  const modalImg = modal.querySelector('.lightbox-img');
  const modalTitle = modal.querySelector('.lightbox-title');
  const modalBarber = modal.querySelector('.lightbox-barber');
  const closeBtn = modal.querySelector('.modal-close-btn');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.portfolio-item-title')?.textContent || '';
      const barber = item.querySelector('.portfolio-item-barber')?.textContent || '';

      if (img && modalImg) {
        modalImg.src = img.src;
        if (modalTitle) modalTitle.textContent = title;
        if (modalBarber) modalBarber.textContent = barber;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// -------------------------------------------------------------------
// BOOKING WIZARD & HYBRID AJAX/LOCAL ENGINE
// -------------------------------------------------------------------
function initBookingWizard() {
  const state = {
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: '',
    barberId: 'any',
    barberName: 'Будь-який вільний майстер',
    date: '',
    timeSlot: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    comment: ''
  };

  const currentStepEl = document.querySelectorAll('.booking-step');
  const stepIndicators = document.querySelectorAll('.stepper .step-indicator');
  const prevBtn = document.getElementById('btnBookingPrev');
  const nextBtn = document.getElementById('btnBookingNext');
  const submitBtn = document.getElementById('btnBookingSubmit');
  const slotsContainer = document.getElementById('timeSlotsContainer');
  const dateInput = document.getElementById('bookingDateInput');

  if (!currentStepEl.length) return;

  let currentStep = 1;

  function updateStepUI() {
    currentStepEl.forEach(step => {
      step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
    });

    stepIndicators.forEach((indicator, idx) => {
      const stepNum = idx + 1;
      indicator.classList.toggle('active', stepNum === currentStep);
      indicator.classList.toggle('completed', stepNum < currentStep);
    });

    if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = currentStep < 4 ? 'inline-flex' : 'none';
    if (submitBtn) submitBtn.style.display = currentStep === 4 ? 'inline-flex' : 'none';

    if (currentStep === 4) {
      updateOrderSummary();
    }
  }

  function validateStep(step) {
    if (step === 1) {
      if (!state.serviceId) {
        showToast('Будь ласка, оберіть послугу зі списку', 'error');
        return false;
      }
      return true;
    }
    if (step === 2) {
      return true;
    }
    if (step === 3) {
      if (!state.date) {
        showToast('Будь ласка, вкажіть дату візиту', 'error');
        return false;
      }
      if (!state.timeSlot) {
        showToast('Будь ласка, оберіть час запису', 'error');
        return false;
      }
      return true;
    }
    return true;
  }

  // 1. Service Cards Selection
  document.querySelectorAll('.service-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.service-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      state.serviceId = card.dataset.id;
      state.serviceName = card.dataset.name;
      state.servicePrice = card.dataset.price;
      state.serviceDuration = card.dataset.duration;
    });
  });

  // 2. Barber Cards Selection
  document.querySelectorAll('.barber-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.barber-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      state.barberId = card.dataset.id;
      state.barberName = card.dataset.name;

      if (state.date) {
        fetchAvailableSlots();
      }
    });
  });

  // 3. Date & Time Slots
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrowStr;
    state.date = tomorrowStr;

    dateInput.addEventListener('change', () => {
      state.date = dateInput.value;
      state.timeSlot = '';
      fetchAvailableSlots();
    });

    fetchAvailableSlots();
  }

  function renderSlots(slots) {
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';
    if (!slots || slots.length === 0) {
      slotsContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 1.5rem; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-medium); border-radius: 4px;">На обрану дату немає вільних вікон. Будь ласка, оберіть інший день або іншого майстра.</div>';
      return;
    }

    slots.forEach(slot => {
      const slotBtn = document.createElement('button');
      slotBtn.type = 'button';
      slotBtn.className = 'time-slot-btn';
      if (state.timeSlot === slot) slotBtn.classList.add('selected');
      slotBtn.textContent = slot;

      slotBtn.addEventListener('click', () => {
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        slotBtn.classList.add('selected');
        state.timeSlot = slot;
      });

      slotsContainer.appendChild(slotBtn);
    });
  }

  function fetchAvailableSlots() {
    if (!slotsContainer || !state.date) return;

    slotsContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 1.5rem; text-align: center; color: var(--text-muted);">Завантаження доступних вікон...</div>';

    const defaultSlots = ['10:00', '11:00', '12:00', '13:00', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:30'];

    const url = `/api/available-slots/?date=${state.date}&barber_id=${state.barberId || 'any'}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then(data => {
        renderSlots(data.slots || defaultSlots);
      })
      .catch(() => {
        // Fallback for static GitHub Pages host
        renderSlots(defaultSlots);
      });
  }

  function updateOrderSummary() {
    const sumService = document.getElementById('summaryService');
    const sumBarber = document.getElementById('summaryBarber');
    const sumDateTime = document.getElementById('summaryDateTime');
    const sumPrice = document.getElementById('summaryPrice');

    if (sumService) sumService.textContent = state.serviceName || '—';
    if (sumBarber) sumBarber.textContent = state.barberName || 'Будь-який вільний майстер';
    if (sumDateTime) sumDateTime.textContent = `${state.date} о ${state.timeSlot || '—'}`;
    if (sumPrice) sumPrice.textContent = `${state.servicePrice} ₴`;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        updateStepUI();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  document.querySelectorAll('.btn-book-master').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const barberId = btn.dataset.barberId;
      const barberName = btn.dataset.barberName;

      document.querySelectorAll('.barber-option-card').forEach(card => {
        if (card.dataset.id === barberId) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
      state.barberId = barberId;
      state.barberName = barberName;

      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
      currentStep = 1;
      updateStepUI();
      showToast(`Обрано майстра: ${barberName}. Тепер оберіть послугу.`, 'info');
    });
  });

  document.querySelectorAll('.btn-select-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceId = btn.dataset.serviceId;
      
      const targetCard = document.querySelector(`.service-option-card[data-id="${serviceId}"]`);
      if (targetCard) {
        document.querySelectorAll('.service-option-card').forEach(c => c.classList.remove('selected'));
        targetCard.classList.add('selected');
        state.serviceId = serviceId;
        state.serviceName = targetCard.dataset.name;
        state.servicePrice = targetCard.dataset.price;
        state.serviceDuration = targetCard.dataset.duration;

        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
        currentStep = 2;
        updateStepUI();
        showToast(`Послугу обрано: ${state.serviceName}. Оберіть майстра.`, 'info');
      }
    });
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('inputClientName');
      const phoneInput = document.getElementById('inputClientPhone');
      const emailInput = document.getElementById('inputClientEmail');
      const commentInput = document.getElementById('inputClientComment');

      state.clientName = nameInput?.value.trim() || '';
      state.clientPhone = phoneInput?.value.trim() || '';
      state.clientEmail = emailInput?.value.trim() || '';
      state.comment = commentInput?.value.trim() || '';

      if (!state.clientName) {
        showToast("Введіть ваше ім'я", 'error');
        nameInput?.focus();
        return;
      }
      if (!state.clientPhone || state.clientPhone.length < 9) {
        showToast('Введіть коректний номер телефону для зв’язку', 'error');
        phoneInput?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Оформлення запису...';

      function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      }

      fetch('/api/book/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({
          service_id: state.serviceId,
          barber_id: state.barberId,
          date: state.date,
          time_slot: state.timeSlot,
          client_name: state.clientName,
          client_phone: state.clientPhone,
          client_email: state.clientEmail,
          comment: state.comment
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('API response not ok');
        return res.json();
      })
      .then(res => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Підтвердити бронювання';

        if (res.success) {
          openSuccessModal(res.booking);
          if (nameInput) nameInput.value = '';
          if (phoneInput) phoneInput.value = '';
          if (commentInput) commentInput.value = '';
        } else {
          showToast(res.message || 'Помилка оформлення', 'error');
        }
      })
      .catch(() => {
        // Fallback for static GitHub Pages host (localStorage persistence)
        submitBtn.disabled = false;
        submitBtn.textContent = 'Підтвердити бронювання';

        const clientBooking = {
          code: `AT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          service: state.serviceName,
          barber: state.barberName,
          date: state.date,
          time: state.timeSlot,
          price: `${state.servicePrice} ₴`
        };

        try {
          const saved = JSON.parse(localStorage.getItem('atelier_bookings') || '[]');
          saved.push({ ...clientBooking, client_name: state.clientName, client_phone: state.clientPhone, created_at: new Date().toISOString() });
          localStorage.setItem('atelier_bookings', JSON.stringify(saved));
        } catch (e) {}

        openSuccessModal(clientBooking);
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (commentInput) commentInput.value = '';
      });
    });
  }

  function openSuccessModal(booking) {
    const successModal = document.getElementById('bookingSuccessModal');
    if (!successModal) return;

    document.getElementById('modalBookingCode').textContent = booking.code;
    document.getElementById('modalServiceName').textContent = booking.service;
    document.getElementById('modalBarberName').textContent = booking.barber;
    document.getElementById('modalDateTime').textContent = `${booking.date} о ${booking.time}`;
    document.getElementById('modalPrice').textContent = booking.price;

    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeBtn = successModal.querySelector('.modal-close-btn');
    const closeActionBtn = document.getElementById('btnCloseSuccessModal');

    const closeFn = () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
      currentStep = 1;
      updateStepUI();
    };

    if (closeBtn) closeBtn.onclick = closeFn;
    if (closeActionBtn) closeActionBtn.onclick = closeFn;
  }
}
