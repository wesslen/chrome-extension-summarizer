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

// Open options page
document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

document.getElementById('summarize').addEventListener('click', async () => {
  const summaryDiv = document.getElementById('summary');
  hideError();

  // Check if API key is set
  const hasApiKey = await checkApiKey();
  if (!hasApiKey) {
    showError('Please set your OpenAI API key in the extension options first.');
    return;
  }

  // Show loading state
  summaryDiv.textContent = 'Generating summary...';
  summaryDiv.className = 'loading';

  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      url: tab.url
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