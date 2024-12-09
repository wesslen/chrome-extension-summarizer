let config = {
  apiKey: '',
  model: 'claude-3-haiku-20240307'
};

// Prompt templates for different styles
const PROMPT_TEMPLATES = {
  elaborate: `Analyze this content in detail, focusing on technical aspects and providing comprehensive insights. Target audience: technical specialists and domain experts.\n\nContent:\n`,
  
  executive: `Provide a concise executive summary with key points in bullet format. Focus on main takeaways and business implications. Target audience: decision-makers and executives.\n\nContent:\n`,
  
  simplified: `Explain this content in simple, easy-to-understand terms. Use short sentences and avoid technical jargon. Target audience: general readers.\n\nContent:\n`
};

// Update config whenever storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.apiKey) {
    config.apiKey = changes.apiKey.newValue;
  }
});

// Initialize config from storage
chrome.storage.local.get(['apiKey'], (result) => {
  if (result.apiKey) {
    config.apiKey = result.apiKey;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.url, request.style)
      .then(summary => sendResponse({ summary }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function handleSummarize(url, style) {
  if (!config.apiKey) {
    throw new Error('API key not set. Please set it in the extension options.');
  }

  // Convert URL to markdown using r.jina.ai
  const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
  
  try {
    const mdResponse = await fetch(jinaUrl);
    
    if (!mdResponse.ok) {
      throw new Error(`Failed to convert page to markdown. Status: ${mdResponse.status}`);
    }
    
    const mdContent = await mdResponse.text();
    const promptTemplate = PROMPT_TEMPLATES[style] || PROMPT_TEMPLATES.elaborate;

    // Prepare request for Anthropic API
    const requestBody = {
      model: config.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: promptTemplate + mdContent
        }
      ]
    };
    
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
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
    return data.content[0].text;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}