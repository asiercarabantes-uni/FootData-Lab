
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

// ---------- for each season ----------

function loadSeason(season) {
    seasonName.textContent = season;
    seasonContent.innerHTML = `<p>Content for season <strong>${season}</strong> goes here.</p>`;
}

renderPagination();
loadSeason(seasons[0]);

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

// goals for, goals against and goal difference per team
function getGoals()  {

}

// wins, draws and losses per team
function getWDL() {

}
