// Check if API key is set
async function checkApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      resolve(!!result.apiKey);
    });
  });
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Hide error message
function hideError() {
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'none';
}

// Get selected style
function getSelectedStyle() {
  const selectedRadio = document.querySelector('input[name="style"]:checked');
  return selectedRadio ? selectedRadio.value : 'elaborate';
}

// Save last used style
function saveStyle(style) {
  chrome.storage.local.set({ lastStyle: style });
}

// Load last used style
function loadLastStyle() {
  chrome.storage.local.get(['lastStyle'], (result) => {
    if (result.lastStyle) {
      const radio = document.querySelector(`input[value="${result.lastStyle}"]`);
      if (radio) radio.checked = true;
    }
  });
}

// Open options page
document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadLastStyle();
});

document.getElementById('summarize').addEventListener('click', async () => {
  const summaryDiv = document.getElementById('summary');
  hideError();

  // Check if API key is set
  const hasApiKey = await checkApiKey();
  if (!hasApiKey) {
    showError('Please set your API key in the extension options first.');
    return;
  }

  // Show loading state
  summaryDiv.textContent = 'Generating summary...';
  summaryDiv.className = 'loading';

  try {
    // Get current tab URL and selected style
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const style = getSelectedStyle();
    
    // Save the selected style
    saveStyle(style);
    
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      url: tab.url,
      style: style
    });
    
    if (response.error) {
      showError(response.error);
      summaryDiv.textContent = '';
      summaryDiv.className = '';
    } else {
      summaryDiv.textContent = response.summary;
      summaryDiv.className = '';
    }
  } catch (error) {
    showError(error.message);
    summaryDiv.textContent = '';
    summaryDiv.className = '';
  }
});