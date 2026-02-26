const listElem = document.getElementById("siteList");
const toggleBtn = document.getElementById("toggleCurrent");

async function getCurrentHostname()
{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return new URL(tab.url).hostname;
}

// tell content script in the tab to toggle dark mode
async function toggleMsg()
{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { toggle: true });
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
        remove.textContent = "x";
        remove.className = "remove";

        remove.onclick = async () =>
        {
            const newList = enabledSites.filter(s => s !== site);
            await chrome.storage.sync.set({ enabledSites: newList });

            const currHostname = await getCurrentHostname();
            if (site === currHostname) await toggleMsg();

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

    toggleMsg();

    loadSites(); // refresh popup list
};

loadSites(); // load list on popup open
