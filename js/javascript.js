
// leagues
const leagues = ['es.1', 'es.2', 'en.1', 'it.1', 'de.1', 'fr.1', 'uefa.cl']
// seasons
const seasons = ['2025-26', '2024-25', '2023-24', '2022-23',
  '2021-22', '2020-21', '2019-20', '2018-19',
  '2017-18', '2016-17', '2015-16', '2014-15',
  '2013-14', '2012-13', '2011-12', '2010-11'];

let currentIndex = 0; // index of the first visible button
const pageSize = 5; // show five seasons in a row

const seasonPagination = document.getElementById("seasonPagination");
const seasonName = document.getElementById("seasonName");
const seasonContent = document.getElementById("seasonContent");

// load the content dynamically (AJAX)
function loadContent(url) {
    fetch(url)
    .then(response => response.text())
    .then(html => {
        document.getElementById('content').innerHTML = html;
    })
    .catch(err => console.error('Error loading the content:', err));
}

/*
// render the season buttons 
function renderPagination() {
    seasonPagination.innerHTML = "";

    // create the previous button
    const prevItem = document.createElement("li");
    prevItem.className = "page-item" + (currentIndex === 0 ? " disabled" : ""); // guess if the pagination is at the start
    prevItem.innerHTML = `<a class="page-link" href="#">«</a>`;
    prevItem.onclick = (e) => {
        e.preventDefault();
        if (currentIndex > 0) {
            currentIndex -= pageSize;
            renderPagination();
        }
    };
    seasonPagination.appendChild(prevItem);

    // create the season buttons (limit 5)
    const visibleSeasons = seasons.slice(currentIndex, currentIndex + pageSize); // returns a subarray from start (currentIndex) to end (currentIndex + 5)
    visibleSeasons.forEach(season => {
        const li = document.createElement("li");
        li.className = "page-item";
        li.innerHTML = `<a class="page-link" href="#">${season}</a>`;
        li.onclick = (e) => {
            e.preventDefault();
            loadSeason(season);
        };
        seasonPagination.appendChild(li);
    });

    // create the next button
    const nextItem = document.createElement("li");
    nextItem.className = "page-item" + (currentIndex + pageSize >= seasons.length ? " disabled" : ""); // guess if the pagination is at the end
    nextItem.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextItem.onclick = (e) => {
        e.preventDefault();
        if (currentIndex + pageSize < seasons.length) {
            currentIndex += pageSize;
            renderPagination();
        }
    };
    seasonPagination.appendChild(nextItem);
}

*/

// ---------- for each season ----------

function loadSeason(season) {
    seasonName.textContent = season;
    seasonContent.innerHTML = `<p>Content for season <strong>${season}</strong> goes here.</p>`;
}

//renderPagination();
//loadSeason(seasons[0]);

// lists the teams of each league
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

document.addEventListener("DOMContentLoaded", getTeams('es.2', '2025-26'))

// get the total amount of points per team
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

document.addEventListener("DOMContentLoaded", getPoints('es.1', '2024-25'))

// get the ranking
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


document.addEventListener("DOMContentLoaded", getLeagueTable('es.1', '2025-26').then(table => {
    renderTable(table);
}));


const container = document.getElementById("seasonContainer");

for (const season of seasons) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary btn-sm';
    btn.textContent = season;

    btn.onclick = () => {
        document.querySelectorAll('#seasonContainer .btn').forEach(b => b.classList.remove('btn-primary'));
        document.querySelectorAll('#seasonContainer .btn').forEach(b => b.classList.add('btn-outline-primary'));

        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary');

        loadSeason(season);
    }

    container.appendChild(btn);
}