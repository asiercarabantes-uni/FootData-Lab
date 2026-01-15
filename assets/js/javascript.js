// Array of league identifiers, representing different national leagues (Spain, England, Italy, Germany, France).
const leagues = ['es.1', 'es.2', 'en.1', 'it.1', 'de.1', 'fr.1']

// Array of season strings, used to access historical data for each season.
const seasons = ['2025-26', '2024-25', '2023-24', '2022-23',
  '2021-22', '2020-21', '2019-20', '2018-19',
  '2017-18', '2016-17', '2015-16', '2014-15'];

// Canonical names
const canonicalNames = {
    'Club Atlético de Madrid': 'Atlético de Madrid',
    'Atlético Madrid': 'Atlético de Madrid',
    'Club Deportivo Alavés': 'Deportivo Alavés',
    'CD Alavés': 'Deportivo Alavés',
    'Deportivo La Coruña': 'Deportivo de La Coruña',
    'Rayo Vallecano de Madrid': 'Rayo Vallecano',
    'RC Celta': 'RC Celta de Vigo',
    'Real Madrid CF': 'Real Madrid',
    'Real Betis Balompié': 'Real Betis',
    'RCD Espanyol de Barcelona': 'RCD Espanyol',
    'Espanyol Barcelona': 'RCD Espanyol',
    'Real Sociedad de Fútbol': 'Real Sociedad',
    'Aston Villa FC': 'Aston Villa',
    'Brighton & Hove Albion FC': 'Brighton & Hove Albion',
    'Crystal Palace FC': 'Crystal Palace',
    'Leicester City FC': 'Leicester',
    'Leicester City': 'Leicester',
    'Manchester City FC': 'Manchester City',
    'Manchester United FC': 'Manchester United',
    'Newcastle United FC': 'Newcastle United',
    'Norwich City FC': 'Norwich City',
    'Racing Santander': 'Racing de Santander',
    'Racing Ferrol': 'Racing de Ferrol',
    'Recreativo Huelva': 'Recreativo de Huelva',
    'Sporting Gijon': 'Sporting de Gijon',
    'Bayer 04 Leverkusen': 'Bayer Leverkusen',
    'FC Bayern München': 'Bayern München',
    'Bor. Mönchengladbach': 'Borussia Mönchengladbach',
    'Wolverhampton Wanderers FC': 'Wolves',
    'Wolverhampton Wanderers': 'Wolves',
    'AS Monaco FC': 'AS Monaco',
    'Olympique Marseille': 'Olympique de Marseille',
    'Paris Saint-Germain FC': 'Paris Saint-Germain',
    'RC Strasbourg Alsace': 'RC Strasbourg',
    'Arsenal FC': 'Arsenal',
    'FC Internazionale Milano': 'Inter de Milan',
    'Atalanta BC': 'Atalanta',
    'ACF Fiorentina': 'Fiorentina',
    'Bologna FC 1909': 'Bologna FC'
}
// Object mapping various team name variations to a single canonical name.
// This ensures consistency when processing team data from different sources.

// Maps league identifiers to their human-readable names for display purposes.
const leagueMap = {
  'es.1': 'LaLiga EA Sports',
  'es.2': 'LaLiga Hypermotion',
  'en.1': 'Premier League',
  'it.1': 'Serie A',
  'de.1': 'Bundesliga',
  'fr.1': 'Ligue 1'
};

// normalizeTeamName function
function normalizeTeamName(name) {
  return canonicalNames[name] || name;
}
// Function to standardize team names using the canonicalNames map.
// If the name isn't found, it returns the original name.

// league ranking function
async function getLeagueTable(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    // Constructs the URL to fetch match data for the given league and season.

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`No se pudo cargar ${season} ${league}`);
            return [];
        }
        // Fetches the JSON data. If the request fails, logs a warning and returns an empty array.

        const data = await res.json();
        const matches = data.matches;
        const teams = {};

        matches.forEach(match => {
            // Ignore matches without a score
            if (!match.score || !match.score.ft) return;

            // Ensure team objects exist
            if (!teams[match.team1]) {
                teams[match.team1] = {
                    name: match.team1,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDiff: 0,
                    points: 0
                };
            }
            if (!teams[match.team2]) {
                teams[match.team2] = {
                    name: match.team2,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDiff: 0,
                    points: 0
                };
            }

            const g1 = match.score.ft[0];
            const g2 = match.score.ft[1];

            const t1 = teams[match.team1];
            const t2 = teams[match.team2];

            // actualizar partidos jugados
            t1.played++;
            t2.played++;

            // actualizar goles
            t1.goalsFor += g1;
            t1.goalsAgainst += g2;
            t2.goalsFor += g2;
            t2.goalsAgainst += g1;

            // actualizar resultados y puntos
            if (g1 > g2) {
                t1.wins++;
                t1.points += 3;
                t2.losses++;
            } else if (g2 > g1) {
                t2.wins++;
                t2.points += 3;
                t1.losses++;
            } else {
                t1.draws++;
                t2.draws++;
                t1.points++;
                t2.points++;
            }

            t1.goalDiff = t1.goalsFor - t1.goalsAgainst;
            t2.goalDiff = t2.goalsFor - t2.goalsAgainst;
        });

        // Returns the final league table as an array, sorted according to standard ranking rules.
        const table = Object.values(teams).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
        });

        return table;

    } catch (err) {
        console.error("Error loading stats: ", err);
        return [];
    }
}

