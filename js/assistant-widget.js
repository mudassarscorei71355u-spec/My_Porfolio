// assistant-widget.js - Floating AI assistant widget for portfolio pages

let assistantWidgetInitialized = false;

function createAssistantWidgetMarkup() {
    if (document.getElementById('assistantWidget')) {
        return;
    }

    const markup = `
    <div class="assistant-widget" id="assistantWidget">
      <div class="assistant-panel" id="assistantPanel" aria-hidden="true">
        <div class="assistant-header">
          <div>
            <div class="assistant-title">AI Portfolio Assistant</div>
            <div class="assistant-subtitle">Ask about skills, projects, learning, contact, or CV.</div>
          </div>
          <button id="assistantCloseBtn" class="assistant-close-btn" aria-label="Close Assistant"><i class="fas fa-times"></i></button>
        </div>
        <div class="assistant-messages" id="assistantMessages" role="log" aria-live="polite">
          <div class="assistant-message assistant-message-bot">Hi! I can answer questions about Mudassar's portfolio, skills, projects, learning, contact, or CV.</div>
        </div>
        <div class="assistant-input-row">
          <input id="assistantInput" type="text" placeholder="Ask about this portfolio..." aria-label="Type your question" />
          <button id="assistantSendBtn" class="assistant-send-btn" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
        </div>
        <div class="assistant-quick-actions">
          <button class="assistant-quick-btn" type="button" data-query="skills">Skills</button>
          <button class="assistant-quick-btn" type="button" data-query="projects">Projects</button>
          <button class="assistant-quick-btn" type="button" data-query="learning">Learning</button>
          <button class="assistant-quick-btn" type="button" data-query="contact">Contact</button>
        </div>
      </div>
      <button class="assistant-launch-btn" id="assistantToggleBtn" aria-label="Open AI Assistant">
        <i class="fas fa-robot"></i>
        <span class="sr-only">Open AI Assistant</span>
      </button>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', markup);
}

function revealAssistantLauncher() {
    const assistantWidget = document.getElementById('assistantWidget');
    if (!assistantWidget) {
        return;
    }
    assistantWidget.classList.add('assistant-visible');
}

function setupAssistantWidget() {
    if (assistantWidgetInitialized) {
        return;
    }
    assistantWidgetInitialized = true;

    createAssistantWidgetMarkup();

    const toggleButton = document.getElementById('assistantToggleBtn');
    const panel = document.getElementById('assistantPanel');
    const closeButton = document.getElementById('assistantCloseBtn');
    const sendButton = document.getElementById('assistantSendBtn');
    const inputField = document.getElementById('assistantInput');
    const quickButtons = document.querySelectorAll('.assistant-quick-btn');

    if (!toggleButton || !panel || !closeButton || !sendButton || !inputField) {
        return;
    }

    function openAssistant() {
        panel.classList.add('assistant-open');
        panel.setAttribute('aria-hidden', 'false');
        inputField.focus();
    }

    function closeAssistant() {
        panel.classList.remove('assistant-open');
        panel.setAttribute('aria-hidden', 'true');
        toggleButton.focus();
    }

    function handleAssistantMessage() {
        const text = inputField.value.trim();
        if (!text) {
            return;
        }
        addAssistantMessage(text, 'user');
        inputField.value = '';
        const reply = getAssistantReply(text);
        setTimeout(() => {
            addAssistantMessage(reply, 'bot');
        }, 180);
    }

    toggleButton.addEventListener('click', function() {
        if (panel.classList.contains('assistant-open')) {
            closeAssistant();
        } else {
            openAssistant();
        }
    });

    closeButton.addEventListener('click', closeAssistant);
    sendButton.addEventListener('click', handleAssistantMessage);

    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAssistantMessage();
        }
    });

    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const query = button.dataset.query || button.textContent;
            inputField.value = query;
            handleAssistantMessage();
        });
    });

    document.addEventListener('click', function(event) {
        if (!panel.classList.contains('assistant-open')) {
            return;
        }
        const clickedInside = event.target.closest('#assistantPanel') || event.target.closest('#assistantToggleBtn');
        if (!clickedInside) {
            closeAssistant();
        }
    });

    window.addEventListener('portfolio:ready', function() {
        window.setTimeout(revealAssistantLauncher, 400);
    });
}

function addAssistantMessage(text, sender) {
    const container = document.getElementById('assistantMessages');
    if (!container) {
        return;
    }
    const message = document.createElement('div');
    message.className = 'assistant-message ' + (sender === 'user' ? 'assistant-message-user' : 'assistant-message-bot');
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

function getAssistantReply(inputText) {
    const message = inputText.toLowerCase();
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const thanks = ['thank', 'thanks', 'appreciate', 'nice'];
    const skills = ['skill', 'skills', 'technology', 'technologies', 'stack', 'language', 'framework', 'frameworks'];
    const contact = ['contact', 'phone', 'email', 'whatsapp', 'github', 'linkedin', 'address', 'reach', 'message'];
    const projects = ['project', 'projects', 'work', 'portfolio', 'app', 'website', 'github'];
    const learning = ['learn', 'learning', 'course', 'study', 'certificate', 'certificates', 'journey', 'training'];
    const cv = ['cv', 'resume', 'curriculum', 'vitae', 'download cv', 'view cv'];
    const irrelevant = ['weather', 'movie', 'music', 'food', 'travel', 'sports', 'politics', 'news', 'joke', 'dating', 'recipe'];

    if (greetings.some(word => message.includes(word))) {
        return 'Hi! I’m Mudassar’s portfolio assistant. Ask me about skills, projects, learning, contact, or CV.';
    }
    if (thanks.some(word => message.includes(word))) {
        return 'You’re welcome! Ask me anything about Mudassar’s portfolio, skills, projects, learning path, or contact info.';
    }
    if (irrelevant.some(word => message.includes(word))) {
        return 'I am focused on Mudassar’s portfolio, skills, projects, learning, contact, and CV. Please ask about one of those subjects.';
    }
    if (cv.some(word => message.includes(word))) {
        return 'Mudassar’s CV is available on the CV page. It highlights education, technical skills, software projects, and achievements.';
    }
    if (contact.some(word => message.includes(word))) {
        return 'You can reach Mudassar at mudssars.core.i7.1355u@gmail.com, phone 0336-9483957, or WhatsApp at +92 336 9483957. A GitHub link is also available in the Contact section.';
    }
    if (learning.some(word => message.includes(word))) {
        return 'The Learning page shows Mudassar’s self-study progress, certificates earned, and topics covered in web development, databases, and modern stacks.';
    }
    if (projects.some(word => message.includes(word))) {
        return 'Projects include full-stack portals, portfolio websites, and practical apps built with JavaScript, Node.js, Svelte, PostgreSQL, and more. Visit the Projects page for details.';
    }
    if (skills.some(word => message.includes(word))) {
        return 'Mudassar’s technical strengths include Java, C++, Python, Next.js, Node.js, PostgreSQL, Oracle SQL, Linux, Svelte, Express, and modern web application development.';
    }
    if (message.includes('portfolio') || message.includes('about you') || message.includes('who are you') || message.includes('tell me')) {
        return 'This portfolio belongs to Mudassar Hussain, a software engineering student building clean, full-stack applications and learning technologies like JavaScript, SQL, and modern frameworks.';
    }
    return 'I’m here to answer questions about Mudassar’s portfolio, skills, projects, learning, contact info, and CV. Please ask about one of those topics.';
}

window.setupAssistantWidget = setupAssistantWidget;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAssistantWidget);
} else {
    setupAssistantWidget();
}
