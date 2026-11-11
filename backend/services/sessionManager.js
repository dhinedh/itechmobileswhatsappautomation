/**
 * Session Manager & Global Navigation Stack Engine
 * Handles breadcrumb navigation (MENU, BACK, RESTART, AGENT, STOP)
 */

const GLOBAL_COMMANDS = {
  MENU: ['menu', 'main menu', 'home', '0', 'start', 'btn_menu', 'hi', 'hello', 'hey', 'வணக்கம்'],
  BACK: ['back', 'previous', 'prev', 'b', 'btn_back'],
  RESTART: ['restart', 'reset', 'btn_restart'],
  AGENT: ['agent', 'human', 'support', 'executive', 'help', 'technician', 'btn_agent', 'btn_human'],
  STOP: ['stop', 'unsubscribe', 'mute', 'cancel']
};

/**
 * Normalizes input text for keyword detection
 */
function cleanText(text) {
  return (text || '').toLowerCase().trim();
}

/**
 * Checks if incoming text is a global navigation command
 */
function isGlobalCommand(text) {
  const clean = cleanText(text);
  for (const [cmd, triggers] of Object.entries(GLOBAL_COMMANDS)) {
    if (triggers.includes(clean)) {
      return cmd;
    }
  }
  return null;
}

/**
 * Ensures session data structures exist on contact
 */
function initSession(contact) {
  if (!contact.session) {
    contact.session = {
      current_step: 'main_menu',
      history: ['main_menu'],
      wizard_data: {}
    };
  }
  if (!Array.isArray(contact.session.history)) {
    contact.session.history = ['main_menu'];
  }
  if (!contact.session.wizard_data) {
    contact.session.wizard_data = {};
  }
  return contact.session;
}

/**
 * Pushes a new step onto the breadcrumb history stack
 */
function pushStep(contact, stepName, wizardUpdates = {}) {
  const session = initSession(contact);
  session.current_step = stepName;
  
  // Avoid duplicate sequential entries in history
  if (session.history[session.history.length - 1] !== stepName) {
    session.history.push(stepName);
  }
  
  // Merge wizard data
  session.wizard_data = {
    ...session.wizard_data,
    ...wizardUpdates
  };

  return session;
}

/**
 * Pops the current step and returns the previous step
 */
function popStep(contact) {
  const session = initSession(contact);
  if (session.history.length > 1) {
    session.history.pop(); // remove current step
    const prev = session.history[session.history.length - 1];
    session.current_step = prev || 'main_menu';
    return session.current_step;
  }
  session.history = ['main_menu'];
  session.current_step = 'main_menu';
  return 'main_menu';
}

/**
 * Clears current wizard state and returns to main menu
 */
function resetSession(contact) {
  contact.session = {
    current_step: 'main_menu',
    history: ['main_menu'],
    wizard_data: {}
  };
  contact.step = 'main_menu';
  return contact.session;
}

/**
 * Updates wizard data without changing current step
 */
function updateWizardData(contact, updates = {}) {
  const session = initSession(contact);
  session.wizard_data = {
    ...session.wizard_data,
    ...updates
  };
  return session.wizard_data;
}

module.exports = {
  GLOBAL_COMMANDS,
  cleanText,
  isGlobalCommand,
  initSession,
  pushStep,
  popStep,
  resetSession,
  updateWizardData
};

