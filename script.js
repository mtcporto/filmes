// script.js
const apiCache = new Map();
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' fill='%23718096'%3ENo Poster Available%3C/text%3E%3C/svg%3E";

// TMDB API Configuration
const TMDB_API_KEY = "6655c36ae61cd1554fff7fe2b431ccf7";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Elementos DOM
const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Estado da aplicação
let currentContentType = 'all';

document.addEventListener('DOMContentLoaded', function() {
    // Inicialize a página carregando conteúdo em destaque
    loadFeaturedBackdrop();
    
    // Carregue filmes e séries populares
    fetchTrending();
    
    // Configure a funcionalidade de busca
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Configure botões de tipo de conteúdo
    const typeRadios = document.querySelectorAll('input[name="contentType"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentContentType = this.value;
            if (searchInput && searchInput.value.trim() !== '') {
                performSearch();
            } else {
                fetchTrending(currentContentType);
            }
        });
    });
    
    // Configure o dark mode
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        initDarkModeToggle();
    }
});

function getSelectedContentType() {
    const selectedRadio = document.querySelector('input[name="contentType"]:checked');
    return selectedRadio ? selectedRadio.value : 'all';
}

function performSearch() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        return;
    }
    
    const contentType = getSelectedContentType();
    
    // Mostrar estado de carregamento
    if (moviesContainer) {
        moviesContainer.innerHTML = '<div class="flex justify-center items-center h-64 w-full"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>';
    }
    
    // Diferentes endpoints dependendo do tipo de conteúdo
    let searchUrl;
    
    if (contentType === 'all') {
        searchUrl = `${TMDB_API_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=pt-BR`;
    } else {
        searchUrl = `${TMDB_API_BASE_URL}/search/${contentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=pt-BR`;
    }
    
    axios.get(searchUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                renderSearchResults(response.data.results, contentType);
            } else {
                moviesContainer.innerHTML = '<div class="text-center p-8">Nenhum resultado encontrado. Tente outra busca.</div>';
            }
        })
        .catch(error => {
            moviesContainer.innerHTML = '<div class="text-center p-8 text-red-500">Erro ao buscar dados. Por favor tente novamente.</div>';
            console.log(error);
        });
}

