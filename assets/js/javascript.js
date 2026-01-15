
// leagues
const leagues = ['es.1', 'es.2', 'en.1', 'it.1', 'de.1', 'fr.1']
// seasons
const seasons = ['2025-26', '2024-25', '2023-24', '2022-23',
  '2021-22', '2020-21', '2019-20', '2018-19',
  '2017-18', '2016-17', '2015-16', '2014-15'];

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
    'Arsenal FC': 'Arsenal'
}

const leagueMap = {
  'es.1': 'LaLiga EA Sports',
  'es.2': 'LaLiga Hypermotion',
  'en.1': 'Premier League',
  'it.1': 'Serie A',
  'de.1': 'Bundesliga',
  'fr.1': 'Ligue 1'
};

function normalizeTeamName(name) {
  return canonicalNames[name] || name;
}

// ---------- get the ranking ----------
async function getLeagueTable(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`No se pudo cargar ${season} ${league}`);
            return [];
        }

        const data = await res.json();
        const matches = data.matches;
        const teams = {};

        // recorre todos los partidos
        matches.forEach(match => {
            // ignorar partidos sin resultado
            if (!match.score || !match.score.ft) return;

            // asegurar que el objeto del equipo exista
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

            // actualizar diferencia de goles
            t1.goalDiff = t1.goalsFor - t1.goalsAgainst;
            t2.goalDiff = t2.goalsFor - t2.goalsAgainst;
        });

        // convertir a array y ordenar por puntos, diferencia de goles y goles a favor
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

