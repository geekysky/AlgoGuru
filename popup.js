// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load the saved API key when the popup opens, if it exists
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // Save the API key when the 'Save' button is clicked
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            // Save the key to chrome.storage.sync
            chrome.storage.sync.set({ apiKey: apiKey }, () => {
                statusDiv.textContent = 'API Key saved!';
                statusDiv.style.color = '#98c379'; // Green for success
                // Clear the status message after 2 seconds
                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 2000);
            });
        } else {
            // Show an error if the input is empty
            statusDiv.textContent = 'Please enter a valid API key.';
            statusDiv.style.color = '#e06c75'; // Red for error
        }
    });
});
