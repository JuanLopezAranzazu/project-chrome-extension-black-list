// variables

let blackList = [];
const maxLength = 25;

// elements

const $nameInput = document.getElementById("name-input");
const $urlInput = document.getElementById("url-input");
const $blackListForm = document.querySelector(".black-list-form");
const $blackListContainer = document.querySelector(".black-list-container");

// logic

// funcion para agregar un nuevo elemento a la lista negra
function addToBlackList(name, url) {
  if (!isValidUrl(url)) {
    alert("Invalid URL");
    return;
  }
  const id = Date.now();
  const newEntry = { id, name, url };
  blackList.push(newEntry);
  // actualizar el chrome storage
  chrome.storage.sync.set({ blackList }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error adding to black list");
    } else {
      renderBlackList();
    }
  });
}

// funcion para editar un elemento de la lista negra
function editBlackList(id, name, url) {
  if (!isValidUrl(url)) {
    alert("Invalid URL");
    return;
  }
  const index = blackList.findIndex((entry) => entry.id === id);
  blackList[index] = { id, name, url };
  // actualizar el chrome storage
  chrome.storage.sync.set({ blackList }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error editing black list");
    } else {
      renderBlackList();
    }
  });
}

// funcion para eliminar un elemento de la lista negra
function removeFromBlackList(id) {
  if (!confirm("Are you sure?")) {
    return;
  }
  blackList = blackList.filter((entry) => entry.id !== id);
  // actualizar el chrome storage
  chrome.storage.sync.set({ blackList }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error removing from black list");
    } else {
      renderBlackList();
    }
  });
}

// funcion para cargar la lista negra
function loadBlackList() {
  chrome.storage.sync.get("blackList", (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading black list");
    } else {
      blackList = data.blackList || [];
      renderBlackList();
    }
  });
}

// funcion para crear un item de la lista negra
function getListItem(item) {
  const listItem = document.createElement("div");
  listItem.className = "list-item";

  const infoElement = document.createElement("div");
  infoElement.className = "list-item-info";
  const nameText = document.createElement("span");
  nameText.textContent = truncateName(item.name);
  infoElement.appendChild(nameText);
  const urlText = document.createElement("span");
  urlText.textContent = truncateName(item.url);
  infoElement.appendChild(urlText);

  listItem.appendChild(infoElement);

  const actionsElement = document.createElement("div");
  actionsElement.className = "list-item-actions";
  const removeButton = document.createElement("button");
  removeButton.className = "danger";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => removeFromBlackList(item.id);

  actionsElement.appendChild(removeButton);
  listItem.appendChild(actionsElement);

  return listItem;
}

// funcion para renderizar la lista negra
function renderBlackList() {
  $blackListContainer.innerHTML = "";

  blackList.forEach((item) => {
    const listItem = getListItem(item);
    $blackListContainer.appendChild(listItem);
  });
}

// utils

// funcion para validar una url con una expresion regular
function isValidUrl(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$"
  );
  return urlPattern.test(url);
}

// funcion para truncar un nombre si es muy largo
function truncateName(name) {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
}

// events

$blackListForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = $nameInput.value.trim();
  const url = $urlInput.value.trim();
  if (name && url) {
    addToBlackList(name, url);
    $nameInput.value = "";
    $urlInput.value = "";
  }
});

// init

loadBlackList();