// renderTable function
function renderTable(table) {
    const container = document.getElementById("league_table");
    // Finds the container element where the table will be rendered.

    const html = `
        <table class="table table-hover" >
            <thead class="table-dark">
                <tr>
                    <th scope="col">Pos</th>
                    <th scope="col">Team</th>
                    <th scope="col">Pl</th>
                    <th scope="col">W</th>
                    <th scope="col">D</th>
                    <th scope="col">L</th>
                    <th scope="col">GF</th>
                    <th scope="col">GA</th>
                    <th scope="col">GD</th>
                    <th scope="col">Pts</th>
                </tr>
            </thead>
            <tbody>
                ${table.map((team, index) => `
                    <tr>
                        <th scope="row">${index + 1}</th>
                        <td>${team.name}</td>
                        <td>${team.played}</td>
                        <td>${team.wins}</td>
                        <td>${team.draws}</td>
                        <td>${team.losses}</td>
                        <td>${team.goalsFor}</td>
                        <td>${team.goalsAgainst}</td>
                        <td>${team.goalDiff}</td>
                        <td>${team.points}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// load all teams and display it dynamically 
async function loadAllTeams() {
    const teamsMap = new Map();
    // Using a Map to store unique teams with their associated leagues.
    // Map allows fast lookups and avoids duplicates.

    for (const season of seasons) {
        for (const league of leagues) {
            const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
            // Construct the URL to fetch match data for each season and league.

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Skipped ${season} ${league} (file not found)`);
                    continue;
                }
                // If the file doesn't exist, log a warning and skip to the next iteration.

                const data = await response.json();

                const firstRound = data.matches.filter(
                    match => match.round && (match.round.includes('Matchday 1') || (match.round.includes('1. Round')))
                );
                // Filter only the matches from the first round of the season.
                // This is used to detect all participating teams without processing the entire season.

                firstRound.forEach(match => {
                    const teams = [match.team1, match.team2];

                    teams.forEach(teamName => {
                        const canonical = normalizeTeamName(teamName);
                        if (teamsMap.has(canonical)) {
                            const existing = teamsMap.get(canonical);
                            if (!existing.leagueCodes.includes(league)) {
                                existing.leagues.push(leagueMap[league]);
                                existing.leagueCodes.push(league);
                            }
                        } else {
                            teamsMap.set(canonical, {
                                name: canonical,
                                leagues: [leagueMap[league]],
                                leagueCodes: [league]
                            });
                        }
                    });
                });
            } catch (err) {
                console.error("Error loading points:", err);
            }
        }
    }
    //console.log(teamsMap);
    return Array.from(teamsMap.values());
}

// Function to create a HTML card for a team
function createTeamCard(team) {

    const badges = team.leagues.map(league => `<span class="course-badge">${league}</span>`).join('');
    // Create HTML badges for all leagues the team participates in.

    return `
    <div class="col-lg-6 col-md-6 mb-4">
        <div class="course-card">
            <div class="course-image">
                <img src="assets/img/teams/default.png" class="img-fluid" alt="${team.name}">
            </div>

            <div class="course-content">
                <div class="course-meta">
                    <span class="category">
                        ${badges} <!-- todos los badges dentro de category -->
                    </span>
                </div>

                <h3>${team.name}</h3>

                <p>
                    Professional football club competing in ${team.league},
                    based on open football data from 2010 to 2025.
                </p>

                <a href="#" class="btn-course">View Team</a>
            </div>
        </div>
    </div>
    `;
}

// ---------- make the pagination functional ----------

let teams = [];              // All teams loaded from the data
let filteredTeams = [];      // Teams after applying search/filter
const teamsPerPage = 10;     // Number of teams to show per page
let currentPage = 1;         // Current active page
let totalPages = 1;          // Total number of pages

let searchInput;
const isTeamsPage = !!document.getElementById('teams-container'); 

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('teams-container');
    searchInput = document.getElementById('searchInput'); // Initialize search input reference

    if (!container) return;
    // If container doesn't exist, exit (we are not on the teams page)

    // Display a loading spinner while fetching data
    container.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Load all teams asynchronously
    teams = await loadAllTeams();

    // Sort teams alphabetically by name
    teams.sort((a, b) => a.name.localeCompare(b.name));
    filteredTeams = [...teams];
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
    currentPage = 1;

    renderPage(1); // Render the first page

    // Add event listeners for all league filter checkboxes
    document.querySelectorAll('.filter-checkbox input')
        .forEach(cb => cb.addEventListener('change', onFilterChange));

    // Add event listener for search input
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});


function renderPage(pageNumber) {
    const container = document.getElementById('teams-container');
    container.innerHTML = ''; // Clear previous content

    const start = (pageNumber - 1) * teamsPerPage;
    const end = start + teamsPerPage;

    // Display only the teams for this page
    filteredTeams.slice(start, end).forEach(team => {
    container.innerHTML += createTeamCard(team);
    });

    currentPage = pageNumber;
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

    renderPagination(); // Update pagination buttons

    // Smooth scroll to top after page change
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function renderPagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const delta = 2; // Number of pages to show around the current page
    const range = [];
    const total = totalPages;

    // Create the page number range including first, last, and pages around current
    for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
    } else if (range[range.length - 1] !== '...') {
        range.push('...');
    }
    }

    // Render "back" button
    pagination.innerHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">
        <i class="bi bi-chevron-left"></i>
        </a>
    </li>
    `;

    // Render page numbers
    range.forEach(i => {
    if (i === '...') {
        pagination.innerHTML += `
        <li class="page-item disabled"><span class="page-link">...</span></li>
        `;
    } else {
        pagination.innerHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
        `;
    }
    });

    // Render "next" button
    pagination.innerHTML += `
    <li class="page-item ${currentPage === total ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">
        <i class="bi bi-chevron-right"></i>
        </a>
    </li>
    `;

    // Attach click events to all pagination links
    document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= totalPages) renderPage(page);
    });
    });
}

// ---------- filters ----------

document.querySelectorAll('.filter-checkbox input')
    .forEach(cb => cb.addEventListener('change', onFilterChange));

function applyFilters() {
    if (!isTeamsPage) return;

    const query = searchInput ? searchInput.value.toLowerCase() : "";

    // Get all checked league filters
    const checkedLeagues = Array.from(
        document.querySelectorAll('.filter-checkbox input:checked')
    ).map(cb => cb.dataset.league);

    let filtered = [];
    if (!checkedLeagues || checkedLeagues.includes('all')) {
        filtered = [...teams]; // No filter applied
    } else {
        // Filter teams by selected league codes
        filtered = teams.filter(team =>
            checkedLeagues.some(code => team.leagueCodes.includes(code))
        );
    }

    // Apply text search
    filteredTeams = filtered.filter(team =>
        team.name.toLowerCase().includes(query)
    );

    currentPage = 1;
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
    renderPage(1); // Render the first page of filtered results
}

function onFilterChange(e) {

    if (!isTeamsPage) return;

    const allCheckbox = document.querySelector('input[data-league="all"]');
    const leagueCheckboxes = Array.from(
    document.querySelectorAll('.filter-checkbox input:not([data-league="all"])')
    );

    const checked = document.querySelectorAll('.filter-checkbox input:checked');

    // Ensure at least one checkbox is always selected
    if (checked.length === 0) {
        e.target.checked = true;
        return;
    }

    // If "all" is checked, uncheck other leagues
    if (e.target.dataset.league === 'all' && e.target.checked) {
        leagueCheckboxes.forEach(cb => cb.checked = false);
    }

    // If a specific league is checked, uncheck "all"
    if (e.target.dataset.league !== 'all' && e.target.checked) {
        allCheckbox.checked = false;
    }

    // If none are checked, default back to "all"
    const anyLeagueChecked = leagueCheckboxes.some(cb => cb.checked);
    if (!anyLeagueChecked && !allCheckbox.checked) {
        allCheckbox.checked = true;
    }

    applyFilters(); // Apply filters after any change
}

function createLeagueCard(code, name, delay) {
  return `
    <div class="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
      <div class="instructor-card">
        <div class="instructor-image">
          <img src="assets/img/teams/default.png" class="img-fluid" alt="${name}">
          <div class="overlay-content">
            <div class="rating-stars">
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-half"></i>
              <span>4.5</span>
            </div>
            <div class="course-count">
              <i class="bi bi-play-circle"></i>
              <span>Info</span>
            </div>
          </div>
        </div>
        <div class="instructor-info">
          <h5>${name}</h5>
          <p class="specialty">${code}</p>
          <p class="description">Top football league</p>
          <div class="action-buttons">
            <a href="#" class="btn-view">View League</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------- dropdown ----------

// Get URL parameters to detect which league is selected
const urlParams = new URLSearchParams(window.location.search);
const leagueId = urlParams.get('league');

// Get the season select dropdown element
const seasonSelect = document.getElementById("season-select");

async function seasonExists(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok; // Returns true if file exists, false otherwise
    } catch {
        return false; // Return false if network error
    }
}

async function loadSeasons(league) {
    seasonSelect.innerHTML = ""; // Clear previous options

    for (const season of seasons) {
        const exists = await seasonExists(league, season);
        if (exists) {
            const option = document.createElement("option");
            option.value = season;
            option.textContent = season;
            seasonSelect.appendChild(option);
        }
    }

    // If there’s at least one season, select the first and load it
    if (seasonSelect.options.length > 0) {
        seasonSelect.selectedIndex = 0;
        loadLeague(seasonSelect.value);
    } else {
        document.getElementById("league_table").innerHTML = "<p>No seasons available.</p>";
    }
}

function renderLeagueHero(leagueCode) {
    const leagueNameEl = document.getElementById('league-name');
    const leagueDescEl = document.getElementById('league-desc');

    if (!leagueMap[leagueCode]) return;

    const leagueName = leagueMap[leagueCode];

    // Map of league logos
    const leagueLogos = {
        'es.1': 'assets/img/leagues/laliga-easports.png',
        'es.2': 'assets/img/leagues/laliga-hypermotion.png',
        'en.1': 'assets/img/leagues/premier-league.png',
        'it.1': 'assets/img/leagues/serie-a.png',
        'de.1': 'assets/img/leagues/bundesliga.png',
        'fr.1': 'assets/img/leagues/ligue1.png',
    };

    const logoSrc = leagueLogos[leagueCode] || leagueLogos['default'];

    leagueNameEl.innerHTML = `
        <img src="${logoSrc}" alt="${leagueName}" class="league-logo me-2" style="height:60px; vertical-align:middle;">
        <span style="font-size:3rem; font-weight:700;">${leagueName}</span>
    `;

    leagueDescEl.textContent = `Explore the latest stats, tables and highlights of the ${leagueName}.`;
}

function renderSummaryCards(table) {
    const container = document.getElementById('summary-cards');
    container.innerHTML = '';

    if (!table || table.length === 0) return;

    // Each match counted twice (once per team)
    const totalMatches = table.reduce((sum, team) => sum + team.played, 0) / 2; 
    const totalGoals = table.reduce((sum, team) => sum + team.goalsFor, 0);
    const avgGoals = (totalGoals / totalMatches).toFixed(2);
    const totalTeams = table.length;

    const topTeam = table[0].name; // Table is already sorted by points
    const mostWinDiff = table.reduce((max, team) => Math.max(max, team.goalDiff), 0);

    const cards = [
        { title: 'Matches Played', value: totalMatches },
        { title: 'Goals Scored', value: totalGoals },
        { title: 'Average Goals', value: avgGoals },
        { title: 'Teams', value: totalTeams },
        { title: 'Top Team', value: topTeam },
        { title: 'Best Goal Diff', value: mostWinDiff }
    ];

    cards.forEach(card => {
        container.innerHTML += `
            <div class="col-lg-3 col-md-6">
                <div class="card shadow-sm h-100 mb-4">
                    <div class="card-body text-center">
                        <h6 class="text-muted">${card.title}</h6>
                        <h2>${card.value}</h2>
                    </div>
                </div>
            </div>
        `;
    });

    // Add hover effect (lift and shadow)
    document.querySelectorAll('.summary-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        });
    });
}

async function loadLeague(season) {
    if (!leagueId) return;

    // Show loading spinner
    const container = document.getElementById('league_table');
    container.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    renderLeagueHero(leagueId); // Update hero

    const table = await getLeagueTable(leagueId, season); // Fetch league table

    if (table && table.length > 0) {
        renderTable(table);             // Render table
        renderSummaryCards(table);      // Render stats cards
    } else {
        container.innerHTML = "<p>No data available for this season.</p>";
        document.getElementById('summary-cards').innerHTML = '';
    }
}

// Update table when season is changed
if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
        loadLeague(seasonSelect.value);
    });
}

// Initially load seasons if league is specified in URL
if (leagueId && seasonSelect) {
    loadSeasons(leagueId);
}

// ---------- goals per season chart (Chart 1) ----------

let goalsSeasonChart;
// Variable to store the Chart.js chart instance for later updates/destroy

const leagueSelectChart = document.getElementById("season-select-chart");
// Dropdown for selecting the league for the chart
const spinner = document.getElementById('goals-spinner');
// Spinner element shown while fetching data

// Llenar con ligas
leagues.forEach(l => {
    const option = document.createElement("option");
    option.value = l; // league code
    option.textContent = leagueMap[l] || l; // human-readable name
    leagueSelectChart.appendChild(option);
});
// Adds all leagues to the chart dropdown dynamically

// --- Función para cargar goles por temporada ---
async function loadGoalsPerSeasonLine(league) {
    if (!league) {
        renderGoalsChartEmpty(); // show empty chart if no league selected
        return;
    }

    spinner.style.display = 'block'; // show loading spinner

    const labels = [];
    const values = [];

    // Fetch goals data for all seasons concurrently
    const fetchPromises = seasons.map(async season => {
        const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
        try {
            const res = await fetch(url);
            if (!res.ok) return null;

            const data = await res.json();
            const matches = data.matches || [];

            let totalGoals = 0;
            matches.forEach(m => {
                if (m.score && m.score.ft) totalGoals += m.score.ft[0] + m.score.ft[1]; // sum goals for both teams
            });

            if (totalGoals > 0) return { season, totalGoals };
            return null;
        } catch {
            return null; // Ignore network errors
        }
    });

    const results = await Promise.all(fetchPromises);

    results.forEach(r => {
        if (r) {
            labels.push(r.season);
            values.push(r.totalGoals);
        }
    });

    // Ordenar cronológicamente
    labels.reverse();
    values.reverse();

    renderGoalsChartLine(labels, values);
    spinner.style.display = 'none';
}

// --- Función para renderizar línea ---
function renderGoalsChartLine(labels, values) {
    const canvas = document.getElementById('goalsSeasonChart');
    const ctx = canvas.getContext('2d');

    // High-DPI (retina) scaling
    const displayWidth = 600;  // visible width
    const displayHeight = 300; // visible width
    const ratio = window.devicePixelRatio || 1;

    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // scale all drawing

    if (goalsSeasonChart) goalsSeasonChart.destroy();

    goalsSeasonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Goals Scored',
                data: values,
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Displays an empty chart (used initially or if no league is selected)
function renderGoalsChartEmpty() {
    renderGoalsChartLine([], []);
}

// When the user selects a different league, fetch and render the new data
leagueSelectChart.addEventListener('change', () => {
    loadGoalsPerSeasonLine(leagueSelectChart.value);
});

leagueSelectChart.selectedIndex = 0; // select first league by default
renderGoalsChartEmpty(); // render an empty chart initially  


// ---------- match search ----------
let allTeams = [];
// Global array that will store all available teams (used for autocomplete)

// --- Initialize teams ---
async function initTeams() {
    allTeams = await loadAllTeams();
    // Loads all teams using an existing function and stores them globally
}

// --- Team autocomplete ---
function setupAutocomplete(inputEl, suggestionsEl) {
    inputEl.addEventListener('input', () => {
        const val = inputEl.value.toLowerCase();
        suggestionsEl.innerHTML = '';

        if (!val) return;
        // Do nothing if the input is empty

        const matches = allTeams
            .map(t => t.name)
            .filter(name => name.toLowerCase().includes(val))
            .slice(0, 10);
        // Find up to 10 team names that include the typed value
            
        matches.forEach(name => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action';
            item.textContent = name;

            item.addEventListener('click', () => {
                inputEl.value = name;
                suggestionsEl.innerHTML = '';
            });
            // When a suggestion is clicked, set the input value and clear suggestions

            suggestionsEl.appendChild(item);
        });
    });

    inputEl.addEventListener('blur', () => {
        // Delay clearing to allow click event to register
        setTimeout(() => { suggestionsEl.innerHTML = ''; }, 100);
    });
}

setupAutocomplete(
    document.getElementById('search-team-1'),
    document.getElementById('search-team-1-suggestions')
);
setupAutocomplete(
    document.getElementById('search-team-2'),
    document.getElementById('search-team-2-suggestions')
);
// Initializes autocomplete for both team input fields

// --- Search matches between two teams ---
async function searchMatches(team1, team2) {
    const resultsContainer = document.getElementById('match-search-results');

    // Show loading spinner
    resultsContainer.innerHTML = `<div class="text-center my-3">
        <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>`;

    const matchesFound = [];

    for (const season of seasons) {
        for (const league of leagues) {
            const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
            try {
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();
                const matches = data.matches || [];

                matches.forEach(match => {
                    const mTeam1 = normalizeTeamName(match.team1);
                    const mTeam2 = normalizeTeamName(match.team2);

                    if ((mTeam1 === team1 && mTeam2 === team2) ||
                        (mTeam1 === team2 && mTeam2 === team1)) {

                        matchesFound.push({
                            date: match.date || '',
                            season,
                            league: leagueMap[league] || league,
                            team1: mTeam1,
                            team2: mTeam2,
                            score: match.score?.ft || ['-', '-']
                        });
                    }
                });

            } catch(err) {
                console.error("Error loading matches:", err);
            }
        }
    }

    // --- Ordenar: más recientes arriba ---
    matchesFound.sort((a, b) => {
        if (a.date && b.date) return new Date(b.date) - new Date(a.date);
        return seasons.indexOf(b.season) - seasons.indexOf(a.season);
    });

    // --- Renderizar resultados ---
    if (matchesFound.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center">No matches found.</p>';
        return;
    }

    // Calcular victorias/empates
    let team1Wins = 0, team2Wins = 0, draws = 0;
    matchesFound.forEach(m => {
        if (!m.score || m.score[0] === '-' || m.score[1] === '-') return;
        const [g1, g2] = m.score.map(Number);

        // Contabilizar victorias según qué equipo es team1 en la búsqueda
        if (m.team1 === team1) {
            if (g1 > g2) team1Wins++;
            else if (g2 > g1) team2Wins++;
            else draws++;
        } else {
            if (g2 > g1) team1Wins++;
            else if (g1 > g2) team2Wins++;
            else draws++;
        }
    });

    // Renderizar HTML
    let html = matchesFound.map(m => `
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
                <div><strong>${m.team1}</strong> vs <strong>${m.team2}</strong></div>
                <div>${m.score[0]} - ${m.score[1]}</div>
                <div><small>${m.league} | ${m.season} | ${m.date}</small></div>
            </div>
        </div>
    `).join('');

    // Resumen centrado y más grande debajo
    html += `
        <div class="text-center mt-3 p-3 rounded" style="
            background-color: #222;
            color: #fff;
            font-size: 1.5rem;
            font-weight: 700;
            display: inline-block;
            min-width: 220px;
        ">
            ${team1} ${team1Wins} | ${draws} | ${team2Wins} ${team2}
        </div>
    `;

    resultsContainer.innerHTML = html;
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', async () => {
    await initTeams();

    const team1Input = document.getElementById('search-team-1');
    const team2Input = document.getElementById('search-team-2');

    setupAutocomplete(team1Input, document.getElementById('team1-suggestions'));
    setupAutocomplete(team2Input, document.getElementById('team2-suggestions'));

    document.getElementById('search-match-btn').addEventListener('click', () => {
        const t1 = normalizeTeamName(team1Input.value.trim());
        const t2 = normalizeTeamName(team2Input.value.trim());

        if (!t1 || !t2) return alert('Please select both teams');
        searchMatches(t1, t2);
    });
});

// ---------- (Chart 2) ----------

let avgGoalsChart;

// Chart instance for goals per team
let goalsPerTeamChart;

// Function to load total goals scored by all teams
async function loadGoalsPerTeam() {
    const canvasContainer = document.getElementById('goalsPerTeam').parentElement;
    
    // Ensure the container has relative positioning and a fixed height
    canvasContainer.style.position = 'relative';
    canvasContainer.style.height = '400px'; // puedes ajustar
    
    // Show a loading spinner while data is being fetched
    canvasContainer.innerHTML += `
        <div id="goals-team-spinner" class="text-center my-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    const goalsMap = {}; // Object to accumulate total goals per team: { teamName: totalGoals }
    const leagueMapByTeam = {};  // Optional map to store the league of each team (useful for future coloring or filtering)

    // Loop through all seasons and leagues
    for (const season of seasons) {
        for (const league of leagues) {
            const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
            try {
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();
                const matches = data.matches || [];

                matches.forEach(match => {
                    if (!match.score || !match.score.ft) return;

                    const t1 = normalizeTeamName(match.team1);
                    const t2 = normalizeTeamName(match.team2);

                    const g1 = match.score.ft[0];
                    const g2 = match.score.ft[1];

                    goalsMap[t1] = (goalsMap[t1] || 0) + g1;
                    goalsMap[t2] = (goalsMap[t2] || 0) + g2;

                    // Guardamos liga de cada equipo
                    if (!leagueMapByTeam[t1]) leagueMapByTeam[t1] = leagueMap[league] || league;
                    if (!leagueMapByTeam[t2]) leagueMapByTeam[t2] = leagueMap[league] || league;
                });

            } catch(err) {
                console.error("Error loading goals:", err);
            }
        }
    }

    // Ordenar y coger top 10
    const topTeams = Object.entries(goalsMap)
        .sort((a,b) => b[1]-a[1])
        .slice(0,10);

    const labels = topTeams.map(t => t[0]);
    const values = topTeams.map(t => t[1]);

    // Render the bar chart
    renderGoalsPerTeamChart(labels, values);

    // Remove the loading spinner
    const spinner = document.getElementById('goals-team-spinner');
    if (spinner) spinner.remove();
}

function renderGoalsPerTeamChart(labels, values) {
    const ctx = document.getElementById('goalsPerTeam').getContext('2d');

    // Destroy the previous chart instance if it exists
    if (goalsPerTeamChart) goalsPerTeamChart.destroy();

    goalsPerTeamChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Goals Scored',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // importante para controlar altura
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { autoSkip: false } }
            }
        }
    });
}

// Initialize the chart when the page finishes loading
document.addEventListener('DOMContentLoaded', () => {
    loadGoalsPerTeam();
});

// ---------- (Chart 3) ----------

let mostConcededChart;

// Function to load the teams that have conceded the most goals
// and display the result in a doughnut chart
async function loadMostConcededTeams() {
    const ctx = document.getElementById('mostConcededChart').getContext('2d');

    // Show a loading spinner while data is being fetched
    ctx.canvas.parentElement.insertAdjacentHTML('beforeend', `
      <div id="conceded-spinner" class="text-center my-3">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `);

    // Map to store total goals conceded per team
    // Key: team name | Value: goals conceded
    const teamsMap = new Map();

    // Iterate through all seasons and leagues
    for (const season of seasons) {
        for (const league of leagues) {
            const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
            try {
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();
                const matches = data.matches || [];

                matches.forEach(match => {
                    const t1 = normalizeTeamName(match.team1);
                    const t2 = normalizeTeamName(match.team2);
                    const score = match.score?.ft;

                    if (!score) return;

                    if (!teamsMap.has(t1)) teamsMap.set(t1, 0);
                    if (!teamsMap.has(t2)) teamsMap.set(t2, 0);

                    teamsMap.set(t1, teamsMap.get(t1) + score[1]);
                    teamsMap.set(t2, teamsMap.get(t2) + score[0]);
                });
            } catch(err) {
                console.error("Error loading conceded goals:", err);
            }
        }
    }

    // Take the top 10 teams that conceded the most goals
    const topConceded = Array.from(teamsMap.entries())
        .map(([name, goalsAgainst]) => ({ name, goalsAgainst }))
        .sort((a,b) => b.goalsAgainst - a.goalsAgainst)
        .slice(0, 10);

    const labels = topConceded.map(t => t.name);
    const dataValues = topConceded.map(t => t.goalsAgainst);

    const backgroundColors = [
        '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF',
        '#FF9F40','#C9CBCF','#8AE234','#F44336','#2196F3'
    ];

    // Destroy previous chart instance if it exists
    if (mostConcededChart) mostConcededChart.destroy();

    // Create the doughnut chart
    mostConcededChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { size: 14 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const team = context.label;
                            const goals = context.raw;
                            return `${team}: ${goals} goals conceded`;
                        }
                    }
                }
            }
        }
    });

    // Remove the loading spinner once the chart is rendered
    const spinner = document.getElementById('conceded-spinner');
    if (spinner) spinner.remove();
}

// Initial call when the script loads
loadMostConcededTeams();

// ---------- (Chart 4) ----------

let goalsMonthChartH;

// fill leagues dropdown
leagues.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = leagueMap[l] || l;
    document.getElementById('league-select-h').appendChild(opt);
});

// When league changes, load available seasons
document.getElementById('league-select-h').addEventListener('change', async (e) => {
    const league = e.target.value;
    const seasonSelect = document.getElementById('season-select-h');
    seasonSelect.innerHTML = '';

    // Check which seasons exist for the selected league
    for (const season of seasons) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) continue;

        const option = document.createElement('option');
        option.value = season;
        option.textContent = season;
        seasonSelect.appendChild(option);
    } catch {}
    }

    // Load first available season or clear chart if none exist
    if (seasonSelect.options.length > 0) {
    seasonSelect.selectedIndex = 0;
    loadMonthBarChartH(league, seasonSelect.value);
    } else {
    clearMonthChartH();
    }
    });

// When season changes, reload chart
document.getElementById('season-select-h').addEventListener('change', (e) => {
    const league = document.getElementById('league-select-h').value;
    loadMonthBarChartH(league, e.target.value);
});

// Clear the chart (empty state)
function clearMonthChartH() {
    const ctx = document.getElementById('goalsMonthChartH').getContext('2d');
    // Destroy existing chart if present
    if (goalsMonthChartH) goalsMonthChartH.destroy();

    // Render empty chart
    goalsMonthChartH = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive:true, maintainAspectRatio:false }
    });
}

// Initialize chart with empty monthly structure
function initMonthChartH() {
    const ctx = document.getElementById('goalsMonthChartH').getContext('2d');
    if (goalsMonthChartH) goalsMonthChartH.destroy();

    goalsMonthChartH = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [{
                label: 'Goals',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { beginAtZero: true }, y: { ticks: { autoSkip: false } } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `Goals: ${ctx.raw}`
                    }
                }
            }
        }
    });
}

// Initialize chart on page load
document.addEventListener('DOMContentLoaded', () => {
    initMonthChartH();
});

// Load and render goals per month for a league + season
async function loadMonthBarChartH(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    const res = await fetch(url);

    // If data doesn't exist, reset chart
    if (!res.ok) return clearMonthChartH();

    const data = await res.json();
    const matches = data.matches;

    // Array to accumulate goals per month
    const monthGoals = Array(12).fill(0);
    matches.forEach(m => {
    if (m.score && m.score.ft && m.date) {
        const date = new Date(m.date);
        monthGoals[date.getMonth()] += m.score.ft[0] + m.score.ft[1];
    }
    });

    const ctx = document.getElementById('goalsMonthChartH').getContext('2d');
    if (goalsMonthChartH) goalsMonthChartH.destroy();

    // Create updated chart
    goalsMonthChartH = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
        label: `Goals in ${season}`,
        data: monthGoals,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
        }]
    },
    options: {
        indexAxis: 'y',  // gráfico horizontal
        responsive: true,
        maintainAspectRatio: false, // esencial
        layout: { padding: 10 },     // opcional, para que no se pegue a los bordes
        scales: {
        x: { beginAtZero: true },
        y: { ticks: { autoSkip: false } }
        },
        plugins: {
        tooltip: {
            callbacks: {
            label: ctx => `Goals: ${ctx.raw}`
            }
        }
        }
    }
    });

}

// References to filter elements
const leagueFilter = document.getElementById('league-filter');
const seasonFilter = document.getElementById('season-filter');
const teamFilter = document.getElementById('team-filter');
const applyBtn = document.getElementById('apply-filters-btn');

// Initialize league dropdown dynamically
function initLeagueFilter() {
    leagueFilter.innerHTML = '<option selected>All leagues</option>';

    leagues.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = leagueMap[l] || l;
        leagueFilter.appendChild(opt);
    });
}

// Load available seasons for a given league
async function loadSeasonsForLeague(league) {
    const availableSeasons = [];
    for (const season of seasons) {
        const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) availableSeasons.push(season);
        } catch {}
    }
    return availableSeasons;
}

// Load all teams for a specific league and season
async function loadTeamsForLeagueSeason(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        const matches = data.matches || [];

        const teamsSet = new Set();
        matches.forEach(m => {
            if (m.team1) teamsSet.add(m.team1);
            if (m.team2) teamsSet.add(m.team2);
        });

        return Array.from(teamsSet).sort();
    } catch (err) {
        console.error("Error loading teams:", err);
        return [];
    }
}

// When league changes, update available seasons
leagueFilter.addEventListener('change', async () => {
    const selectedLeague = leagueFilter.value;
    seasonFilter.innerHTML = '<option selected>All seasons</option>';
    teamFilter.innerHTML = '<option selected>All teams</option>';

    if (!selectedLeague || selectedLeague === 'All leagues') return;

    // Convert displayed league name back to code
    const leagueCode = Object.keys(leagueMap).find(k => leagueMap[k] === selectedLeague) || selectedLeague;
    const availableSeasons = await loadSeasonsForLeague(leagueCode);

    availableSeasons.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        seasonFilter.appendChild(opt);
    });
});

// When season changes, update available teams
seasonFilter.addEventListener('change', async () => {
    const selectedLeague = leagueFilter.value;
    const selectedSeason = seasonFilter.value;

    teamFilter.innerHTML = '<option selected>All teams</option>';
    if (!selectedLeague || !selectedSeason || selectedLeague === 'All leagues' || selectedSeason === 'All seasons') return;

    const leagueCode = Object.keys(leagueMap).find(k => leagueMap[k] === selectedLeague) || selectedLeague;
    const teams = await loadTeamsForLeagueSeason(leagueCode, selectedSeason);

    teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        teamFilter.appendChild(opt);
    });
});

// Calculate and display team statistics (KPIs)
async function showTeamStats(league, season, teamName) {
    const leagueCode = Object.keys(leagueMap).find(k => leagueMap[k] === league) || league;
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${leagueCode}.json`;

    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const matches = data.matches || [];

        // Initialize table object for all teams
        const table = {};
        matches.forEach(m => {
            const t1 = m.team1, t2 = m.team2;
            if (!t1 || !t2 || !m.score?.ft) return;

            const [g1, g2] = m.score.ft;

            // Initialize team stats if not present
            if (!table[t1]) table[t1] = { team: t1, wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0, points:0, matches:0 };
            if (!table[t2]) table[t2] = { team: t2, wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0, points:0, matches:0 };

            table[t1].goalsFor += g1;
            table[t1].goalsAgainst += g2;
            table[t1].matches++;

            table[t2].goalsFor += g2;
            table[t2].goalsAgainst += g1;
            table[t2].matches++;

            // Update wins, draws, losses, points
            if (g1 > g2) {
                table[t1].wins++; table[t1].points += 3;
                table[t2].losses++;
            } else if (g1 < g2) {
                table[t2].wins++; table[t2].points += 3;
                table[t1].losses++;
            } else {
                table[t1].draws++; table[t2].draws++;
                table[t1].points++; table[t2].points++;
            }
        });

        // Sort ranking by points, goal difference, goals scored
        const ranking = Object.values(table).sort((a,b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffA = a.goalsFor - a.goalsAgainst;
            const diffB = b.goalsFor - b.goalsAgainst;
            if (diffB !== diffA) return diffB - diffA;
            return b.goalsFor - a.goalsFor;
        });

        const teamStats = ranking.find(t => t.team === teamName);
        if (!teamStats) return alert("Team not found in this season.");

        const position = ranking.findIndex(t => t.team === teamName) + 1;

        // // Update KPIs in the HTML
        document.getElementById('kpi-position').textContent = position + "º";
        document.getElementById('kpi-wins').textContent = teamStats.wins;
        document.getElementById('kpi-draws').textContent = teamStats.draws;
        document.getElementById('kpi-losses').textContent = teamStats.losses;
        document.getElementById('kpi-points').textContent = teamStats.points;
        document.getElementById('kpi-goals-for').textContent = teamStats.goalsFor;
        document.getElementById('kpi-goals-against').textContent = teamStats.goalsAgainst;
        document.getElementById('kpi-goals-match').textContent = (teamStats.goalsFor / teamStats.matches).toFixed(2);

    } catch(err) {
        console.error("Error calculating stats:", err);
    }
}

