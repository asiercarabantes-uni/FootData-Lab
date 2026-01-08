
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
    'Norwich City FC': 'Norwich City'
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

// ---------- list the team of each league ----------
async function getTeams(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    
    try {
        const res = await(fetch(url));
        const data = await(res.json());
        //console.log(data);

        const matches = data.matches;
        //console.log(matches);
        const teamsSet = new Set();

        for(const match of matches) {
            if((match.round === "1. Round") || (match.round === "Matchday 1")) { // (loop once per league (round 1 / matchday 1) is enough)
                teamsSet.add(match.team1);
                teamsSet.add(match.team2);
            } else break;
        }
        console.log(teamsSet);
        return teamsSet;
    } catch (err) {
        console.error("Error loading teams:", err);
    }
}

//document.addEventListener("DOMContentLoaded", getTeams('es.2', '2025-26'))

// ---------- get the total amount of points per team ----------
async function getPoints(league, season) {
    const teamsSet = await getTeams(league, season);
    //console.log(teamsSet);
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    
    try {
        const res = await(fetch(url))
        const data = await(res.json())
        //console.log(data);
        
        const matches = data.matches;
        // console.log(matches);

        const points = {};
        teamsSet.forEach(team => points[team] = 0);
        
        for(const match of matches) {
            if (!match.score || !match.score.ft) continue;
            const g1 = match.score.ft[0];
            const g2 = match.score.ft[1];

            const team1 = match.team1;
            const team2 = match.team2;

            if(g1 > g2) points[team1] += 3;
            else if(g1 < g2) points[team2] += 3;
            else {
                points[team1] += 1;
                points[team2] += 1;
            }
        }
        console.log(points);
    } catch (err) {
        console.error("Error loading points:", err);
    }
}

//document.addEventListener("DOMContentLoaded", getPoints('es.1', '2024-25'))

// ---------- get the ranking ----------
async function getLeagueTable(league, season) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;

    try {
        const res = await(fetch(url))
        const data = await(res.json())
        
        const matches = data.matches;
        console.log(matches)
        const teams = {};

        // create an object per team
        matches.forEach(match => {
            if ((match.round === "1.Round") || (match.round === "Matchday 1")) { // (loop once per league (round 1 / matchday 1) is enough)
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
        });

        // get stats
        matches.forEach(match => {
            if (!match.score.ft) return; // if the match has not been played yet...

            // get the final score
            const g1 = match.score.ft[0];
            const g2 = match.score.ft[1];

            // get the teams
            const t1 = teams[match.team1];
            const t2 = teams[match.team2];

            // update matches played
            t1.played++;
            t2.played++;

            // update goals for and goals against
            t1.goalsFor += g1;
            t1.goalsAgainst += g2;
            t2.goalsFor += g2;
            t2.goalsAgainst += g1;

            // update wins, losses, draws and poins
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

            // update difference of goals
            t1.goalDiff = t1.goalsFor - t1.goalsAgainst;
            t2.goalDiff = t2.goalsFor - t2.goalsAgainst;
        });

        // convert to an array and order
        const table = Object.values(teams).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
        });

        console.log(table);
        return table;

    } catch (err) {
        console.error("Error loading stats: ", err)
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

// document.addEventListener("DOMContentLoaded", getLeagueTable('es.1', '2025-26').then(table => {
//     renderTable(table);
// }));

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
    console.log(teamsMap);
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
const teamsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let teams = [];

async function initTeams() {
    teams = await loadAllTeams();

    teams.sort((a, b) => a.name.localeCompare(b.name));

    filteredTeams = [...teams]; // por defecto todas
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

    renderPage(1);
}

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

initTeams();

// ---------- teams filters ----------

document.querySelectorAll('.filter-checkbox input')
    .forEach(cb => cb.addEventListener('change', onFilterChange));

function onFilterChange(e) {
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

function applyFilters() {
    const checkedLeagues = Array.from(
        document.querySelectorAll('.filter-checkbox input:checked')
    ).map(cb => cb.dataset.league);

    if (checkedLeagues.includes('all')) {
        filteredTeams = [...teams];
    } else {
    filteredTeams = teams.filter(team =>
        checkedLeagues.some(code => team.leagueCodes.includes(code))
    );
    }

    currentPage = 1;
    totalPages = Math.ceil(filteredTeams.length / teamsPerPage);
    renderPage(1);
}


