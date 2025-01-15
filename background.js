// escuchar la instalación de la extensión
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blackList: [] }, () => {
    console.log("Blacklist initialized.");
  });
});

// escuchar cambios en la lista negra
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blackList) {
    updateBlockRules(changes.blackList.newValue);
  }
});

// funcion para actualizar las reglas de bloqueo
function updateBlockRules(blackList) {
  const rules = blackList.map((item, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        url: chrome.runtime.getURL("blocked.html"),
      },
    },
    condition: {
      urlFilter: item.url,
      resourceTypes: ["main_frame"],
    },
  }));

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: rules.map((rule) => rule.id),
      addRules: rules,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error updating rules:", chrome.runtime.lastError);
      } else {
        console.log("Rules updated successfully");
      }
    }
  );
}

// inicializar reglas
chrome.storage.sync.get("blackList", (data) => {
  updateBlockRules(data.blackList || []);
});
