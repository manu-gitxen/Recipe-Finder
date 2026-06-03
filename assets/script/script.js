const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const recipeContainer = document.getElementById("recipe-container");
const recipeModal = document.getElementById("recipe-modal");
const recipeDetailsContent = document.getElementById("recipe-details-content");
const recipeCloseBtn = document.querySelector(".close-btn");
const filterToggleBtn = document.getElementById("filter-toggle");
const appContainer = document.querySelector(".app-container");
const filterBtns = document.querySelectorAll(".filterbtn");
const recomText = document.getElementById("recomText");
const searchText = document.getElementById("searchText");

// Modal transition helper functions

function openModal() {
  recipeModal.classList.remove("hidden");

  // Force reflow to enable CSS transition

  recipeModal.offsetHeight;
  recipeModal.classList.add("bg-slate-900/60");
  const modalContent = recipeModal.querySelector(".modal-content");
  modalContent.classList.add("scale-100", "opacity-100");
  modalContent.classList.remove("scale-95", "opacity-0");
}

function closeModal() {
  const modalContent = recipeModal.querySelector(".modal-content");
  modalContent.classList.remove("scale-100", "opacity-100");
  modalContent.classList.add("scale-95", "opacity-0");
  recipeModal.classList.remove("bg-slate-900/60");
  setTimeout(() => {
    recipeModal.classList.add("hidden");
  }, 300);
}

// Close modal when clicking backdrop

recipeModal.addEventListener("click", (e) => {
  if (e.target === recipeModal) {
    closeModal();
  }
});

recipeCloseBtn.addEventListener("click", closeModal);

// Toggle active state for sidebar filters

function setActiveFilter(activeBtn) {
  filterBtns.forEach((btn) => {
    btn.classList.remove(
      "bg-amber-500",
      "text-white",
      "border-amber-600",
      "shadow-sm",
    );
    btn.classList.add("bg-slate-50/50", "text-slate-600", "border-slate-100");
    const icon = btn.querySelector(".fa-chevron-right");
    if (icon) {
      icon.classList.remove("text-amber-100");
      icon.classList.add("text-slate-300");
    }
  });

  if (activeBtn) {
    activeBtn.classList.remove(
      "bg-slate-50/50",
      "text-slate-600",
      "border-slate-100",
    );
    activeBtn.classList.add(
      "bg-amber-500",
      "text-white",
      "border-amber-600",
      "shadow-sm",
    );
    const icon = activeBtn.querySelector(".fa-chevron-right");
    if (icon) {
      icon.classList.remove("text-slate-300");
      icon.classList.add("text-amber-100");
    }
  }
}

// Skeleton loading cards
function showSkeletons() {
  recipeContainer.innerHTML = Array(8)
    .fill(0)
    .map(
      () => `
        <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-4 space-y-4 animate-pulse-slow shimmer-wrapper">
            <div class="aspect-[4/3] bg-slate-200 rounded-xl"></div>
            <div class="space-y-2">
                <div class="h-3 bg-slate-200 rounded-full w-1/4"></div>
                <div class="h-5 bg-slate-200 rounded-full w-3/4"></div>
                <div class="h-10 bg-slate-200 rounded-xl w-full pt-4"></div>
            </div>
        </div>
    `,
    )
    .join("");
}

// Event Listeners for Search
searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim() !== "") {
    const searchTerm = searchInput.value.trim();
    fetchRecipes(searchTerm);
    recomText.style.display = "none";
    searchText.innerHTML = `
            <h2 class="text-xl md:text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-amber-500 text-lg"></i>
                <span>Results for "${searchTerm}"</span>
            </h2>
        `;
    setActiveFilter(null);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    const searchTerm = searchInput.value.trim();
    fetchRecipes(searchTerm);
    recomText.style.display = "none";
    searchText.innerHTML = `
            <h2 class="text-xl md:text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-amber-500 text-lg"></i>
                <span>Results for "${searchTerm}"</span>
            </h2>
        `;
    setActiveFilter(null);
  }
});

filterToggleBtn.addEventListener("click", () => {
  appContainer.classList.toggle("sidebar-hidden");
});

// Fetch functions

