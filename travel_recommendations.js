// Function to fetch travel recommendations data
async function fetchTravelData() {
    try {
        console.log('Attempting to fetch travel_recommendations.json...');
        const response = await fetch('travel_recommendations.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Travel data fetched successfully:', data);
        return data;
    } catch (error) {
        console.error('Error fetching travel data:', error);
        console.error('Detailed error:', error.message, error.stack);
        alert('Error loading travel data. Please check if travel_recommendations.json exists.');
        return null;
    }
}

// Function to normalize and check keyword variations
function matchesKeyword(searchTerm, keywords) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return keywords.some(keyword => 
        normalizedSearch.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(normalizedSearch)
    );
}

// Function to display search results as stacked cards
function displayResults(results, category) {
    console.log('Displaying results:', results, category);
    
    let resultContainer = document.getElementById('search-results-container');
    if (!resultContainer) {
        resultContainer = createResultContainer();
    }
    
    // Show the container
    resultContainer.style.display = 'block';
    
    if (!results || results.length === 0) {
        resultContainer.innerHTML = `
            <div class="results-header">
                <h3>No Results Found</h3>
                <button class="close-results" onclick="clearResults()">×</button>
            </div>
            <div class="no-results-message">
                <p>No destinations found for your search.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="results-header">
            <h3>${category} (${results.length})</h3>
            <button class="close-results" onclick="clearResults()">×</button>
        </div>
        <div class="results-content">
    `;

    results.forEach((item, index) => {
        html += `
            <div class="result-card" style="animation-delay: ${index * 0.1}s">
                <div class="card-image">
                    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='NYC.jpeg'">
                </div>
                <div class="card-content">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <button class="visit-btn">Visit</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultContainer.innerHTML = html;
}

// Function to create result container
function createResultContainer() {
    const container = document.createElement('div');
    container.id = 'search-results-container';
    container.className = 'search-results';
    
    // Insert after hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
    } else {
        document.body.appendChild(container);
    }
    
    console.log('Result container created');
    return container;
}

// Function to close results
function clearResults() {
    const resultContainer = document.getElementById('search-results-container');
    if (resultContainer) {
        resultContainer.style.display = 'none';
    }
    console.log('Results cleared');
}

// Function to search for recommendations with improved keyword matching
async function searchRecommendations(searchTerm) {
    console.log('Search function called with term:', searchTerm);
    console.log('Starting search process...');
    
    const data = await fetchTravelData();
    console.log('Data received for search:', data ? 'Data available' : 'No data');
    
    if (!data) {
        console.log('No data available for search');
        alert('Unable to load travel data. Please refresh the page.');
        return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    let results = [];
    let category = '';
    
    // Define keyword variations for each category
    const beachKeywords = ['beach', 'beaches', 'bora bora', 'copacabana', 'polynesia', 'island', 'coast', 'shore'];
    const templeKeywords = ['temple', 'temples', 'angkor', 'taj mahal', 'cambodia', 'india', 'monument', 'religious', 'heritage'];
    const countryKeywords = ['country', 'countries', 'city', 'cities', 'australia', 'japan', 'brazil', 'sydney', 'melbourne', 'tokyo', 'kyoto', 'rio', 'são paulo', 'sao paulo'];
    
    console.log('Searching with keywords for:', searchLower);
    
    // Search in beaches
    if (matchesKeyword(searchLower, beachKeywords)) {
        console.log('Matched beach keywords');
        results = data.beaches || [];
        category = 'Beaches';
    }
    
    // Search in temples
    else if (matchesKeyword(searchLower, templeKeywords)) {
        console.log('Matched temple keywords');
        results = data.temples || [];
        category = 'Temples';
    }
    
    // Search in countries/cities
    else if (matchesKeyword(searchLower, countryKeywords)) {
        console.log('Matched country keywords');
        if (data.countries) {
            data.countries.forEach(country => {
                if (country.cities) {
                    country.cities.forEach(city => {
                        results.push(city);
                    });
                }
            });
        }
        category = 'Cities';
    }
    
    // If no specific category matches, search all categories
    else {
        console.log('No specific category matched, searching all');
        // Search cities
        if (data.countries) {
            data.countries.forEach(country => {
                if (country.cities) {
                    country.cities.forEach(city => {
                        results.push(city);
                    });
                }
            });
        }
        
        // Add temples
        if (data.temples) {
            results = results.concat(data.temples);
        }
        
        // Add beaches
        if (data.beaches) {
            results = results.concat(data.beaches);
        }
        
        category = 'All Destinations';
    }
    
    console.log(`Search results for "${searchTerm}":`, results);
    displayResults(results, category);
}

// Event listeners for search functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners');
    
    // Test fetch on page load
    fetchTravelData();
    
    // Get search elements - try multiple selectors
    const searchForm = document.querySelector('.nav-search') || document.querySelector('form');
    const searchInput = document.querySelector('.nav-search input') || document.querySelector('input[type="text"]');
    const searchBtn = document.querySelector('.search-btn') || document.querySelector('button[type="submit"]');
    const clearBtn = document.querySelector('.clear-btn') || document.querySelector('button[type="reset"]');
    
    console.log('Found elements:', { searchForm, searchInput, searchBtn, clearBtn });
    
    // Handle form submission (when user presses Enter or clicks Search)
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            console.log(`Form submitted with search term: "${searchTerm}"`);
            if (searchTerm) {
                searchRecommendations(searchTerm);
            } else {
                alert('Please enter a search term');
            }
        });
    }
    
    // Handle search button click specifically
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            console.log(`Search button clicked with term: "${searchTerm}"`);
            if (searchTerm) {
                searchRecommendations(searchTerm);
            } else {
                alert('Please enter a search term');
            }
        });
    }
    
    // Handle reset/clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (searchInput) searchInput.value = '';
            clearResults();
            console.log('Search cleared');
        });
    }
});

// Add CSS styles for the new card layout
const style = document.createElement('style');
style.textContent = `
    .search-results {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 400px;
        max-height: calc(100vh - 100px);
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(15px);
        border-radius: 12px;
        border: 2px solid #17a2b8;
        z-index: 999;
        display: none;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .results-header {
        background: linear-gradient(135deg, #17a2b8, #138496);
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 1000;
        border-radius: 10px 10px 0 0;
    }
    
    .results-header h3 {
        color: white;
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    .close-results {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .close-results:hover {
        background-color: rgba(255,255,255,0.2);
        transform: rotate(90deg);
    }
    
    .results-content {
        padding: 1rem;
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .result-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        backdrop-filter: blur(10px);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
        animation: fadeInUp 0.5s ease-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .result-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4);
        border-color: #17a2b8;
    }
    
    .card-image {
        position: relative;
        height: 180px;
        overflow: hidden;
    }
    
    .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .result-card:hover .card-image img {
        transform: scale(1.1);
    }
    
    .card-content {
        padding: 1.2rem;
    }
    
    .card-content h4 {
        color: #17a2b8;
        margin: 0 0 0.8rem 0;
        font-size: 1.3rem;
        font-weight: 700;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    
    .card-content p {
        color: rgba(255,255,255,0.95);
        line-height: 1.6;
        margin: 0 0 1.2rem 0;
        font-size: 0.95rem;
        text-align: justify;
    }
    
    .visit-btn {
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }
    
    .visit-btn:hover {
        background: linear-gradient(135deg, #138496, #117a8b);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(23, 162, 184, 0.5);
    }
    
    .visit-btn:active {
        transform: translateY(0);
    }
    
    .no-results-message {
        padding: 2rem;
        text-align: center;
    }
    
    .no-results-message p {
        color: rgba(255,255,255,0.8);
        font-size: 1.1rem;
        margin: 0;
    }
    
    /* Custom scrollbar */
    .results-content::-webkit-scrollbar {
        width: 6px;
    }
    
    .results-content::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
    }
    
    .results-content::-webkit-scrollbar-thumb {
        background: #17a2b8;
        border-radius: 3px;
    }
    
    .results-content::-webkit-scrollbar-thumb:hover {
        background: #138496;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .search-results {
            width: 350px;
            right: 10px;
        }
    }
    
    @media (max-width: 480px) {
        .search-results {
            width: calc(100% - 20px);
            right: 10px;
            left: 10px;
        }
    }
`;
document.head.appendChild(style);
