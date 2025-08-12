document.addEventListener('DOMContentLoaded', () => {
  const detectButton = document.getElementById('detectButton');
  const resultsDiv = document.getElementById('results');
  const initialText = document.getElementById('initial-text');

  detectButton.addEventListener('click', () => {
    // Hide initial text when the button is clicked
    if (initialText) {
      initialText.style.display = 'none';
    }

    // Run the script to get font details
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: getFontDetails,
        },
        (injectionResults) => {
          const fontInfo = injectionResults[0].result;
          if (fontInfo) {
            resultsDiv.innerHTML = `
              <div class="detail-row">
                <p><strong>Font Family:</strong> <span id="fontFamilyValue">${fontInfo.fontFamily}</span></p>
                <p><strong>Font Size:</strong> <span id="fontSizeValue">${fontInfo.fontSize}</span></p>
                <p><strong>Color:</strong> <span id="colorValue">${fontInfo.color}</span></p>
              </div>
              <button id="copyAllButton" class="copy-all-button">Copy All</button>
            `;

            const copyAllButton = document.getElementById('copyAllButton');
            copyAllButton.addEventListener('click', () => {
              const fontFamily = document.getElementById('fontFamilyValue').innerText;
              const fontSize = document.getElementById('fontSizeValue').innerText;
              const color = document.getElementById('colorValue').innerText;
              
              const textToCopy = `Font Family: ${fontFamily}\nFont Size: ${fontSize}\nColor: ${color}`;
              
              navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyAllButton.innerText;
                copyAllButton.innerText = 'Copied!';
                copyAllButton.classList.add('success');
                setTimeout(() => {
                  copyAllButton.innerText = originalText;
                  copyAllButton.classList.remove('success');
                }, 1500);
              }).catch(err => {
                console.error('Failed to copy text: ', err);
              });
            });

          } else {
            resultsDiv.innerHTML = `<p id='initial-text'>No text element detected at the center of the page.</p>`;
          }
        }
      );
    });
  });
});

function getFontDetails() {
  const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  if (element) {
    const computedStyle = window.getComputedStyle(element);
    return {
      fontFamily: computedStyle.getPropertyValue('font-family'),
      fontSize: computedStyle.getPropertyValue('font-size'),
      color: computedStyle.getPropertyValue('color'),
    };
  }
  return null;
}