function fetchTrending(contentType = 'all') {
    // Mostrar estado de carregamento
    if (moviesContainer) {
        moviesContainer.innerHTML = '<div class="flex justify-center items-center h-64 w-full"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>';
    }
    
    let endpoint;
    
    if (contentType === 'all') {
        endpoint = 'trending/all/week';
    } else if (contentType === 'person') {
        endpoint = 'person/popular';
    } else {
        endpoint = `${contentType}/popular`;
    }
    
    const apiUrl = `${TMDB_API_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                renderSearchResults(response.data.results, contentType);
            } else {
                moviesContainer.innerHTML = '<div class="text-center p-8">Nenhum resultado encontrado.</div>';
            }
        })
        .catch(error => {
            moviesContainer.innerHTML = '<div class="text-center p-8 text-red-500">Erro ao carregar dados. Por favor tente novamente.</div>';
            console.log(error);
        });
}

function renderSearchResults(results, contentType) {
    moviesContainer.innerHTML = "";
    
    results.forEach(item => {
        // Skip person results if we're not specifically searching for people
        if (item.media_type === 'person' && contentType !== 'person') {
            return;
        }
        
        // For multi search, we need to determine the media type
        const itemType = item.media_type || contentType;
        
        if (itemType === 'person') {
            createPersonCard(item);
        } else {
            createMovieOrShowCard(item, itemType);
        }
    });
    
    setupLazyLoading();
}

function createMovieOrShowCard(item, itemType) {
    const card = document.createElement("div");
    card.classList.add("card");
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("card-image-container");
    
    // Image with lazy loading
    const image = document.createElement("img");
    const title = itemType === 'movie' ? (item.title || item.original_title) : (item.name || item.original_name);
    image.alt = title;
    image.classList.add("lazy");
    
    if (item.poster_path) {
        image.dataset.src = `${TMDB_IMAGE_BASE_URL}${item.poster_path}`;
    } else {
        image.dataset.src = PLACEHOLDER_IMAGE;
    }
    
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3C/svg%3E";
    
    // Error handling
    image.onerror = function() {
        this.src = PLACEHOLDER_IMAGE;
        this.onerror = null;
    };
    
    // Rating badge if available
    if (item.vote_average) {
        const rating = document.createElement("div");
        rating.classList.add("card-rating");
        rating.innerHTML = `<i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}`;
        imageContainer.appendChild(rating);
    }
    
    imageContainer.appendChild(image);
    
    // Card content below the image
    const content = document.createElement("div");
    content.classList.add("card-content");
    
    const titleElem = document.createElement("h3");
    titleElem.classList.add("card-title");
    titleElem.textContent = title;
    titleElem.title = title; // Add tooltip on hover
    
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("card-details");
    
    const yearText = document.createElement("span");
    // Date format is different for movies vs TV
    const releaseDate = itemType === 'movie' ? item.release_date : item.first_air_date;
    yearText.textContent = releaseDate ? releaseDate.substring(0, 4) : 'N/A';
    
    const typeText = document.createElement("span");
    typeText.textContent = itemType === "movie" ? "Filme" : "Série";
    
    detailsContainer.appendChild(yearText);
    detailsContainer.appendChild(typeText);
    
    content.appendChild(titleElem);
    content.appendChild(detailsContainer);
    
    // Assemble the card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Make the entire card clickable
    card.addEventListener("click", () => {
        window.location.href = `detalhes.html?id=${item.id}&type=${itemType}`;
    });
    
    // Add card to container
    moviesContainer.appendChild(card);
}

function createPersonCard(person) {
    const card = document.createElement("div");
    card.classList.add("card");
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("card-image-container");
    
    // Image with lazy loading
    const image = document.createElement("img");
    image.alt = person.name;
    image.classList.add("lazy");
    
    if (person.profile_path) {
        image.dataset.src = `${TMDB_IMAGE_BASE_URL}${person.profile_path}`;
    } else {
        image.dataset.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='150' r='70' fill='%23a0aec0'/%3E%3Ccircle cx='150' cy='280' r='120' fill='%23a0aec0'/%3E%3C/svg%3E";
    }
    
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3C/svg%3E";
    
    // Error handling
    image.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='150' r='70' fill='%23a0aec0'/%3E%3Ccircle cx='150' cy='280' r='120' fill='%23a0aec0'/%3E%3C/svg%3E";
        this.onerror = null;
    };
    
    imageContainer.appendChild(image);
    
    // Card content below the image
    const content = document.createElement("div");
    content.classList.add("card-content");
    
    const titleElem = document.createElement("h3");
    titleElem.classList.add("card-title");
    titleElem.textContent = person.name;
    titleElem.title = person.name; // Add tooltip on hover
    
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("card-details");
    
    const knownFor = document.createElement("span");
    knownFor.textContent = person.known_for_department || "Atuação";
    
    const personType = document.createElement("span");
    personType.textContent = "Pessoa";
    
    detailsContainer.appendChild(knownFor);
    detailsContainer.appendChild(personType);
    
    content.appendChild(titleElem);
    content.appendChild(detailsContainer);
    
    // Assemble the card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Add click handler to navigate to details page
    card.addEventListener("click", () => {
        window.location.href = `pessoa.html?id=${person.id}`;
    });
    
    // Add card to container
    moviesContainer.appendChild(card);
}

function loadFeaturedBackdrop() {
    // Obter um filme popular aleatório para o backdrop
    const apiUrl = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                // Obter um filme aleatório do top 10
                const randomIndex = Math.floor(Math.random() * Math.min(10, response.data.results.length));
                const movie = response.data.results[randomIndex];
                
                // Atualizar o backdrop
                const backdropElem = document.getElementById('featuredBackdrop');
                if (backdropElem && movie.backdrop_path) {
                    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
                    backdropElem.style.backgroundImage = `url('${backdropUrl}')`;
                }
                
                // Não precisamos mais atualizar título e sinopse já que foram removidos
            }
        })
        .catch(error => {
            console.log('Error loading featured backdrop:', error);
        });
}

function initDarkModeToggle() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        // Inicializar o estado com base no localStorage ou padrão (claro)
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode === "true") {
            document.body.classList.add("dark");
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove("dark");
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Adicionar evento de clique
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            if (document.body.classList.contains("dark")) {
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem("darkMode", "true");
            } else {
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem("darkMode", "false");
            }
        });
    }
}

// Chamada ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Remover classe dark por padrão
    if (localStorage.getItem("darkMode") !== "true") {
        document.body.classList.remove("dark");
    }
    
    // Resto do código...
});

function fetchMovies() {
    // Show loading state
    moviesContainer.innerHTML = '<div class="flex justify-center items-center h-64 w-full"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>';
    
    const cacheKey = `${type}-${year}`;
    if (apiCache.has(cacheKey)) {
        renderMovies(apiCache.get(cacheKey));
        return;
    }
    
    // TMDB uses different parameters for year filtering based on content type
    let yearParam = '';
    if (type === 'movie') {
        yearParam = `&primary_release_year=${year}`;
    } else {
        yearParam = `&first_air_date_year=${year}`;
    }
    
    const apiUrl = `${TMDB_API_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}${yearParam}&sort_by=popularity.desc&language=pt-BR`;

    axios.get(apiUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                apiCache.set(cacheKey, response.data.results);
                renderMovies(response.data.results);
            } else {
                moviesContainer.innerHTML = '<div class="text-center p-8">Nenhum resultado encontrado para este ano. Tente outro ano.</div>';
            }
        })
        .catch(error => {
            moviesContainer.innerHTML = '<div class="text-center p-8 text-red-500">Erro ao carregar dados. Por favor tente novamente.</div>';
            console.log(error);
        });
}

function renderMovies(movies) {
    moviesContainer.innerHTML = "";
    
    // Use Promise.all to fetch all movie details in parallel
    const moviePromises = movies.map(movie => {
        const cacheKey = `details-${type}-${movie.id}`;
        if (apiCache.has(cacheKey)) {
            return Promise.resolve({movie, details: apiCache.get(cacheKey)});
        }
        
        const apiUrl = `${TMDB_API_BASE_URL}/${type}/${movie.id}?api_key=${TMDB_API_KEY}&language=pt-BR`;
        return axios.get(apiUrl)
            .then(response => {
                apiCache.set(cacheKey, response.data);
                return {movie, details: response.data};
            });
    });
    
    Promise.all(moviePromises)
        .then(moviesWithDetails => {
            moviesWithDetails.forEach(({movie, details}) => {
                createMovieCard(movie, details);
            });
            
            setupLazyLoading();
        });
}

function createMovieCard(movie, details) {
    const card = document.createElement("div");
    card.classList.add("card", "cursor-pointer", "hover:shadow-xl", "transition-all", "duration-300");
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("card-image-container");
    
    // Image with lazy loading
    const image = document.createElement("img");
    // TMDB uses different field names for titles depending on type
    const title = type === 'movie' ? movie.title : movie.name;
    image.alt = title;
    image.classList.add("lazy");
    
    // TMDB provides poster paths that need base URL prefixed
    if (movie.poster_path) {
        image.dataset.src = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;
    } else {
        image.dataset.src = PLACEHOLDER_IMAGE;
    }
    
    // Tiny SVG placeholder while loading
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3C/svg%3E";
    
    // Error handling
    image.onerror = function() {
        this.src = PLACEHOLDER_IMAGE;
        this.onerror = null;
    };
    
    // Rating badge if available
    if (movie.vote_average) {
        const rating = document.createElement("div");
        rating.classList.add("card-rating");
        rating.innerHTML = `<i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}`;
        imageContainer.appendChild(rating);
    }
    
    imageContainer.appendChild(image);
    
    // Card content below the image
    const content = document.createElement("div");
    content.classList.add("card-content");
    
    const titleElem = document.createElement("h3");
    titleElem.classList.add("card-title");
    titleElem.textContent = title;
    titleElem.title = title; // Add tooltip on hover
    
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("card-details");
    
    const yearText = document.createElement("span");
    // Date format is different for movies vs TV
    const releaseDate = type === 'movie' ? movie.release_date : movie.first_air_date;
    yearText.textContent = releaseDate ? releaseDate.substring(0, 4) : 'N/A';
    
    const typeText = document.createElement("span");
    typeText.textContent = type === "movie" ? "Filme" : "Série";
    
    detailsContainer.appendChild(yearText);
    detailsContainer.appendChild(typeText);
    
    content.appendChild(titleElem);
    content.appendChild(detailsContainer);
    
    // Synopsis overlay that appears on hover
    const synopsisContainer = document.createElement("div");
    synopsisContainer.classList.add("card-synopsis-container");
    
    const synopsis = document.createElement("p");
    synopsis.classList.add("card-synopsis");
    // TMDB uses 'overview' instead of 'Plot'
    synopsis.textContent = movie.overview || "Sinopse não disponível.";
    
    synopsisContainer.appendChild(synopsis);
    imageContainer.appendChild(synopsisContainer);
    
    // Assemble the card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Add click handler to navigate to details page
    card.addEventListener("click", (e) => {
        if (!e.target.closest(".card-synopsis-container")) {
            window.location.href = `detalhes.html?id=${movie.id}&type=${type}`;
        }
    });
    
    // Você pode adicionar um tooltip para tornar ainda mais claro
    card.setAttribute("title", "Clique para ver mais detalhes");
    
    // Add card to container
    moviesContainer.appendChild(card);
}

// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
    const toggleIcon = document.querySelector(".toggle-icon i");

    darkModeToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark");
        toggleIcon.classList.toggle("fa-sun");
        toggleIcon.classList.toggle("fa-moon");

        const darkModeLabel = document.getElementById("darkModeLabel");
        if (darkModeLabel) {
            if (document.body.classList.contains("dark")) {
                darkModeLabel.textContent = "Dark Mode";
                document.documentElement.style.setProperty("--text-color", "#fff");
            } else {
                darkModeLabel.textContent = "Light Mode";
                document.documentElement.style.setProperty("--text-color", "#000");
            }
        }
    });

    const darkModeLabel = document.getElementById("darkModeLabel");
    if (darkModeLabel) {
        if (document.body.classList.contains("dark")) {
            darkModeLabel.textContent = "Dark Mode";
        } else {
            darkModeLabel.textContent = "Light Mode";
        }
    }
}

function setupLazyLoading() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onerror = function() {
                    this.src = PLACEHOLDER_IMAGE;
                    this.onerror = null;
                };
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
    });
}

// Initialize the page
fetchMovies();

// Adicionar código para busca de filmes, séries e pessoas

document.addEventListener('DOMContentLoaded', function() {
    // Load current popular movies by default
    fetchTrending();
    
    // Setup search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Setup radio buttons
    const typeRadios = document.querySelectorAll('input[name="contentType"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (searchInput.value.trim() !== '') {
                performSearch();
            } else {
                fetchTrending(this.value);
            }
        });
    });

    loadFeaturedBackdrop();
});

function getSelectedContentType() {
    return document.querySelector('input[name="contentType"]:checked').value;
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) {
        return;
    }
    
    const contentType = getSelectedContentType();
    
    // Show loading state
    moviesContainer.innerHTML = '<div class="flex justify-center items-center h-64 w-full"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>';
    
    // Different endpoints depending on content type
    let searchUrl;
    
    if (contentType === 'all') {
        searchUrl = `${TMDB_API_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=pt-BR`;
    } else {
        searchUrl = `${TMDB_API_BASE_URL}/search/${contentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=pt-BR`;
    }
    
    axios.get(searchUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                renderSearchResults(response.data.results, contentType);
            } else {
                moviesContainer.innerHTML = '<div class="text-center p-8">Nenhum resultado encontrado. Tente outra busca.</div>';
            }
        })
        .catch(error => {
            moviesContainer.innerHTML = '<div class="text-center p-8 text-red-500">Erro ao buscar dados. Por favor tente novamente.</div>';
            console.log(error);
        });
}

function fetchTrending(contentType = 'all') {
    // Show loading state
    moviesContainer.innerHTML = '<div class="flex justify-center items-center h-64 w-full"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>';
    
    let endpoint;
    
    if (contentType === 'all') {
        endpoint = 'trending/all/week';
    } else if (contentType === 'person') {
        endpoint = 'person/popular';
    } else {
        endpoint = `${contentType}/popular`;
    }
    
    const apiUrl = `${TMDB_API_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                renderSearchResults(response.data.results, contentType);
            } else {
                moviesContainer.innerHTML = '<div class="text-center p-8">Nenhum resultado encontrado.</div>';
            }
        })
        .catch(error => {
            moviesContainer.innerHTML = '<div class="text-center p-8 text-red-500">Erro ao carregar dados. Por favor tente novamente.</div>';
            console.log(error);
        });
}

