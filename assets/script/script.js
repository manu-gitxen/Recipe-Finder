const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const recipeContainer = document.getElementById('recipe-container')
const recipeModal = document.getElementById('recipe-modal');
const recipeDetailsContent = document.getElementById('recipe-details-content');
const recipeCloseBtn = document.querySelector('.close-btn');
const filterToggleBtn = document.getElementById('filter-toggle');
const appContainer = document.querySelector('.app-container');


// const cardColors = [
//     '#e6f2ffff', // Light Gray
//     '#defeedff', // Light Green
//     '#fff3c6ff', // Light Yellow
//     '#fceae6', // Light Pink
//     '#e8f8f5', // Light Teal
//     '#eebfffff'  // Light Purple
// ];


// const cardColors = [
//         { bg: '#f8f9fa', btn: '#6c757d' }, // Gray -> Dark Gray
//         { bg: '#e9f7ef', btn: '#2ecc71' }, // Green -> Dark Green
//         { bg: '#fef9e7', btn: '#f1c40f' }, // Yellow -> Dark Yellow
//         { bg: '#fceae6', btn: '#e74c3c' }, // Pink -> Red
//         { bg: '#e8f8f5', btn: '#1abc9c' }, // Teal -> Dark Teal
//         { bg: '#f4ecf7', btn: '#9b59b6' }  // Purple -> Dark Purple
//     ];


searchBtn.addEventListener('click', () => {
    if (searchInput.value != ''){
    const searchTerm = searchInput.value;
    fetchRecipes(searchTerm);
    console.log(searchTerm);
    
    }

});


searchInput.addEventListener('keypress', (e) => {
    
    if (e.key === "Enter") {
        const searchTerm = searchInput.value;
        fetchRecipes(searchTerm);
    }
});

filterToggleBtn.addEventListener('click',()=>{

    
    // Write the toggle line here:
    appContainer.classList.toggle('sidebar-hidden');

});


async function fetchRecipes(query) {
    recipeContainer.innerHTML = "";
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();



    console.log(data);

    data.meals.forEach(recipe => {
        
        addMealToDOM(recipe);
    });
}
async function openRecipeModal(id) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    const meal = data.meals[0];

    // 1. Create the HTML content
    recipeDetailsContent.innerHTML = `
        <h2 class="recipe-name">${meal.strMeal}</h2>
        <h3>Ingredients:</h3>
        <ul>
            <li>${meal.strIngredient1} - ${meal.strMeasure1}</li>
            <li>${meal.strIngredient2} - ${meal.strMeasure2}</li>
            <li>${meal.strIngredient3} - ${meal.strMeasure3}</li>
        </ul>
        <div class="instructions">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
    `;

    recipeModal.style.display = "block";
}
// ... existing code ...

recipeCloseBtn.addEventListener('click', () => {
    recipeModal.style.display = "none";
});

function addMealToDOM(recipe) {
    // 1. Define the pairs (Background + Matching Button)
    const themes = [
        { bg: '#f8f9fa', btn: '#849aabff' }, // Gray -> Dark Gray
        { bg: '#e9f7ef', btn: '#2ecc71' }, // Green -> Dark Green
        { bg: '#fef9e7', btn: '#f1c40f' }, // Yellow -> Dark Yellow
        { bg: '#ffd5cbff', btn: '#ff1900ff' }, // Pink -> Red
        { bg: '#e8f8f5', btn: '#1abc9c' }, // Teal -> Dark Teal
        { bg: '#f4ecf7', btn: '#9b59b6' }  // Purple -> Dark Purple
    ];

    // 2. Pick one random theme
    const theme = themes[Math.floor(Math.random() * themes.length)];


    const recipeCard = `
        <div class="card" style="background-color: ${theme.bg};">
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3 class="card-h3">${recipe.strMeal}</h3>
            <button class="view-btn" style="background-color: ${theme.btn};" data-id="${recipe.idMeal}">View Recipe</button>
        </div>
    `;

    recipeContainer.insertAdjacentHTML('beforeend', recipeCard);

    // 4. Add the event listener
    const btn = recipeContainer.querySelector(`[data-id="${recipe.idMeal}"]`);
    btn.addEventListener('click', (e) => {
        const mealId = e.target.dataset.id;
        openRecipeModal(mealId); 
    });
}
async function fetchFavMeals() {
    recipeContainer.innerHTML = ''; // Clear container

    for (let i = 0; i < 8; i++) {
        await fetchRandomMeal();
    }
}
async function fetchRandomMeal() {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const data = await response.json();
    const meal = data.meals[0];

    addMealToDOM(meal);
}
fetchFavMeals();