// Apply button click event
applyBtn.addEventListener('click', () => {
    const league = leagueFilter.value;
    const season = seasonFilter.value;
    const team = teamFilter.value;

    if (!league || !season || !team || league === 'All leagues' || season === 'All seasons' || team === 'All teams') {
        return alert('Please select league, season, and team.');
    }

    showTeamStats(league, season, team);
});

// Reset button functionality
const resetBtn = document.getElementById('reset-filters-btn');

function resetFilters() {
    // Reset selects
    leagueFilter.selectedIndex = 0;
    seasonFilter.innerHTML = '<option selected>All seasons</option>';
    teamFilter.innerHTML = '<option selected>All teams</option>';

    // Reset KPIs
    document.getElementById('kpi-position').textContent = '-';
    document.getElementById('kpi-wins').textContent = '-';
    document.getElementById('kpi-draws').textContent = '-';
    document.getElementById('kpi-losses').textContent = '-';
    document.getElementById('kpi-points').textContent = '-';
    document.getElementById('kpi-goals-for').textContent = '-';
    document.getElementById('kpi-goals-against').textContent = '-';
    document.getElementById('kpi-goals-match').textContent = '-';
}

resetBtn.addEventListener('click', () => {
    resetFilters();
});

// Initialize league dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
    initLeagueFilter();
});

// Reset match search inputs and results
const resetMatchBtn = document.getElementById('reset-match-btn');

resetMatchBtn.addEventListener('click', () => {
    // Clear input fields
    document.getElementById('search-team-1').value = '';
    document.getElementById('search-team-2').value = '';
    
    // Clear autocomplete suggestions
    document.getElementById('team1-suggestions').innerHTML = '';
    document.getElementById('team2-suggestions').innerHTML = '';

    // Clear search results
    document.getElementById('match-search-results').innerHTML = '';
});