function renderSearchResults(results, contentType) {
    moviesContainer.innerHTML = "";
    
    results.forEach(item => {
        // Skip person results if we're not specifically searching for people
        if (item.media_type === 'person' && contentType !== 'person') {
            return;
        }
        
        // For multi search, we need to determine the media type
        const itemType = item.media_type || contentType;
        
        if (itemType === 'person') {
            createPersonCard(item);
        } else {
            createMovieOrShowCard(item, itemType);
        }
    });
    
    setupLazyLoading();
}

function createMovieOrShowCard(item, itemType) {
    const card = document.createElement("div");
    card.classList.add("card");
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("card-image-container");
    
    // Image with lazy loading
    const image = document.createElement("img");
    const title = itemType === 'movie' ? (item.title || item.original_title) : (item.name || item.original_name);
    image.alt = title;
    image.classList.add("lazy");
    
    if (item.poster_path) {
        image.dataset.src = `${TMDB_IMAGE_BASE_URL}${item.poster_path}`;
    } else {
        image.dataset.src = PLACEHOLDER_IMAGE;
    }
    
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3C/svg%3E";
    
    // Error handling
    image.onerror = function() {
        this.src = PLACEHOLDER_IMAGE;
        this.onerror = null;
    };
    
    // Rating badge if available
    if (item.vote_average) {
        const rating = document.createElement("div");
        rating.classList.add("card-rating");
        rating.innerHTML = `<i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}`;
        imageContainer.appendChild(rating);
    }
    
    imageContainer.appendChild(image);
    
    // Card content below the image
    const content = document.createElement("div");
    content.classList.add("card-content");
    
    const titleElem = document.createElement("h3");
    titleElem.classList.add("card-title");
    titleElem.textContent = title;
    titleElem.title = title; // Add tooltip on hover
    
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("card-details");
    
    const yearText = document.createElement("span");
    // Date format is different for movies vs TV
    const releaseDate = itemType === 'movie' ? item.release_date : item.first_air_date;
    yearText.textContent = releaseDate ? releaseDate.substring(0, 4) : 'N/A';
    
    const typeText = document.createElement("span");
    typeText.textContent = itemType === "movie" ? "Filme" : "Série";
    
    detailsContainer.appendChild(yearText);
    detailsContainer.appendChild(typeText);
    
    content.appendChild(titleElem);
    content.appendChild(detailsContainer);
    
    // Assemble the card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Make the entire card clickable
    card.addEventListener("click", () => {
        window.location.href = `detalhes.html?id=${item.id}&type=${itemType}`;
    });
    
    // Add card to container
    moviesContainer.appendChild(card);
}

