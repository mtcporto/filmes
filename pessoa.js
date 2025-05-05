// TMDB API Configuration
const TMDB_API_KEY = "6655c36ae61cd1554fff7fe2b431ccf7";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='150' r='70' fill='%23a0aec0'/%3E%3Ccircle cx='150' cy='280' r='120' fill='%23a0aec0'/%3E%3C/svg%3E";

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar dark mode
    initDarkModeToggle();
    
    // Obter ID da pessoa da URL
    const urlParams = new URLSearchParams(window.location.search);
    const personId = urlParams.get('id');
    
    if (personId) {
        fetchPersonDetails(personId);
    } else {
        document.getElementById('person-details').innerHTML = 
            '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">' +
            '<p>Erro: ID da pessoa não fornecido</p></div>';
    }
});

function fetchPersonDetails(id) {
    // Mostrar indicador de carregamento
    document.getElementById('person-details').innerHTML = 
        '<div class="flex justify-center items-center h-64">' +
        '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>' +
        '</div>';
        
    // Buscar detalhes da pessoa
    const apiUrl = `${TMDB_API_BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,images&language=pt-BR`;
    
    axios.get(apiUrl)
        .then(response => {
            displayPersonDetails(response.data);
        })
        .catch(error => {
            console.error('Error fetching person details:', error);
            document.getElementById('person-details').innerHTML = 
                '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">' +
                '<p>Erro ao carregar detalhes da pessoa</p></div>';
        });
}

