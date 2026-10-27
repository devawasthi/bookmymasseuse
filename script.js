// One full-body massage, with two session lengths. Prices are in Indian rupees.
const massage = {
  name: 'Full-body massage',
  description: 'A gentle, full-body reset.',
  prices: { 60: 600, 90: 600 }
};
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const form = document.querySelector('#booking-form');
const durationInput = document.querySelector('#duration');
const dateInput = document.querySelector('#date');
const timeInput = document.querySelector('#time');
const status = document.querySelector('#form-status');
const submitButton = document.querySelector('#submit-booking');

function updateSummary() {
  const price = massage.prices[durationInput.value];
  document.querySelector('#summary-service').textContent = massage.name;
  document.querySelector('#summary-description').textContent = massage.description;
  document.querySelector('#summary-duration').textContent = `${durationInput.value} minutes`;
  document.querySelector('#summary-price').textContent = money.format(price);
  document.querySelector('#estimated-price').value = `INR ${price}`;
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
}

document.querySelectorAll('[data-massage-price]').forEach(element => {
  element.textContent = money.format(massage.prices[60]);
});
durationInput.addEventListener('change', updateSummary);
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

form.addEventListener('submit', async event => {
  event.preventDefault();
  updateDateAndTimes();
  if (!form.reportValidity()) return;
  status.hidden = true;

  // A local preview must never pretend to send a real booking request.
  if (['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) || location.protocol === 'file:') {
    status.textContent = 'Preview only — your form is valid, but no request was sent. After deployment, enable Netlify form detection and redeploy to receive booking requests.';
    status.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Sending your request…';
  form.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    });
    if (!response.ok) throw new Error('Booking submission failed.');
    location.assign('thank-you.html');
  } catch {
    status.textContent = 'We couldn’t send your request. Please check your connection and try again. Your appointment has not been booked.';
    status.hidden = false;
    submitButton.disabled = false;
    submitButton.innerHTML = 'Try again <span aria-hidden="true">↗</span>';
    form.removeAttribute('aria-busy');
  }
});

updateSummary();
updateDateAndTimes();
