let config = {
  apiKey: '',
  model: 'claude-3-haiku-20240307'
};

// Enhanced prompt templates with markdown instructions
const PROMPT_TEMPLATES = {
  elaborate: `Analyze this content in detail and provide a comprehensive summary using markdown formatting. Follow these guidelines:

1. Start with a level-1 header "# Detailed Analysis"
2. Include a brief overview paragraph
3. Use level-2 headers (##) for main sections
4. Put key concepts and important terms in **bold**
5. Use bullet points for listing details
6. Include relevant quotes with > blockquotes if applicable
7. Target audience: technical specialists and domain experts

Format the response using proper markdown syntax throughout.

Content:\n`,
  
  executive: `Provide an executive summary using clear markdown formatting. Follow these guidelines:

1. Start with a level-1 header "# Executive Summary"
2. Include a **Key Takeaways** section at the top
3. Use bullet points for main points
4. Put metrics and important findings in **bold**
5. Use level-2 headers (##) for different sections
6. Keep sentences concise and focused
7. Target audience: decision-makers and executives

Format the response using proper markdown syntax throughout.

Content:\n`,
  
  simplified: `Explain this content in simple terms using clear markdown formatting. Follow these guidelines:

1. Start with a level-1 header "# Simple Overview"
2. Write short, clear paragraphs
3. Use bullet points for easy reading
4. Put important ideas in **bold**
5. Use level-2 headers (##) to organize topics
6. Avoid technical jargon
7. Include a "## Key Points" section
8. Target audience: general readers

Format the response using proper markdown syntax throughout.

Content:\n`
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