function displayPersonDetails(person) {
    // Formatar data de nascimento para formato brasileiro
    const birthDate = person.birthday ? new Date(person.birthday).toLocaleDateString('pt-BR') : 'Desconhecida';
    const deathDate = person.deathday ? new Date(person.deathday).toLocaleDateString('pt-BR') : null;
    
    // Preparar créditos para exibição
    const sortedCredits = prepareCredits(person.combined_credits);
    
    // Construir HTML para os detalhes da pessoa
    const detailsHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div class="md:flex">
                <div class="md:w-1/3 p-4">
                    <div class="rounded-lg overflow-hidden shadow-lg">
                        <img src="${person.profile_path ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}` : PLACEHOLDER_IMAGE}" 
                             alt="${person.name}" 
                             class="w-full h-auto object-cover rounded-lg"
                             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                    </div>
                    
                    <div class="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                        ${person.birthday ? `
                        <div>
                            <span class="font-semibold">Data de nascimento:</span> ${birthDate}
                        </div>
                        ` : ''}
                        
                        ${person.deathday ? `
                        <div>
                            <span class="font-semibold">Data de falecimento:</span> ${deathDate}
                        </div>
                        ` : ''}
                        
                        ${person.place_of_birth ? `
                        <div>
                            <span class="font-semibold">Local de nascimento:</span> ${person.place_of_birth}
                        </div>
                        ` : ''}
                        
                        ${person.known_for_department ? `
                        <div>
                            <span class="font-semibold">Conhecido por:</span> ${person.known_for_department}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="md:w-2/3 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${person.name}</h1>
                        <a href="index.html" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <i class="fas fa-arrow-left mr-2"></i> Voltar
                        </a>
                    </div>
                    
                    ${person.biography ? `
                    <div class="mb-6">
                        <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Biografia</h2>
                        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                            ${person.biography || 'Biografia não disponível.'}
                        </p>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Seção de filmografia -->
            ${sortedCredits.movie.length > 0 || sortedCredits.tv.length > 0 ? `
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Filmografia</h2>
                
                ${sortedCredits.movie.length > 0 ? `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Filmes</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        ${sortedCredits.movie.slice(0, 8).map(credit => `
                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
                                <a href="detalhes.html?id=${credit.id}&type=movie" class="block">
                                    <div class="relative pb-[150%]">
                                        <img 
                                            src="${credit.poster_path ? `${TMDB_IMAGE_BASE_URL}${credit.poster_path}` : PLACEHOLDER_IMAGE}" 
                                            alt="${credit.title}"
                                            class="absolute inset-0 w-full h-full object-cover"
                                            onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                                        ${credit.vote_average ? `
                                        <div class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-bold py-1 px-2 rounded-md text-sm">
                                            <i class="fas fa-star"></i> ${credit.vote_average.toFixed(1)}
                                        </div>
                                        ` : ''}
                                    </div>
                                    <div class="p-3">
                                        <h4 class="font-medium text-sm truncate" title="${credit.title}">${credit.title}</h4>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">
                                            ${credit.release_date ? credit.release_date.substring(0, 4) : 'N/A'} 
                                            ${credit.character ? `• ${credit.character}` : 
                                              credit.job ? `• ${credit.job}` : ''}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                    ${sortedCredits.movie.length > 8 ? `
                    <div class="mt-4 text-center">
                        <button id="showMoreMovies" class="text-blue-600 dark:text-blue-400 hover:underline">
                            Mostrar mais ${sortedCredits.movie.length - 8} filmes
                        </button>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                ${sortedCredits.tv.length > 0 ? `
                <div>
                    <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Séries de TV</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        ${sortedCredits.tv.slice(0, 8).map(credit => `
                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
                                <a href="detalhes.html?id=${credit.id}&type=tv" class="block">
                                    <div class="relative pb-[150%]">
                                        <img 
                                            src="${credit.poster_path ? `${TMDB_IMAGE_BASE_URL}${credit.poster_path}` : PLACEHOLDER_IMAGE}" 
                                            alt="${credit.name}"
                                            class="absolute inset-0 w-full h-full object-cover"
                                            onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                                        ${credit.vote_average ? `
                                        <div class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-bold py-1 px-2 rounded-md text-sm">
                                            <i class="fas fa-star"></i> ${credit.vote_average.toFixed(1)}
                                        </div>
                                        ` : ''}
                                    </div>
                                    <div class="p-3">
                                        <h4 class="font-medium text-sm truncate" title="${credit.name}">${credit.name}</h4>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">
                                            ${credit.first_air_date ? credit.first_air_date.substring(0, 4) : 'N/A'} 
                                            ${credit.character ? `• ${credit.character}` : 
                                              credit.job ? `• ${credit.job}` : ''}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                    ${sortedCredits.tv.length > 8 ? `
                    <div class="mt-4 text-center">
                        <button id="showMoreTvShows" class="text-blue-600 dark:text-blue-400 hover:underline">
                            Mostrar mais ${sortedCredits.tv.length - 8} séries
                        </button>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('person-details').innerHTML = detailsHTML;
    
    // Adicionar event listeners para os botões "mostrar mais"
    const showMoreMoviesBtn = document.getElementById('showMoreMovies');
    if (showMoreMoviesBtn) {
        showMoreMoviesBtn.addEventListener('click', function() {
            showAllCredits('movie', sortedCredits.movie);
        });
    }
    
    const showMoreTvShowsBtn = document.getElementById('showMoreTvShows');
    if (showMoreTvShowsBtn) {
        showMoreTvShowsBtn.addEventListener('click', function() {
            showAllCredits('tv', sortedCredits.tv);
        });
    }
}

function prepareCredits(credits) {
    if (!credits) return { movie: [], tv: [] };
    
    // Separar créditos em filmes e séries de TV
    const movieCredits = credits.cast.filter(item => item.media_type === 'movie')
        .concat(credits.crew.filter(item => item.media_type === 'movie'));
    
    const tvCredits = credits.cast.filter(item => item.media_type === 'tv')
        .concat(credits.crew.filter(item => item.media_type === 'tv'));
    
    // Remover duplicatas (uma pessoa pode ser tanto ator quanto diretor em um mesmo filme)
    const uniqueMovies = Array.from(new Map(movieCredits.map(item => [item.id, item])).values());
    const uniqueTvShows = Array.from(new Map(tvCredits.map(item => [item.id, item])).values());
    
    // Ordenar por popularidade ou data de lançamento
    uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    uniqueTvShows.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    return {
        movie: uniqueMovies,
        tv: uniqueTvShows
    };
}

function showAllCredits(mediaType, credits) {
    // Mostrar todos os créditos em um modal ou expandir a seção
    const containerSelector = mediaType === 'movie' ? 
        'button#showMoreMovies' : 'button#showMoreTvShows';
    
    const container = document.querySelector(containerSelector).parentElement;
    
    // Criar grid de todos os créditos
    const creditsGrid = document.createElement('div');
    creditsGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4';
    
    // Adicionar os itens restantes
    credits.slice(8).forEach(credit => {
        const title = mediaType === 'movie' ? credit.title : credit.name;
        const date = mediaType === 'movie' ? credit.release_date : credit.first_air_date;
        
        const creditCard = document.createElement('div');
        creditCard.className = 'bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300';
        creditCard.innerHTML = `
            <a href="detalhes.html?id=${credit.id}&type=${mediaType}" class="block">
                <div class="relative pb-[150%]">
                    <img 
                        src="${credit.poster_path ? `${TMDB_IMAGE_BASE_URL}${credit.poster_path}` : PLACEHOLDER_IMAGE}" 
                        alt="${title}"
                        class="absolute inset-0 w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                    ${credit.vote_average ? `
                    <div class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-bold py-1 px-2 rounded-md text-sm">
                        <i class="fas fa-star"></i> ${credit.vote_average.toFixed(1)}
                    </div>
                    ` : ''}
                </div>
                <div class="p-3">
                    <h4 class="font-medium text-sm truncate" title="${title}">${title}</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        ${date ? date.substring(0, 4) : 'N/A'} 
                        ${credit.character ? `• ${credit.character}` : 
                          credit.job ? `• ${credit.job}` : ''}
                    </p>
                </div>
            </a>
        `;
        
        creditsGrid.appendChild(creditCard);
    });
    
    container.parentElement.appendChild(creditsGrid);
    container.remove(); // Remove o botão "Mostrar mais"
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