// One 60-minute full-body massage. Prices are in Indian rupees.
const massage = {
  name: 'Full-body massage',
  description: 'A gentle, full-body reset.',
  price: 600,
  duration: 60
};
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const form = document.querySelector('#booking-form');
const durationInput = document.querySelector('#duration');
const review = document.querySelector('#booking-review');
const confirmButton = document.querySelector('#confirm-request');
const editButton = document.querySelector('#edit-request');
const closeReviewButton = document.querySelector('#close-review');
const reviewStatus = document.querySelector('#review-status');
let sending = false;
const dateInput = document.querySelector('#date');
const timeInput = document.querySelector('#time');
const status = document.querySelector('#form-status');
const submitButton = document.querySelector('#submit-booking');

function updateSummary() {
  const price = massage.price;
  durationInput.value = String(massage.duration);
  document.querySelector('#summary-service').textContent = massage.name;
  document.querySelector('#summary-description').textContent = massage.description;
  document.querySelector('#summary-duration').textContent = `${massage.duration} minutes`;
  document.querySelector('#summary-price').textContent = money.format(price);
  document.querySelector('#estimated-price').value = `INR ${price}`;
  document.querySelector('#summary-date').textContent = formatDate(dateInput.value);
  document.querySelector('#summary-time').textContent = timeInput.value || 'Choose a time';
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Choose a date';
}

// Use the visitor's local date, avoiding UTC date shifts near midnight.
function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function updateDateAndTimes() {
  const now = new Date();
  const today = localDateString(now);
  dateInput.min = today;
  const isToday = dateInput.value === today;
  [...timeInput.options].forEach(option => {
    if (!option.value) return;
    const match = option.value.match(/(\d+):(\d+) (AM|PM)/);
    const hour = Number(match[1]) % 12 + (match[3] === 'PM' ? 12 : 0);
    const minutes = hour * 60 + Number(match[2]);
    option.disabled = isToday && minutes <= now.getHours() * 60 + now.getMinutes();
    if (option.disabled && option.selected) timeInput.value = '';
  });
  const selectedDate = dateInput.value;
  dateInput.setCustomValidity(selectedDate && selectedDate < today ? 'Please choose today or a future date.' : '');
  updateSummary();
}

document.querySelectorAll('[data-massage-price]').forEach(element => {
  element.textContent = money.format(massage.price);
});
timeInput.addEventListener('change', updateSummary);
dateInput.addEventListener('change', updateDateAndTimes);
window.addEventListener('focus', updateDateAndTimes);

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });

// Keep the native form usable without JavaScript; enhance it with an explicit review step.
submitButton.innerHTML = 'Review my request <span aria-hidden="true">↗</span>';

function fillReview() {
  document.querySelector('#review-date').textContent = formatDate(dateInput.value);
  document.querySelector('#review-time').textContent = timeInput.value;
  for (const field of ['name', 'phone', 'area', 'email', 'notes']) {
    const value = form.elements.namedItem(field).value.trim();
    document.querySelector(`#review-${field}`).textContent = value;
    const row = document.querySelector(`#review-${field}-row`);
    if (row) row.hidden = !value;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (sending) return;
  updateDateAndTimes();
  if (!form.reportValidity()) return;
  status.hidden = true;
  reviewStatus.hidden = true;
  fillReview();
  document.body.classList.add('review-open');
  review.showModal();
  document.querySelector('#review-title').focus();
});

function closeReview() {
  if (!sending) review.close();
}
editButton.addEventListener('click', closeReview);
closeReviewButton.addEventListener('click', closeReview);
review.addEventListener('cancel', event => { if (sending) event.preventDefault(); });
review.addEventListener('close', () => {
  document.body.classList.remove('review-open');
  submitButton.focus();
});

confirmButton.addEventListener('click', async () => {
  if (sending) return;
  updateDateAndTimes();
  if (!form.checkValidity()) {
    review.close();
    form.reportValidity();
    return;
  }
  reviewStatus.hidden = true;

  // Local previews validate the request without pretending to book an appointment.
  if (['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) || location.protocol === 'file:') {
    review.close();
    status.textContent = 'Preview only — your request is ready, but no request was sent. Live requests are received through Netlify Forms after deployment.';
    status.hidden = false;
    status.scrollIntoView({ block: 'center' });
    return;
  }

  sending = true;
  confirmButton.disabled = true;
  editButton.disabled = true;
  closeReviewButton.disabled = true;
  submitButton.disabled = true;
  confirmButton.textContent = 'Sending your request…';
  review.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Booking submission failed.');
    location.assign('thank-you.html');
  } catch {
    reviewStatus.textContent = 'We couldn’t confirm that your request was received. Please call or WhatsApp us using the links below before retrying, to avoid sending a duplicate request.';
    reviewStatus.hidden = false;
    sending = false;
    confirmButton.disabled = false;
    editButton.disabled = false;
    closeReviewButton.disabled = false;
    submitButton.disabled = false;
    confirmButton.innerHTML = 'Try again <span aria-hidden="true">↗</span>';
    review.removeAttribute('aria-busy');
  } finally {
    clearTimeout(timeout);
  }
});

updateSummary();
updateDateAndTimes();
