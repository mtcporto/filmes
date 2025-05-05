// TMDB API Configuration
const TMDB_API_KEY = "6655c36ae61cd1554fff7fe2b431ccf7";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"; // Use higher quality for details page
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' fill='%23718096'%3ENo Poster Available%3C/text%3E%3C/svg%3E";

document.addEventListener('DOMContentLoaded', function() {
    // Init dark mode toggle
    initDarkModeToggle();
    
    // Get movie ID and type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const type = urlParams.get('type') || 'movie'; // Default to movie
    
    if (movieId) {
        fetchMovieDetails(movieId, type);
    } else {
        // Handle error state
        document.getElementById('movie-details').innerHTML = '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Erro: ID não fornecido</p></div>';
    }
});

function fetchMovieDetails(id, type) {
    const apiUrl = `${TMDB_API_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos&language=pt-BR`;
    
    // Show loading state
    document.getElementById('movie-details').innerHTML = 
        '<div class="flex justify-center items-center h-64">' +
        '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>' +
        '</div>';
        
    axios.get(apiUrl)
        .then(response => {
            displayMovieDetails(response.data, type);
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            document.getElementById('movie-details').innerHTML = '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Erro ao carregar detalhes</p></div>';
        });
}

function displayMovieDetails(movie, type) {
    // Adjust field names based on content type (movie vs tv)
    const title = type === 'movie' ? movie.title : movie.name;
    const releaseDate = type === 'movie' ? movie.release_date : movie.first_air_date;
    const runtime = type === 'movie' ? 
        (movie.runtime ? `${movie.runtime} min` : 'N/A') : 
        (movie.episode_run_time && movie.episode_run_time.length > 0 ? 
            `${movie.episode_run_time[0]} min por episódio` : 'N/A');
    
    // Format date to Brazilian format
    const formattedDate = releaseDate ? 
        new Date(releaseDate).toLocaleDateString('pt-BR') : 'Data desconhecida';
    
    // Create HTML content using Tailwind
    const detailsHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div class="md:flex">
                <div class="md:w-1/3 p-4">
                    <div class="rounded-lg overflow-hidden shadow-lg">
                        <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : PLACEHOLDER_IMAGE}" 
                             alt="${title}" 
                             class="w-full h-auto object-cover rounded-lg"
                             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                    </div>
                </div>
                <div class="md:w-2/3 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${title}</h1>
                        <a href="index.html" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <i class="fas fa-arrow-left mr-2"></i> Voltar
                        </a>
                    </div>
                    
                    <div class="flex flex-wrap items-center mb-6 text-gray-700 dark:text-gray-300">
                        ${movie.vote_average ? `
                        <div class="mr-4 mb-2 flex items-center">
                            <div class="bg-yellow-400 text-yellow-900 font-bold py-1 px-2 rounded-md">
                                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="mr-4 mb-2">
                            <i class="far fa-calendar-alt mr-1"></i> ${formattedDate}
                        </div>
                        
                        <div class="mr-4 mb-2">
                            <i class="far fa-clock mr-1"></i> ${runtime}
                        </div>
                    </div>
                    
                    ${movie.genres && movie.genres.length > 0 ? `
                    <div class="mb-6">
                        <div class="flex flex-wrap gap-2">
                            ${movie.genres.map(genre => `
                                <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-800 dark:text-gray-200">
                                    ${genre.name}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="mb-6">
                        <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Sinopse</h2>
                        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${movie.overview || 'Sinopse não disponível.'}</p>
                    </div>
                </div>
            </div>
            
            ${movie.credits && movie.credits.cast && movie.credits.cast.length > 0 ? `
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Elenco Principal</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${movie.credits.cast.slice(0, 6).map(actor => `
                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                                ${actor.profile_path ? 
                                    `<img src="https://image.tmdb.org/t/p/w200${actor.profile_path}" 
                                          alt="${actor.name}"
                                          class="w-full h-full object-cover"
                                          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'40\\' r=\\'25\\' fill=\\'%23a0aec0\\' /%3E%3Ccircle cx=\\'50\\' cy=\\'110\\' r=\\'40\\' fill=\\'%23a0aec0\\' /%3E%3C/svg%3E';">` : 
                                    `<div class="w-full h-full flex items-center justify-center bg-gray-400 dark:bg-gray-600">
                                        <i class="fas fa-user text-gray-600 dark:text-gray-400"></i>
                                    </div>`
                                }
                            </div>
                            <p class="font-medium text-gray-900 dark:text-white">${actor.name}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${actor.character}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${movie.videos && movie.videos.results && movie.videos.results.length > 0 ? `
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Trailers & Vídeos</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${movie.videos.results.slice(0, 2).map(video => `
                        <div class="aspect-w-16 aspect-h-9">
                            <iframe src="https://www.youtube.com/embed/${video.key}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen
                                    class="w-full h-full rounded-lg"></iframe>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('movie-details').innerHTML = detailsHTML;
}

function initDarkModeToggle() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        const toggleIcon = document.querySelector(".toggle-icon i");

        // Init state
        if (document.body.classList.contains("dark")) {
            darkModeToggle.checked = true;
            if (toggleIcon) {
                toggleIcon.classList.remove("fa-sun");
                toggleIcon.classList.add("fa-moon");
            }
        } else {
            darkModeToggle.checked = false;
            if (toggleIcon) {
                toggleIcon.classList.add("fa-sun");
                toggleIcon.classList.remove("fa-moon");
            }
        }

        // Add event listener
        darkModeToggle.addEventListener("change", () => {
            document.body.classList.toggle("dark");
            if (toggleIcon) {
                toggleIcon.classList.toggle("fa-sun");
                toggleIcon.classList.toggle("fa-moon");
            }
        });
    }
}