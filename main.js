// VARIABLES
let pageNumber = 0;
let pageLimit = pageNumber === 0 ? 47 : 50;
const url = "http://api.valantis.store:40000";
const generateAuthString = (password) => {
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = (currentDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getUTCDate().toString().padStart(2, "0");
  const timestamp = `${year}${month}${day}`;
  const authString = `${password}_${timestamp}`;
  return CryptoJS.MD5(authString).toString();
};
const headers = {
  "X-Auth": generateAuthString("Valantis"),
  "Content-Type": "application/json",
};
const prevButton = document.querySelector(".prev-page-link");
const nextButton = document.querySelector(".next-page-link");
const applyFiltersButton = document.querySelector(".filter__button");
const resetFilterButton = document.querySelector(".reset__button");
const itemsContainer = document.querySelector(".items");
const spinner = document.querySelector('.spinner');
const message = document.querySelector('.message');

// SERVICES
const getItems = (itemIds) =>
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      action: "get_items",
      params: { ids: itemIds },
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => data.result)
    .catch((error) => {
      console.error("Ошибка:", error.message);
    });

const getFields = (itemsField) =>
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      action: "get_fields",
      params: { field: itemsField },
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => data.result)
    .catch((error) => {
      console.error("Ошибка:", error.message);
    });

const getItemsIds = () =>
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      action: "get_ids",
      params: { offset: pageNumber, limit: pageLimit },
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => data.result)
    .catch((error) => {
      console.error("Ошибка:", error.message);
    });

const filterItems = (filters) =>
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      action: "filter",
      params: filters,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => data.result)
    .catch((error) => {
      console.error("Ошибка:", error.message);
    });

// CARDS
const handleItemsProcess = (itemIds) => {
  getItems(itemIds).then((items) => {
    spinner.classList.add('hidden');
    
    if (!items) return message.innerHTML = `Fetch error, please <button onclick='window.location.reload()' class="btn btn-primary filter__button">reload page</button>`;
    
    if (items?.length > 0) {
      items.forEach((card) => createCard(card));
    } else message.innerText = 'No items found';
  })
};

const createPageInfo = () => getItemsIds().then((itemIds) => handleItemsProcess(itemIds));

const createCard = (itemData) => {
  const { brand, id, price, product } = itemData;
  const card = document.createElement("div");

  card.classList.add("card");

  card.innerHTML = `
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title">${product}</h3>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><span class="span__brand">Price: </span>${price}</li>
              ${brand ? `<li class="list-group-item"><span class="span__brand">Brand: </span>${brand}</li>` : ""}
            </ul>
          </div>
          <div class="card-footer">
            <p class="card-text"><span class="span__brand">ID: </span>${id}</p>
          </div>
        </div>
      `;

  itemsContainer.append(card);
};

// PAGINATION
const checkButton = () => {
  spinner.classList.remove('hidden');

  if (pageNumber === 0) prevButton.classList.add("disabled");
  else prevButton.classList.remove("disabled");
};

const pressNextButton = () => {
  pageNumber = pageNumber + 50;
  checkButton();
  const itemsContainer = document.querySelector(".items");
  itemsContainer.innerHTML = "";
  createPageInfo();
  console.log(pageNumber);
};

nextButton.addEventListener("click", pressNextButton);

const pressPrevButton = () => {
  pageNumber = pageNumber - 50;
  checkButton();
  const itemsContainer = document.querySelector(".items");
  itemsContainer.innerHTML = "";
  createPageInfo();
  console.log(pageNumber);
};

prevButton.addEventListener("click", pressPrevButton);

// FILTER
const handleFilter = () => {
  
  const inputs = document.querySelectorAll(".form-control");
  const filters = {};

  const itemsContainer = document.querySelector(".items");
  itemsContainer.innerHTML = "";
  message.innerHTML = '';
  spinner.classList.remove('hidden');

  inputs.forEach((input) => {
    const filterKey = input.dataset.filter;
    const filterValue = input.value;
    if (filterValue)
      filters[filterKey] =
        filterKey === "price" ? Number(filterValue) : filterValue;
  });

  filterItems(filters).then((itemIds) => handleItemsProcess(itemIds));
};

const checkFiltersApplied = () => {
  const inputs = document.querySelectorAll(".form-control");
  let filtersApplied = false;

  inputs.forEach((input) => {
    if (input.value.trim() !== "") {
      filtersApplied = true;
    }
  });

  return filtersApplied;
};

const resetFilter = () => {
  const filtersApplied = checkFiltersApplied();
  if (!filtersApplied) {
    return;
  }
  const itemsContainer = document.querySelector(".items");
  itemsContainer.innerHTML = "";
  document.querySelectorAll(".form-control").forEach((input) => {
    input.value = "";
  });

  getItemsIds().then((itemIds) =>
    getItems(itemIds).then((items) => items.forEach((card) => createCard(card)))
  );
};

applyFiltersButton.addEventListener("click", handleFilter);
resetFilterButton.addEventListener("click", resetFilter);

// FINAL
createPageInfo();
