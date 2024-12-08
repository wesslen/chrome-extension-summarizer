// Function to show status message
function showStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.display = 'block';
    status.className = isError ? 'error' : 'success';
  }
  
  // Function to save options
  function saveOptions() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', true);
      return;
    }
  
    chrome.storage.local.set({
      apiKey: apiKey,
    }, () => {
      showStatus('Settings saved successfully!');
      
      // Wait for 1 second to show the success message
      setTimeout(() => {
        // Close the options tab and return to the previous page
        window.close();
      }, 1000);
    });
  }
  
  // Load saved options when page opens
  function loadOptions() {
    chrome.storage.local.get(['apiKey'], (result) => {
      if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
      }
    });
  }
  
  // Add event listeners
  document.addEventListener('DOMContentLoaded', loadOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
  
  // Add keyboard shortcut to save (Ctrl/Cmd + S)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveOptions();
    }
  });