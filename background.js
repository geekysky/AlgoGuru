// background.js

// Listen for a message from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is to get hints
  if (request.action === "getHints") {
    // Ensure we have problem info to work with
    if (!request.problemInfo) {
      sendResponse({
        success: false,
        error: "Problem information was not provided."
      });
      return true; // Indicates that the response will be sent asynchronously
    }

    // Retrieve the API key from Chrome's synchronized storage
    chrome.storage.sync.get(['apiKey'], async (result) => {
      const apiKey = result.apiKey;
      if (!apiKey) {
        sendResponse({
          success: false,
          error: "Gemini API key not found. Please set it in the extension popup."
        });
        return;
      }

      const problemInfo = request.problemInfo;
      // NEW: Truncate problem content to avoid excessive token usage
      const truncatedContent = problemInfo.content ? problemInfo.content.substring(0, 4000) : 'Not available';

      // NEW: Enhanced prompt that includes the problem statement
      const prompt = `
        You are an expert competitive programming assistant.
        Your task is to provide helpful hints for the following problem without giving away the solution or writing any code.
        Use the provided problem statement to generate high-quality, relevant hints.

        Please generate 3 to 5 short, incremental hints. Start with a very high-level concept and gradually become more specific with each hint. The goal is to guide the user to discover the solution on their own.

        Format your response in Markdown, with each hint on a new line starting with an asterisk (*).

        **Problem Details:**
        - **Platform:** ${problemInfo.platform}
        - **Title:** ${problemInfo.title}
        - **Difficulty:** ${problemInfo.difficulty || 'Not specified'}
        - **Tags:** ${problemInfo.tags ? problemInfo.tags.join(', ') : 'Not specified'}

        **Problem Statement:**
        ${truncatedContent}
      `;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      try {
        // Fetch hints from the Gemini API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
             generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 4096,
             }
          }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }

        const data = await response.json();
        // Extract the generated text from the API response
        const hints = data.candidates[0].content.parts[0].text;
        sendResponse({ success: true, hints: hints });

      } catch (error) {
        console.error('Error calling Gemini API:', error);
        sendResponse({ success: false, error: `Failed to fetch hints: ${error.message}` });
      }
    });

    return true; // Keep the message channel open for the asynchronous response
  }
});