function renderTable(table) {
    const container = document.getElementById("league_table");

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

// ---------- load all teams and display it dynamically ----------
async function loadAllTeams() {
    const teamsMap = new Map();

    for (const season of seasons) {
        for (const league of leagues) {
            const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Skipped ${season} ${league} (file not found)`);
                    continue;
                }

                const data = await response.json();

                const firstRound = data.matches.filter(
                    match => match.round && (match.round.includes('Matchday 1') || (match.round.includes('1. Round')))
                );

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

function createTeamCard(team) {

    const badges = team.leagues.map(league => `<span class="course-badge">${league}</span>`).join('');

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

let teams = [];
let filteredTeams = [];
const teamsPerPage = 10;
let currentPage = 1;
let totalPages = 1;

let searchInput;
const isTeamsPage = !!document.getElementById('teams-container'); // ejemplo

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('teams-container');
    searchInput = document.getElementById('searchInput'); // inicializamos aquí

    if (!container) return;

    // Spinner de carga
    container.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Cargar equipos
    teams = await loadAllTeams();

    teams.sort((a, b) => a.name.localeCompare(b.name));
    filteredTeams = [...teams];
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
    currentPage = 1;

    renderPage(1);

    // Listeners de filtros
    document.querySelectorAll('.filter-checkbox input')
        .forEach(cb => cb.addEventListener('change', onFilterChange));

    // Listener de búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});


function renderPage(pageNumber) {
    const container = document.getElementById('teams-container');
    container.innerHTML = '';

    const start = (pageNumber - 1) * teamsPerPage;
    const end = start + teamsPerPage;

    filteredTeams.slice(start, end).forEach(team => {
    container.innerHTML += createTeamCard(team);
    });

    currentPage = pageNumber;
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

    renderPagination();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function renderPagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const delta = 2; // cantidad de páginas a mostrar alrededor de la actual
    const range = [];
    const total = totalPages;

    // Siempre incluir 1 y total
    for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
    } else if (range[range.length - 1] !== '...') {
        range.push('...');
    }
    }

    // button back
    pagination.innerHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">
        <i class="bi bi-chevron-left"></i>
        </a>
    </li>
    `;

    // page buttons / ...
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

    // button next
    pagination.innerHTML += `
    <li class="page-item ${currentPage === total ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">
        <i class="bi bi-chevron-right"></i>
        </a>
    </li>
    `;

    // events
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

    const checkedLeagues = Array.from(
        document.querySelectorAll('.filter-checkbox input:checked')
    ).map(cb => cb.dataset.league);

    let filtered = [];
    if (!checkedLeagues || checkedLeagues.includes('all')) {
        filtered = [...teams];
    } else {
        filtered = teams.filter(team =>
            checkedLeagues.some(code => team.leagueCodes.includes(code))
        );
    }

    filteredTeams = filtered.filter(team =>
        team.name.toLowerCase().includes(query)
    );

    currentPage = 1;
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
    renderPage(1);
}

function onFilterChange(e) {

    if (!isTeamsPage) return;

    const allCheckbox = document.querySelector('input[data-league="all"]');
    const leagueCheckboxes = Array.from(
    document.querySelectorAll('.filter-checkbox input:not([data-league="all"])')
    );

    const checked = document.querySelectorAll('.filter-checkbox input:checked');

    if (checked.length === 0) {
        e.target.checked = true;
        return;
    }

    if (e.target.dataset.league === 'all' && e.target.checked) {
        leagueCheckboxes.forEach(cb => cb.checked = false);
    }

    if (e.target.dataset.league !== 'all' && e.target.checked) {
        allCheckbox.checked = false;
    }

    const anyLeagueChecked = leagueCheckboxes.some(cb => cb.checked);
    if (!anyLeagueChecked && !allCheckbox.checked) {
        allCheckbox.checked = true;
    }

    applyFilters();
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

const urlParams = new URLSearchParams(window.location.search);
const leagueId = urlParams.get('league');

const seasonSelect = document.getElementById("season-select");

async function seasonExists(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
    } catch {
        return false;
    }
}

async function loadSeasons(league) {
    seasonSelect.innerHTML = ""; // limpiar

    for (const season of seasons) {
        const exists = await seasonExists(league, season);
        if (exists) {
            const option = document.createElement("option");
            option.value = season;
            option.textContent = season;
            seasonSelect.appendChild(option);
        }
    }

    // Si hay al menos una temporada, cargar la primera
    if (seasonSelect.options.length > 0) {
        seasonSelect.selectedIndex = 0;
        loadLeague(seasonSelect.value);
    } else {
        document.getElementById("league_table").innerHTML = "<p>No hay temporadas disponibles.</p>";
    }
}

function renderLeagueHero(leagueCode) {
    const leagueNameEl = document.getElementById('league-name');
    const leagueDescEl = document.getElementById('league-desc');

    if (!leagueMap[leagueCode]) return;

    const leagueName = leagueMap[leagueCode];

    // Puedes definir un mapa de logos por liga
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

    const totalMatches = table.reduce((sum, team) => sum + team.played, 0) / 2; // cada partido contado dos veces
    const totalGoals = table.reduce((sum, team) => sum + team.goalsFor, 0);
    const avgGoals = (totalGoals / totalMatches).toFixed(2);
    const totalTeams = table.length;

    const topTeam = table[0].name; // ya está ordenado por puntos
    const mostWinDiff = table.reduce((max, team) => Math.max(max, team.goalDiff), 0);

    const cards = [
        { title: 'Matches Played', value: totalMatches, icon: 'bi bi-trophy', color: 'primary' },
        { title: 'Goals Scored', value: totalGoals, icon: 'bi bi-circle-fill', color: 'success' },
        { title: 'Average Goals', value: avgGoals, icon: 'bi bi-speedometer2', color: 'warning' },
        { title: 'Teams', value: totalTeams, icon: 'bi bi-people', color: 'info' },
        { title: 'Top Team', value: topTeam, icon: 'bi bi-star-fill', color: 'danger' },
        { title: 'Best Goal Diff', value: mostWinDiff, icon: 'bi bi-arrow-up-right-circle', color: 'secondary' }
    ];

    cards.forEach(card => {
        container.innerHTML += `
            <div class="col-md-3 col-sm-6">
                <div class="card summary-card text-center shadow-sm mb-4 border-0" style="transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;">
                    <div class="card-body bg-${card.color} text-white rounded">
                        <i class="${card.icon} display-4 mb-2"></i>
                        <h3 class="card-title mb-1">${card.value}</h3>
                        <p class="card-text">${card.title}</p>
                    </div>
                </div>
            </div>
        `;
    });

    // Hover efecto
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

    // Mostramos spinner mientras cargamos
    const container = document.getElementById('league_table');
    container.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    renderLeagueHero(leagueId);

    const table = await getLeagueTable(leagueId, season);

    if (table && table.length > 0) {
        renderTable(table);
        renderSummaryCards(table);
    } else {
        container.innerHTML = "<p>No data available for this season.</p>";
        document.getElementById('summary-cards').innerHTML = '';
    }
}

if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
        loadLeague(seasonSelect.value);
    });
}

