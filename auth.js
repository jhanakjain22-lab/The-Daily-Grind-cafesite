// ===== AUTH HELPERS =====
function getCurrentUser() {
  const session = localStorage.getItem('cafe_session');
  return session ? JSON.parse(session) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('cafe_session', JSON.stringify(user));
}

function logout() {
  AuthService.logout();
}

// ===== REGISTER =====
async function handleRegister(e) {
  e.preventDefault();
  const errorEl = document.getElementById('register-error');
  const successEl = document.getElementById('register-success');
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  try {
    await AuthService.register({ name, email, password });
    successEl.textContent = 'Account created! Redirecting to login...';
    successEl.style.display = 'block';
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  } catch (err) {
    errorEl.textContent = err.message || 'Registration failed.';
    errorEl.style.display = 'block';
  }
}

// ===== LOGIN =====
async function handleLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.style.display = 'none';

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  try {
    const user = await AuthService.login({ email, password });
    setCurrentUser(user);
    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Invalid email or password.';
    errorEl.style.display = 'block';
  }
}

// ===== UPDATE NAV =====
function updateNavAuth() {
  const user = getCurrentUser();
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  if (user) {
    navLinks.innerHTML = `
      <li><a href="#menu">Menu</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
      <li class="nav-user">Hello, ${user.name}</li>
      <li><a href="#" onclick="logout()" class="nav-logout">Logout</a></li>
    `;
  }
}
