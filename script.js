    // script.js
    const moviesContainer = document.getElementById("movies");
    const yearTypeLabel = document.getElementById("yearTypeLabel");
    const typeMovieBtn = document.getElementById("typeMovieBtn");
    const typeSeriesBtn = document.getElementById("typeSeriesBtn");
    const prevYearBtn = document.getElementById("prevYearBtn");
    const nextYearBtn = document.getElementById("nextYearBtn");
    const currentYearLabel = document.getElementById("currentYearLabel");

    let year = new Date().getFullYear();
    let type = "movie";

    function fetchMovies() {
        const apiUrl = `https://www.omdbapi.com/?apikey=464b9c8f&s=${type}&y=${year}`;

        axios.get(apiUrl)
            .then(response => {
                const movies = response.data.Search;

                moviesContainer.innerHTML = "";

                function isImageAvailable(src) {
                    return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(true);
                    image.onerror = () => resolve(false);
                    image.src = src;
                    });
                }
                
                

                movies.forEach(async (movie) => {
                    // Crie uma nova chamada à API OMDB para obter mais informações sobre o filme usando seu ID
                    const movieDetailsApiUrl = `https://www.omdbapi.com/?apikey=464b9c8f&i=${movie.imdbID}`;
                    let movieDetails;
                    try {
                        const response = await axios.get(movieDetailsApiUrl);
                        movieDetails = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                
                    const card = document.createElement("div");
                    card.classList.add("card");
                
                    // Remova a segunda declaração da variável `card`
                    // const card = document.createElement("div");
                    // card.classList.add("card");
                
                    const image = document.createElement("img");
                    image.alt = movie.Title;
                
                    const isAvailable = await isImageAvailable(movie.Poster);
                    if (isAvailable) {
                        image.src = movie.Poster;
                    } else {
                        image.src = "https://via.placeholder.com/300x450?text=No+Poster";
                    }
                
                    const content = document.createElement("div");
                    content.classList.add("card-content");
                
                    const title = document.createElement("h3");
                    title.textContent = movie.Title;
                
                    const details = document.createElement("p");
                    details.textContent = `${movie.Type} - Ano: ${movie.Year}`;
                    
                    const synopsis = document.createElement("p");
                    synopsis.classList.add("card-synopsis");
                    // Use a sinopse obtida da chamada à API OMDB
                    synopsis.textContent = movieDetails.Plot;
                
                    content.appendChild(title);
                    content.appendChild(details);
                    content.appendChild(synopsis);
                
                    card.appendChild(image);
                    card.appendChild(content);
                
                    moviesContainer.appendChild(card);
                });
                
                
                
                
                
            })
            .catch(error => {
                console.log(error);
            });
    }

    function decrementYear() {
        if (year > 1) {
          year--;
          fetchMovies();
          updateYearTypeLabel();

        }
      }
      
      function incrementYear() {
        if (year < getCurrentYear()) {
          year++;
          fetchMovies();
          updateYearTypeLabel();

        }
      }

    function switchToMovie() {
        type = "movie";
        typeMovieBtn.classList.add("bg-blue-500");
        typeMovieBtn.classList.remove("bg-gray-500");
        typeSeriesBtn.classList.add("bg-gray-500");
        typeSeriesBtn.classList.remove("bg-blue-500");
        fetchMovies();
        updateYearTypeLabel();
    }

    function switchToSeries() {
        type = "series";
        typeMovieBtn.classList.add("bg-gray-500");
        typeMovieBtn.classList.remove("bg-blue-500");
        typeSeriesBtn.classList.add("bg-blue-500");
        typeSeriesBtn.classList.remove("bg-gray-500");
        fetchMovies();
        updateYearTypeLabel();
    }

    function updateYearTypeLabel() {
        const yearTypeLabel = document.getElementById("yearTypeLabel");
        yearTypeLabel.textContent = `${type === "movie" ? "Filmes" : "Séries"} - ${year}`;
    
        // Adicione as seguintes linhas para atualizar o ano entre os botões "Ano Anterior" e "Próximo Ano"
        const currentYearLabel = document.querySelector(".year-navigation #currentYearLabel");
        currentYearLabel.textContent = year;
    }
    

    function getCurrentYear() {
        return new Date().getFullYear();
    }

    prevYearBtn.addEventListener("click", decrementYear);
    nextYearBtn.addEventListener("click", incrementYear);
    typeMovieBtn.addEventListener("click", switchToMovie);
    typeSeriesBtn.addEventListener("click", switchToSeries);

    const darkModeToggle = document.getElementById("darkModeToggle");


    // Altere o seletor para selecionar o ícone do Font Awesome
    const toggleIcon = document.querySelector(".toggle-icon i");

    darkModeToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark");
        toggleIcon.classList.toggle("fa-sun");
        toggleIcon.classList.toggle("fa-moon");
    
        // Change the text of the label when the toggle is switched
        const darkModeLabel = document.getElementById("darkModeLabel");
        if (document.body.classList.contains("dark")) {
            darkModeLabel.textContent = "Dark Mode";
            document.documentElement.style.setProperty("--text-color", "#fff");
        } else {
            darkModeLabel.textContent = "Light Mode";
            document.documentElement.style.setProperty("--text-color", "#000");
        }
    });
    
    if (document.body.classList.contains("dark")) {
        darkModeLabel.textContent = "Dark Mode";
    } else {
        darkModeLabel.textContent = "Light Mode";
    }
    

    function updateCurrentYear() {
        const currentYearLabel = document.querySelector(".year-navigation #currentYearLabel");
        const currentYear = getCurrentYear();
        currentYearLabel.textContent = currentYear;
    }
    
    updateYearTypeLabel();
    updateCurrentYear();
    fetchMovies();