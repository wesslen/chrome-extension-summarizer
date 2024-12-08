let config = {
  apiKey: '',
  model: 'claude-3-haiku-20240307'  // or whichever Claude model you prefer
};

// Update config whenever storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', namespace, changes);
  if (namespace === 'local' && changes.apiKey) {
    config.apiKey = changes.apiKey.newValue;
    console.log('API key updated in config');
  }
});

// Initialize config from storage
chrome.storage.local.get(['apiKey'], (result) => {
  console.log('Initial storage load:', result);
  if (result.apiKey) {
    config.apiKey = result.apiKey;
    console.log('API key loaded from storage');
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'summarize') {
    console.log('Starting summarization process for URL:', request.url);
    handleSummarize(request.url)
      .then(summary => {
        console.log('Successfully generated summary');
        sendResponse({ summary });
      })
      .catch(error => {
        console.error('Error in summarization:', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

async function handleSummarize(url) {
  console.log('Starting handleSummarize with URL:', url);
  
  if (!config.apiKey) {
    throw new Error('API key not set. Please set it in the extension options.');
  }

  // Convert URL to markdown using r.jina.ai
  const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
  console.log('Fetching from Jina:', jinaUrl);
  
  try {
    // Fetch markdown content
    const mdResponse = await fetch(jinaUrl);
    console.log('Jina response status:', mdResponse.status);
    
    if (!mdResponse.ok) {
      throw new Error(`Failed to convert page to markdown. Status: ${mdResponse.status}`);
    }
    
    const mdContent = await mdResponse.text();
    console.log('Markdown content length:', mdContent.length);

    // Prepare request for Anthropic API
    const requestBody = {
      model: config.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Summarize this website content in a clear and concise way:\n\n${mdContent}`
        }
      ]
    };
    
    console.log('Calling Anthropic API');
    
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'  // Add this header
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Anthropic API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Raw error response:', errorText);
      
      let errorMessage = `Status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += ` - ${errorData.error?.message || errorData.message || errorText}`;
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(`Failed to generate summary. ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Successfully received Anthropic response');
    return data.content[0].text;
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}