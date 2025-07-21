// content.js

// Using an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope
(function() {

  // === PROBLEM SCRAPING LOGIC ===

  // Function to convert basic HTML to plain text
  function htmlToText(html) {
    if (!html) return "";
    let temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  // Scrapes problem data from LeetCode pages
  function getLeetCodeProblemData() {
    try {
      // Modern LeetCode pages store data in a <script> tag
      const script = document.querySelector("#__NEXT_DATA__");
      if (script) {
        const data = JSON.parse(script.textContent);
        const q = data.props?.pageProps?.question;
        if (q) {
          return {
            platform: "LeetCode",
            title: q.title,
            slug: q.titleSlug,
            difficulty: q.difficulty,
            tags: q.topicTags.map((t) => t.name),
            content: htmlToText(q.content), // Convert HTML content to plain text
          };
        }
      }
    } catch (e) {
      console.warn("Hint Extension: __NEXT_DATA__ parsing failed, falling back to DOM scraping.", e);
    }

    // Fallback for older versions or if the above method fails
    const titleEl = document.querySelector('.text-title-large a') || document.querySelector('[data-cy="question-title"]');
    const title = titleEl?.innerText.trim() || null;
    const slug = location.pathname.split("/").filter(Boolean).pop();
    const difficulty = document.querySelector('.mt-3 .text-difficulty-easy, .mt-3 .text-difficulty-medium, .mt-3 .text-difficulty-hard')?.innerText.trim() || null;
    const tags = Array.from(document.querySelectorAll('a[href*="/tag/"]')).map(a => a.innerText.trim());
    const content = document.querySelector('[class^="xtext-"]')?.innerText || ""; // Get plain text


    if (!title) return null;
    return { platform: "LeetCode", title, slug, difficulty, tags, content };
  }

  // Scrapes problem data from Codeforces pages
  function getCodeforcesProblemData() {
    const title = document.querySelector(".problem-statement .title")?.textContent?.trim().substring(2) || null;
    if (!title) return null;

    const tags = Array.from(document.querySelectorAll(".problem-statement .tag-box")).map((tag) => tag.textContent.trim());
    const match = window.location.pathname.match(/problem\/(\d+)\/([A-Z]\d?)/);
    const content = document.querySelector('.problem-statement > div:nth-child(2)')?.innerText || ""; // Get plain text

    return {
      platform: "Codeforces",
      contestId: match ? match[1] : null,
      index: match ? match[2] : null,
      title,
      tags,
      content,
    };
  }

  // Determines which platform is active and calls the appropriate scraper
  function getProblemInfo() {
    if (location.hostname.includes("leetcode.com")) return getLeetCodeProblemData();
    if (location.hostname.includes("codeforces.com")) return getCodeforcesProblemData();
    return null;
  }

  // === UI & MODAL INJECTION ===

  // Creates and injects the modal for displaying hints
  function createModal() {
    const modal = document.createElement("div");
    modal.id = "hint-modal";
    modal.innerHTML = `
      <div id="hint-modal-content">
        <button id="hint-modal-close">&times;</button>
        <div id="hint-modal-header">
          <h2>Hints:</h2>
        </div>
        <div id="hint-modal-body">
          <div class="loader"></div>
          <p>Generating hints for you...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners to close the modal
    document.getElementById("hint-modal-close").onclick = () => modal.style.display = "none";
    modal.onclick = (e) => {
      if (e.target.id === "hint-modal") {
        modal.style.display = "none";
      }
    };
    return modal;
  }

  // Create the main button to trigger the hints
  const hintButton = document.createElement("button");
  hintButton.id = "show-hint-button";
  // MODIFIED: Replaced brain SVG with a lightbulb SVG
  hintButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20a1 1 0 0 1-1 1H5a1 1 0 0 1 0-2h4a1 1 0 0 1 1 1zm8-1a1 1 0 0 0-1-1h-4a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1zm-7-3a1 1 0 0 1-1 1H7a1 1 0 1 1 0-2h3a1 1 0 0 1 1 1zm-7-5a1 1 0 0 0 0 2h1a1 1 0 1 0 0-2H4zm16 0a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1zM12 2a6 6 0 0 0-5 9.32V15a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.68A6 6 0 0 0 12 2zm-3 5a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H9zm7 0a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1z"/></svg>
    <span>Get Hints</span>
  `;
  document.body.appendChild(hintButton);

  const modal = createModal();

  // === EVENT HANDLING ===

  hintButton.onclick = () => {
    // Reset and show the modal in its loading state
    modal.style.display = "flex";
    modal.querySelector("#hint-modal-body").innerHTML = `
      <div class="loader"></div>
      <p>Getting problem info and generating hints...</p>
    `;

    // Use a small timeout to ensure the DOM is fully loaded
    setTimeout(() => {
        const info = getProblemInfo();
        if (!info) {
            modal.querySelector("#hint-modal-body").innerHTML = `<p class="error">Could not extract problem information from this page. Please make sure you are on a valid problem page.</p>`;
            return;
        }

        // Send problem info to the background script to fetch hints
        chrome.runtime.sendMessage({
            action: "getHints",
            problemInfo: info
        }, (response) => {
            const body = modal.querySelector("#hint-modal-body");
            if (chrome.runtime.lastError) {
                body.innerHTML = `<p class="error">Error: ${chrome.runtime.lastError.message}</p>`;
                return;
            }

            if (response.success) {
                const hintsArray = response.hints.split(/\n\s*\*\s*/).filter(h => h.trim() !== '');

                let accordionHTML = '';
                hintsArray.forEach((hint, index) => {
                    let hintContent = hint.replace(/^Hint\s*\d*[:\-]\s*/i, '').trim();
                    hintContent = hintContent
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.*?)`/g, '<code>$1</code>');

                    accordionHTML += `
                        <div class="hint-accordion">
                            <button class="hint-accordion-header">
                                <span>Hint ${index + 1}</span>
                                <span class="icon">+</span>
                            </button>
                            <div class="hint-accordion-panel">
                                <p>${hintContent}</p>
                            </div>
                        </div>
                    `;
                });
                
                body.innerHTML = accordionHTML || '<p class="error">No hints were generated. Try again.</p>';

                // Add event listeners to the new accordion buttons
                document.querySelectorAll('.hint-accordion-header').forEach(button => {
                    // Single click now toggles the hint
                    button.addEventListener('click', function() {
                        this.classList.toggle('active');
                        const icon = this.querySelector('.icon');
                        const panel = this.nextElementSibling;
                        
                        if (panel.style.maxHeight) {
                            // If open, close it
                            panel.style.maxHeight = null;
                            if (icon) icon.textContent = '+';
                        } else {
                            // If closed, open it
                            panel.style.maxHeight = panel.scrollHeight + "px";
                            if (icon) icon.textContent = '−';
                        }
                    });
                });

            } else {
                body.innerHTML = `<p class="error">${response.error}</p>`;
            }
        });
    }, 150);
  };

})();
