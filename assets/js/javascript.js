
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
    'Wolverhampton Wanderers': 'Wolves'
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

async function loadLeague(season) {
    if (!leagueId) return;
    const table = await getLeagueTable(leagueId, season);
    if (table) renderTable(table);
}

if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
        loadLeague(seasonSelect.value);
    });
}

if (leagueId && seasonSelect) {
    loadSeasons(leagueId);
}