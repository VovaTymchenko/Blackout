let darkModeApplied = false;

// listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
{
    if (message.enabled !== undefined)
    {
        if (message.enabled && !darkModeApplied)
        {
            applyDark();
            darkModeApplied = true;
        }
        else if (!message.enabled && darkModeApplied)
        {
            removeDark();
            darkModeApplied = false;
        }
    }
});

function applyDark()
{
    if (document.getElementById("force-dark-theme")) return;

    const style = document.createElement("style");
    style.id = "force-dark-theme";
    style.textContent =
    `
        html
        {
            background: #202124 !important;
            filter: invert(1) hue-rotate(180deg) contrast(0.9) brightness(0.95);
            transition: filter 1s ease, background 1s ease;
        }

        img, video, iframe, canvas, svg, picture img
        {
            filter: invert(1) hue-rotate(180deg) !important;
            transition: filter 1s ease;
        }
    `;
    document.head.appendChild(style);
}

function removeDark()
{
    const elem = document.getElementById("force-dark-theme");
    if (elem) elem.remove();
}

// auto-apply on page load
(async () =>
{
    const { enabledSites = [] } = await chrome.storage.sync.get("enabledSites");
    if (enabledSites.includes(window.location.hostname)) {
        applyDark();
        darkModeApplied = true;
    }
})();