function createPersonCard(person) {
    const card = document.createElement("div");
    card.classList.add("card");
    
    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("card-image-container");
    
    // Image with lazy loading
    const image = document.createElement("img");
    image.alt = person.name;
    image.classList.add("lazy");
    
    if (person.profile_path) {
        image.dataset.src = `${TMDB_IMAGE_BASE_URL}${person.profile_path}`;
    } else {
        image.dataset.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='150' r='70' fill='%23a0aec0'/%3E%3Ccircle cx='150' cy='280' r='120' fill='%23a0aec0'/%3E%3C/svg%3E";
    }
    
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3C/svg%3E";
    
    // Error handling
    image.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='150' r='70' fill='%23a0aec0'/%3E%3Ccircle cx='150' cy='280' r='120' fill='%23a0aec0'/%3E%3C/svg%3E";
        this.onerror = null;
    };
    
    imageContainer.appendChild(image);
    
    // Card content below the image
    const content = document.createElement("div");
    content.classList.add("card-content");
    
    const titleElem = document.createElement("h3");
    titleElem.classList.add("card-title");
    titleElem.textContent = person.name;
    titleElem.title = person.name; // Add tooltip on hover
    
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("card-details");
    
    const knownFor = document.createElement("span");
    knownFor.textContent = person.known_for_department || "Atuação";
    
    const personType = document.createElement("span");
    personType.textContent = "Pessoa";
    
    detailsContainer.appendChild(knownFor);
    detailsContainer.appendChild(personType);
    
    content.appendChild(titleElem);
    content.appendChild(detailsContainer);
    
    // Assemble the card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Add click handler to navigate to details page
    card.addEventListener("click", () => {
        window.location.href = `pessoa.html?id=${person.id}`;
    });
    
    // Add card to container
    moviesContainer.appendChild(card);
}

// Adicionar código para carregar imagens de destaque para o header

function loadFeaturedBackdrop() {
    // Get a random popular movie for the backdrop
    const apiUrl = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.results && response.data.results.length > 0) {
                // Get a random movie from top 10
                const randomIndex = Math.floor(Math.random() * Math.min(10, response.data.results.length));
                const movie = response.data.results[randomIndex];
                
                // Update backdrop
                if (movie.backdrop_path) {
                    const backdropElem = document.getElementById('featuredBackdrop');
                    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
                    backdropElem.style.backgroundImage = `url('${backdropUrl}')`;
                }
                
                // Não precisamos mais atualizar título e sinopse já que foram removidos
            }
        })
        .catch(error => {
            console.log('Error loading featured backdrop:', error);
        });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedBackdrop();
    // ... other init code
});