if (leagueId && seasonSelect) {
    loadSeasons(leagueId);
}

// ---------- goals per season chart ----------

let goalsSeasonChart;

const leagueSelectChart = document.getElementById("season-select-chart");
const spinner = document.getElementById('goals-spinner');

// Llenar con ligas
leagues.forEach(l => {
    const option = document.createElement("option");
    option.value = l;
    option.textContent = leagueMap[l] || l;
    leagueSelectChart.appendChild(option);
});

// --- Función para cargar goles por temporada ---
async function loadGoalsPerSeasonLine(league) {
    if (!league) {
        renderGoalsChartEmpty();
        return;
    }

    spinner.style.display = 'block';

    const labels = [];
    const values = [];

    const fetchPromises = seasons.map(async season => {
        const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
        try {
            const res = await fetch(url);
            if (!res.ok) return null;

            const data = await res.json();
            const matches = data.matches || [];

            let totalGoals = 0;
            matches.forEach(m => {
                if (m.score && m.score.ft) totalGoals += m.score.ft[0] + m.score.ft[1];
            });

            if (totalGoals > 0) return { season, totalGoals };
            return null;
        } catch {
            return null;
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

    // Ajuste para alta resolución (retina)
    const displayWidth = 600;  // ancho visible en pantalla
    const displayHeight = 300; // alto visible en pantalla
    const ratio = window.devicePixelRatio || 1;

    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // escalar todo al ratio correcto

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


// --- Función para gráfico vacío ---
function renderGoalsChartEmpty() {
    renderGoalsChartLine([], []);
}

// --- Listener dropdown ---
leagueSelectChart.addEventListener('change', () => {
    loadGoalsPerSeasonLine(leagueSelectChart.value);
});

// --- Inicializar vacío por defecto ---
leagueSelectChart.selectedIndex = 0;
renderGoalsChartEmpty();


// ---------- match search ----------
let allTeams = [];

// --- Inicializar equipos ---
async function initTeams() {
    allTeams = await loadAllTeams(); // tu función existente
}

// --- Autocompletado de equipos ---
function setupAutocomplete(inputEl, suggestionsEl) {
    inputEl.addEventListener('input', () => {
        const val = inputEl.value.toLowerCase();
        suggestionsEl.innerHTML = '';

        if (!val) return;

        const matches = allTeams
            .map(t => t.name)
            .filter(name => name.toLowerCase().includes(val))
            .slice(0, 10);

        matches.forEach(name => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action';
            item.textContent = name;
            item.addEventListener('click', () => {
                inputEl.value = name;
                suggestionsEl.innerHTML = '';
            });
            suggestionsEl.appendChild(item);
        });
    });

    inputEl.addEventListener('blur', () => {
        setTimeout(() => { suggestionsEl.innerHTML = ''; }, 100);
    });
}

// Ejemplo de uso:
setupAutocomplete(
    document.getElementById('search-team-1'),
    document.getElementById('search-team-1-suggestions')
);
setupAutocomplete(
    document.getElementById('search-team-2'),
    document.getElementById('search-team-2-suggestions')
);

// --- Buscar partidos entre dos equipos ---
async function searchMatches(team1, team2) {
    const resultsContainer = document.getElementById('match-search-results');
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

let avgGoalsChart;

// Función para cargar los goles totales de todos los equipos
let goalsPerTeamChart;

async function loadGoalsPerTeam() {
    const canvasContainer = document.getElementById('goalsPerTeam').parentElement;
    
    // Aseguramos que el contenedor tenga posición relativa y altura
    canvasContainer.style.position = 'relative';
    canvasContainer.style.height = '400px'; // puedes ajustar
    
    // Mostrar spinner mientras carga
    canvasContainer.innerHTML += `
        <div id="goals-team-spinner" class="text-center my-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    const goalsMap = {}; // { teamName: totalGoals }
    const leagueMapByTeam = {}; // opcional para colorear por liga después

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

    renderGoalsPerTeamChart(labels, values);

    // Quitar spinner
    const spinner = document.getElementById('goals-team-spinner');
    if (spinner) spinner.remove();
}

function renderGoalsPerTeamChart(labels, values) {
    const ctx = document.getElementById('goalsPerTeam').getContext('2d');

    // Destruir si ya existía
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

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadGoalsPerTeam();
});

let mostConcededChart;

// Función para cargar los equipos más goleados y mostrar un donut
async function loadMostConcededTeams() {
    const ctx = document.getElementById('mostConcededChart').getContext('2d');

    // Spinner mientras carga
    ctx.canvas.parentElement.insertAdjacentHTML('beforeend', `
      <div id="conceded-spinner" class="text-center my-3">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `);

    const teamsMap = new Map();

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

    // Tomamos los 10 más goleados
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

    if (mostConcededChart) mostConcededChart.destroy();

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

    const spinner = document.getElementById('conceded-spinner');
    if (spinner) spinner.remove();
}

// Llamada inicial
loadMostConcededTeams();

let goalsMonthChartH;

// Rellenar dropdown de ligas
leagues.forEach(l => {
  const opt = document.createElement('option');
  opt.value = l;
  opt.textContent = leagueMap[l] || l;
  document.getElementById('league-select-h').appendChild(opt);
});

// Cuando cambie liga, cargar temporadas disponibles
document.getElementById('league-select-h').addEventListener('change', async (e) => {
  const league = e.target.value;
  const seasonSelect = document.getElementById('season-select-h');
  seasonSelect.innerHTML = '';

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

  if (seasonSelect.options.length > 0) {
    seasonSelect.selectedIndex = 0;
    loadMonthBarChartH(league, seasonSelect.value);
  } else {
    clearMonthChartH();
  }
});

// Cambio de temporada
document.getElementById('season-select-h').addEventListener('change', (e) => {
  const league = document.getElementById('league-select-h').value;
  loadMonthBarChartH(league, e.target.value);
});

// Limpiar gráfico
function clearMonthChartH() {
  const ctx = document.getElementById('goalsMonthChartH').getContext('2d');
  if (goalsMonthChartH) goalsMonthChartH.destroy();
  goalsMonthChartH = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

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

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initMonthChartH();
});

// Cargar gráfico horizontal
async function loadMonthBarChartH(league, season) {
  const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
  const res = await fetch(url);
  if (!res.ok) return clearMonthChartH();

  const data = await res.json();
  const matches = data.matches;

  const monthGoals = Array(12).fill(0);
  matches.forEach(m => {
    if (m.score && m.score.ft && m.date) {
      const date = new Date(m.date);
      monthGoals[date.getMonth()] += m.score.ft[0] + m.score.ft[1];
    }
  });

    const ctx = document.getElementById('goalsMonthChartH').getContext('2d');
    if (goalsMonthChartH) goalsMonthChartH.destroy();

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

// Referencias a los elementos
const leagueFilter = document.getElementById('league-filter');
const seasonFilter = document.getElementById('season-filter');
const teamFilter = document.getElementById('team-filter');
const applyBtn = document.getElementById('apply-filters-btn');

// --- Inicialización dinámica de ligas ---
function initLeagueFilter() {
    leagueFilter.innerHTML = '<option selected>All leagues</option>';

    leagues.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = leagueMap[l] || l;
        leagueFilter.appendChild(opt);
    });
}

// --- Cargar temporadas disponibles para una liga ---
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

// --- Cargar equipos de una liga y temporada ---
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

// --- Cuando cambie liga ---
leagueFilter.addEventListener('change', async () => {
    const selectedLeague = leagueFilter.value;
    seasonFilter.innerHTML = '<option selected>All seasons</option>';
    teamFilter.innerHTML = '<option selected>All teams</option>';

    if (!selectedLeague || selectedLeague === 'All leagues') return;

    const leagueCode = Object.keys(leagueMap).find(k => leagueMap[k] === selectedLeague) || selectedLeague;
    const availableSeasons = await loadSeasonsForLeague(leagueCode);

    availableSeasons.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        seasonFilter.appendChild(opt);
    });
});

// --- Cuando cambie temporada ---
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

// --- Calcular y mostrar estadísticas ---
async function showTeamStats(league, season, teamName) {
    const leagueCode = Object.keys(leagueMap).find(k => leagueMap[k] === league) || league;
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${leagueCode}.json`;

    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const matches = data.matches || [];

        // Inicializar tabla de clasificación
        const table = {};
        matches.forEach(m => {
            const t1 = m.team1, t2 = m.team2;
            if (!t1 || !t2 || !m.score?.ft) return;

            const [g1, g2] = m.score.ft;

            if (!table[t1]) table[t1] = { team: t1, wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0, points:0, matches:0 };
            if (!table[t2]) table[t2] = { team: t2, wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0, points:0, matches:0 };

            table[t1].goalsFor += g1;
            table[t1].goalsAgainst += g2;
            table[t1].matches++;

            table[t2].goalsFor += g2;
            table[t2].goalsAgainst += g1;
            table[t2].matches++;

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

        // Ordenar por puntos, diferencia de goles, goles a favor
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

        // Actualizar KPIs
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

// --- Botón aplicar filtros ---
applyBtn.addEventListener('click', () => {
    const league = leagueFilter.value;
    const season = seasonFilter.value;
    const team = teamFilter.value;

    if (!league || !season || !team || league === 'All leagues' || season === 'All seasons' || team === 'All teams') {
        return alert('Please select league, season, and team.');
    }

    showTeamStats(league, season, team);
});

const resetBtn = document.getElementById('reset-filters-btn');

function resetFilters() {
    // Resetear selects
    leagueFilter.selectedIndex = 0;
    seasonFilter.innerHTML = '<option selected>All seasons</option>';
    teamFilter.innerHTML = '<option selected>All teams</option>';

    // Resetear KPIs
    document.getElementById('kpi-position').textContent = '-';
    document.getElementById('kpi-wins').textContent = '-';
    document.getElementById('kpi-draws').textContent = '-';
    document.getElementById('kpi-losses').textContent = '-';
    document.getElementById('kpi-points').textContent = '-';
    document.getElementById('kpi-goals-for').textContent = '-';
    document.getElementById('kpi-goals-against').textContent = '-';
    document.getElementById('kpi-goals-match').textContent = '-';
}

// Evento click del botón reset
resetBtn.addEventListener('click', () => {
    resetFilters();
});

// --- Inicializar al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    initLeagueFilter();
});

const resetMatchBtn = document.getElementById('reset-match-btn');

resetMatchBtn.addEventListener('click', () => {
    // Limpiar inputs
    document.getElementById('search-team-1').value = '';
    document.getElementById('search-team-2').value = '';
    
    // Limpiar sugerencias
    document.getElementById('team1-suggestions').innerHTML = '';
    document.getElementById('team2-suggestions').innerHTML = '';

    // Limpiar resultados
    document.getElementById('match-search-results').innerHTML = '';
});
