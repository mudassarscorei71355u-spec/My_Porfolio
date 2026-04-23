// Projects Data from CV
const projectsData = [
  {
    name: "🛒 BuyNest - E-Commerce Platform",
    tech: ["Next.js", "Node.js", "Express.js", "PostgreSQL"],
    desc: "Full e-commerce system with auth, role-based access, REST APIs, JWT login, and relational database integration.",
    icon: "fa-store"
  },
  {
    name: "💬 SocialNest - Social Media App",
    tech: ["JavaFX", "PostgreSQL"],
    desc: "Desktop social platform with posts, likes, comments, follows; MVC-based design and interactive UI.",
    icon: "fa-users"
  },
  {
    name: "🧾 SaleSync - POS System",
    tech: ["C++", "GTK"],
    desc: "Billing and inventory system with invoices, reports, and file-based storage for small businesses.",
    icon: "fa-receipt"
  },
  {
    name: "🎓 UniCore - University System",
    tech: ["Next.js", "FastAPI", "PostgreSQL"],
    desc: "Multi-module system for students, staff, attendance, fees, and courses with role-based dashboards.",
    icon: "fa-university"
  },
  {
    name: "💬 SyncChat - Chat App",
    tech: ["Node.js", "WebSockets", "PostgreSQL"],
    desc: "Real-time messaging with private/group chats, typing indicators, and persistent chat history.",
    icon: "fa-comments"
  },
  {
    name: "🔐 SecureVault - File Encryption",
    tech: ["Python", "Flask", "AES"],
    desc: "Secure encrypted file storage with authentication, access control, upload/download system.",
    icon: "fa-lock"
  }
];

// Skills from CV
const coreSkills = ["Oracle", "SQL", "Linux/Unix Command line", "Python", "C++", "JAVA", "WEB Development", "Typing"];
const moreSkills = ["Next.js", "Node.js", "Express.js", "PostgreSQL", "JavaFX", "FastAPI", "Flask", "Git", "REST APIs", "Data Structures", "OOP"];

// Render Projects
function renderProjects() {
  const container = document.getElementById('projectsContainer');
  if (!container) return;
  container.innerHTML = '';
  projectsData.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-icon"><i class="fas ${proj.icon}"></i></div>
      <h3>${proj.name}</h3>
      <div class="tech-stack">
        ${proj.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
      </div>
      <p>${proj.desc}</p>
    `;
    container.appendChild(card);
  });
}

// Render Skills
function renderSkills() {
  const skillsContainer = document.getElementById('skillsList');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    coreSkills.forEach(skill => {
      const badge = document.createElement('span');
      badge.className = 'skill-tag';
      badge.innerHTML = `<i class="fas fa-check-circle" style="font-size:0.8rem; margin-right:6px;"></i>${skill}`;
      skillsContainer.appendChild(badge);
    });
  }
  const extraToolsContainer = document.getElementById('extraTools');
  if (extraToolsContainer) {
    extraToolsContainer.innerHTML = '';
    moreSkills.forEach(skill => {
      const badge = document.createElement('span');
      badge.className = 'skill-tag';
      badge.innerHTML = `<i class="fas fa-microchip"></i> ${skill}`;
      extraToolsContainer.appendChild(badge);
    });
  }
}

// Toast notification
function showToast(msg) {
  let toast = document.querySelector('.custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#1e293b';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '40px';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    toast.style.fontSize = '0.9rem';
    toast.style.backdropFilter = 'blur(8px)';
    toast.style.background = '#0f172ae6';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.style.display = 'none';
    }, 500);
  }, 2000);
}

// Setup interactions (copy phone/email, smooth scroll)
function setupInteractions() {
  // Copy phone number
  const copyBtn = document.getElementById('copyPhoneBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = "0328-5549673";
      navigator.clipboard.writeText(phone).then(() => {
        showToast("📞 Phone number copied to clipboard!");
      }).catch(() => alert("Manual copy: " + phone));
    });
  }

  // Copy email
  const mailLink = document.getElementById('mailLink');
  if (mailLink) {
    mailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = "mudssars.core.i7.1355u@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("📧 Email address copied!");
      }).catch(() => alert("Email: " + email));
    });
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('.nav-links a, .btn-group a[href^="#"], .hero-content a.btn').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderSkills();
  setupInteractions();
});