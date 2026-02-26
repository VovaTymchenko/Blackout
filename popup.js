const listElem = document.getElementById("siteList");
const toggleBtn = document.getElementById("toggleCurrent");

async function getCurrentHostname()
{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return new URL(tab.url).hostname;
}

async function loadSites()
{
    const { enabledSites = [] } = await chrome.storage.sync.get("enabledSites");

    listElem.innerHTML = "";

    for (const site of enabledSites)
    {
        const li = document.createElement("li");
        li.textContent = site;

        const remove = document.createElement("span");
        remove.textContent = "-";
        remove.className = "remove";

        remove.onclick = async () =>
        {
            const newList = enabledSites.filter(s => s !== site);
            await chrome.storage.sync.set({ enabledSites: newList });

            const tabs = await chrome.tabs.query({ currentWindow: true });
            for (const tab of tabs)
            {
                if (new URL(tab.url).hostname === site)
                {
                    chrome.tabs.sendMessage(tab.id, { toggle: true });
                }
            }

            loadSites();
        };

        li.appendChild(remove);
        listElem.appendChild(li);
    }
}

toggleBtn.onclick = async () =>
{
    const hostname = await getCurrentHostname();
    const { enabledSites = [] } = await chrome.storage.sync.get("enabledSites");
    const newList = enabledSites.includes(hostname)
        ? enabledSites.filter(s => s !== hostname)
        : [...enabledSites, hostname];

    await chrome.storage.sync.set({ enabledSites: newList });

    // tell content script in the tab to toggle dark mode
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { toggle: true });

    loadSites(); // refresh popup list
};

loadSites(); // load list on popup open