async function fetchRecipes(query) {
  showSkeletons();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    );
    const data = await response.json();
    recipeContainer.innerHTML = "";

    if (data.meals) {
      data.meals.forEach((recipe) => {
        addMealToDOM(recipe);
      });
    } else {
      recipeContainer.innerHTML = `
                <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                        <i class="fa-solid fa-utensils"></i>
                    </div>
                    <h3 class="text-lg font-serif font-bold text-slate-800 mb-1">No Recipes Found</h3>
                    <p class="text-sm text-slate-500 max-w-xs">We couldn't find any recipes matching "${query}". Try searching for something else!</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipeContainer.innerHTML = `
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                    <i class="fa-solid fa-circle-exclamation"></i>
                </div>
                <h3 class="text-lg font-serif font-bold text-slate-800 mb-1">Something went wrong</h3>
                <p class="text-sm text-slate-500">Failed to connect to the recipe server. Please check your network connection.</p>
            </div>
        `;
  }
}

async function openRecipeModal(id) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
    );
    const data = await response.json();
    const meal = data.meals[0];

    let ingredientsList = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== "") {
        ingredientsList += `
                    <li class="flex items-start gap-2.5 text-slate-600 text-sm py-1 group select-none">
                        <span class="w-5 h-5 rounded-md border border-amber-200 bg-amber-50/50 flex items-center justify-center text-amber-600 shrink-0 text-[10px] group-hover:bg-amber-100 transition-colors duration-200">
                            <i class="fa-solid fa-check"></i>
                        </span>
                        <span><strong class="text-slate-800 font-semibold">${measure ? measure.trim() + " " : ""}</strong>${ingredient.trim()}</span>
                    </li>
                `;
      }
    }

    // Render split panel layout modal details

    recipeDetailsContent.innerHTML = `
            <!-- Left Side - Media & Cover Info -->
            <div class="md:w-2/5 relative bg-slate-900 min-h-[300px] md:min-h-0 flex flex-col">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="absolute inset-0 w-full h-full object-cover opacity-75">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div class="relative mt-auto p-6 md:p-8 text-white z-10">
                    <span class="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">${meal.strCategory || "Recipe"}</span>
                    <h2 class="text-2xl md:text-3xl font-serif font-bold leading-tight mb-2">${meal.strMeal}</h2>
                    <p class="text-slate-300 text-xs flex items-center gap-1.5 mb-6">
                        <i class="fa-solid fa-globe text-amber-400"></i> ${meal.strArea || "International"} Cuisine
                    </p>
                    ${
                      meal.strYoutube
                        ? `
                        <a href="${meal.strYoutube}" target="_blank" class="inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer">
                            <i class="fa-brands fa-youtube text-base"></i>
                            <span>Watch YouTube Tutorial</span>
                        </a>
                    `
                        : ""
                    }
                </div>
            </div>
            
            <!-- Right Side - Ingredients & Directions -->
            <div class="md:w-3/5 p-6 md:p-8 overflow-y-auto flex flex-col h-full max-h-[50vh] md:max-h-[85vh]">
                <div class="mb-6">
                    <h3 class="text-base font-serif font-bold text-slate-800 mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <i class="fa-solid fa-carrot text-amber-500"></i>
                        <span>Ingredients Checklist</span>
                    </h3>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        ${ingredientsList}
                    </ul>
                </div>
                
                <div class="border-t border-slate-100 pt-6">
                    <h3 class="text-base font-serif font-bold text-slate-800 mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <i class="fa-solid fa-list-check text-amber-500"></i>
                        <span>Preparation Instructions</span>
                    </h3>
                    <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                        ${meal.strInstructions.split("\r\n\r\n").join("\n\n")}
                    </div>
                </div>
            </div>
        `;

    openModal();
  } catch (error) {
    console.error("Error retrieving recipe details:", error);
  }
}

function addMealToDOM(recipe) {
  const recipeCard = `
        <div class="card group bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative" data-id="${recipe.idMeal}">
            <div class="relative overflow-hidden aspect-[4/3] bg-slate-100">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span class="text-white text-xs font-semibold flex items-center gap-1">
                        <i class="fa-solid fa-utensils text-amber-400"></i> Open Recipe
                    </span>
                </div>
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <span class="inline-block text-[10px] font-bold tracking-wider text-amber-600 uppercase mb-1.5">${recipe.strCategory || "Recipe"}</span>
                <h3 class="font-serif text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors duration-200 mb-4">${recipe.strMeal}</h3>
                
                <button class="view-btn mt-auto w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer" data-id="${recipe.idMeal}">
                    <span>View Recipe</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>
    `;

  recipeContainer.insertAdjacentHTML("beforeend", recipeCard);

  // Bind click handlers to both the whole card and the view button

  const cardEl = recipeContainer.querySelector(`[data-id="${recipe.idMeal}"]`);
  cardEl.addEventListener("click", (e) => {
    openRecipeModal(recipe.idMeal);
  });

  const btn = cardEl.querySelector(".view-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openRecipeModal(recipe.idMeal);
  });
}

async function fetchFavMeals() {
  showSkeletons();
  recipeContainer.innerHTML = "";

  try {
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(
        fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(
          (res) => res.json(),
        ),
      );
    }
    const results = await Promise.all(promises);

    recipeContainer.innerHTML = "";
    results.forEach((data) => {
      if (data.meals && data.meals[0]) {
        addMealToDOM(data.meals[0]);
      }
    });
  } catch (error) {
    console.error("Error fetching recommended meals:", error);
  }
}

async function filterByCategory(category) {
  showSkeletons();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
    );
    const data = await response.json();
    recipeContainer.innerHTML = "";

    if (data.meals) {
      data.meals.forEach((meal) => {
        meal.strCategory = category;
        addMealToDOM(meal);
      });
    }
  } catch (error) {
    console.error("Error filtering by category:", error);
  }
}

// Bind Category buttons click handlers

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.querySelector("span").innerText.trim();
    setActiveFilter(btn);

    recomText.style.display = "none";
    searchText.innerHTML = `
            <h2 class="text-xl md:text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-filter text-amber-500 text-lg"></i>
                <span>Category: ${category}</span>
            </h2>
        `;

    filterByCategory(category);
  });
});

fetchFavMeals();
