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
    const apiUrl = `${TMDB_API_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers&language=pt-BR`;
    
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
    
    // Preparar informações dos provedores de streaming
    const streamingProviders = prepareStreamingProviders(movie['watch/providers']);
    
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
                    
                    <!-- Seção de Onde Assistir -->
                    ${streamingProviders ? `
                    <div class="mb-6">
                        <h2 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Onde Assistir</h2>
                        ${streamingProviders}
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

function prepareStreamingProviders(watchProviders) {
    if (!watchProviders || !watchProviders.results || !watchProviders.results.BR) {
        return '<p class="text-gray-600 dark:text-gray-400">Informações de disponibilidade não encontradas para o Brasil.</p>';
    }
    
    const brazilData = watchProviders.results.BR;
    const providers = [];
    
    // Mapear provedores para seus sites oficiais
    const providerUrls = {
        'Netflix': 'https://www.netflix.com/br',
        'Amazon Prime Video': 'https://www.primevideo.com',
        'Disney Plus': 'https://www.disneyplus.com/pt-br',
        'HBO Max': 'https://www.hbomax.com/br/pt',
        'Apple TV': 'https://tv.apple.com/br',
        'Paramount Plus': 'https://www.paramountplus.com/br',
        'Globoplay': 'https://globoplay.globo.com',
        'Telecine': 'https://telecineplay.com.br',
        'NOW': 'https://www.nowonline.com.br',
        'Looke': 'https://www.looke.com.br',
        'Pluto TV': 'https://pluto.tv/br',
        'Crunchyroll': 'https://www.crunchyroll.com/pt-br',
        'YouTube': 'https://www.youtube.com',
        'Google Play Movies': 'https://play.google.com/store/movies',
        'Microsoft Store': 'https://www.microsoft.com/pt-br/store/movies-and-tv',
        'Rakuten TV': 'https://rakuten.tv/br',
        'Claro Video': 'https://www.clarovideo.com/brasil'
    };
    
    // Adicionar informações de preço quando disponível
    const providerPricing = {
        'Netflix': 'A partir de R$ 18,90/mês',
        'Amazon Prime Video': 'A partir de R$ 9,90/mês',
        'Disney Plus': 'A partir de R$ 13,90/mês',
        'HBO Max': 'A partir de R$ 19,90/mês',
        'Globoplay': 'A partir de R$ 13,90/mês'
    };
    
    // Coletar todos os tipos de provedores (streaming, aluguel, compra)
    if (brazilData.flatrate) {
        providers.push({
            type: 'Streaming',
            icon: 'fas fa-play-circle',
            color: 'text-green-600',
            providers: brazilData.flatrate
        });
    }
    
    if (brazilData.rent) {
        providers.push({
            type: 'Aluguel',
            icon: 'fas fa-credit-card',
            color: 'text-blue-600',
            providers: brazilData.rent
        });
    }
    
    if (brazilData.buy) {
        providers.push({
            type: 'Compra',
            icon: 'fas fa-shopping-cart',
            color: 'text-purple-600',
            providers: brazilData.buy
        });
    }
    
    if (providers.length === 0) {
        return '<p class="text-gray-600 dark:text-gray-400">Não disponível em serviços de streaming no Brasil no momento.</p>';
    }
    
    let html = '';
    
    providers.forEach(providerGroup => {
        html += `
            <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2 ${providerGroup.color} dark:text-gray-200 flex items-center">
                    <i class="${providerGroup.icon} mr-2"></i>
                    ${providerGroup.type}
                </h3>
                <div class="flex flex-wrap gap-3">
                    ${providerGroup.providers.map(provider => {
                        const logoUrl = `https://image.tmdb.org/t/p/w92${provider.logo_path}`;
                        const providerUrl = providerUrls[provider.provider_name] || '#';
                        const pricingInfo = providerPricing[provider.provider_name] ? `<span class="text-xs text-gray-500 dark:text-gray-400">${providerPricing[provider.provider_name]}</span>` : '';
                        
                        return `
                            <a href="${providerUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                               title="Assistir em ${provider.provider_name}">
                                <img src="${logoUrl}" 
                                     alt="${provider.provider_name}" 
                                     class="w-8 h-8 rounded-md mr-2"
                                     onerror="this.style.display='none'">
                                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    ${provider.provider_name}
                                </span>
                                ${pricingInfo}
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    return html;
}

// Adicionar função para buscar provedores alternativos se não houver dados para o Brasil
function getAlternativeProviders(watchProviders) {
    // Se não há dados para o Brasil, tentar outros países da América Latina
    const alternativeCountries = ['US', 'MX', 'AR', 'CO'];
    
    for (const country of alternativeCountries) {
        if (watchProviders.results[country]) {
            return `
                <div class="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-yellow-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700 dark:text-yellow-200">
                                Não encontramos informações para o Brasil. Provedores disponíveis em outros países:
                            </p>
                        </div>
                    </div>
                </div>
                ${prepareStreamingProvidersForCountry(watchProviders.results[country])}
            `;
        }
    }
    
    return '<p class="text-gray-600 dark:text-gray-400">Informações de disponibilidade não encontradas.</p>';
}

function prepareStreamingProvidersForCountry(countryData) {
    // Implementação similar à prepareStreamingProviders mas para outros países
    const providers = [];
    
    // Mapear provedores para seus sites oficiais
    const providerUrls = {
        'Netflix': 'https://www.netflix.com',
        'Amazon Prime Video': 'https://www.primevideo.com',
        'Disney Plus': 'https://www.disneyplus.com',
        'HBO Max': 'https://www.hbomax.com',
        'Apple TV': 'https://tv.apple.com',
        'Paramount Plus': 'https://www.paramountplus.com',
        'Globoplay': 'https://globoplay.globo.com',
        'Telecine': 'https://telecineplay.com.br',
        'NOW': 'https://www.nowonline.com.br',
        'Looke': 'https://www.looke.com.br',
        'Pluto TV': 'https://pluto.tv',
        'Crunchyroll': 'https://www.crunchyroll.com'
    };
    
    // Coletar todos os tipos de provedores (streaming, aluguel, compra)
    if (countryData.flatrate) {
        providers.push({
            type: 'Streaming',
            icon: 'fas fa-play-circle',
            color: 'text-green-600',
            providers: countryData.flatrate
        });
    }
    
    if (countryData.rent) {
        providers.push({
            type: 'Aluguel',
            icon: 'fas fa-credit-card',
            color: 'text-blue-600',
            providers: countryData.rent
        });
    }
    
    if (countryData.buy) {
        providers.push({
            type: 'Compra',
            icon: 'fas fa-shopping-cart',
            color: 'text-purple-600',
            providers: countryData.buy
        });
    }
    
    if (providers.length === 0) {
        return '<p class="text-gray-600 dark:text-gray-400">Não disponível em serviços de streaming no momento.</p>';
    }
    
    let html = '';
    
    providers.forEach(providerGroup => {
        html += `
            <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2 ${providerGroup.color} dark:text-gray-200 flex items-center">
                    <i class="${providerGroup.icon} mr-2"></i>
                    ${providerGroup.type}
                </h3>
                <div class="flex flex-wrap gap-3">
                    ${providerGroup.providers.map(provider => {
                        const logoUrl = `https://image.tmdb.org/t/p/w92${provider.logo_path}`;
                        const providerUrl = providerUrls[provider.provider_name] || '#';
                        
                        return `
                            <a href="${providerUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                               title="Assistir em ${provider.provider_name}">
                                <img src="${logoUrl}" 
                                     alt="${provider.provider_name}" 
                                     class="w-8 h-8 rounded-md mr-2"
                                     onerror="this.style.display='none'">
                                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    ${provider.provider_name}
                                </span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    return html;
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