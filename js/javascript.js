
// load the content dynamically
function loadContent(url) {
    fetch(url)
    .then(response => response.text())
    .then(html => {
        document.getElementById('content').innerHTML = html;
    })
    .catch(err => console.error('Error loading the content:', err));
}

// lists the teams of each league
function listTeams(league, year) {
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${year}/${league}.json`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        const matches = data.matches;
        //console.log(matches);
        const teamsSet = new Set();
        for (const match of matches) {
            if((match.round === "1. Round") || (match.round === "Matchday 1")) { // (loop once per league (round 1 / matchday 1) is enough)
                teamsSet.add(match.team1);
                teamsSet.add(match.team2);
            } else break;
        }
        console.log(teamsSet);
    })
    .catch(err => console.error('Error loading the content:', err));
}

// get the total amount of points in the league
function sumPoints() {
    
}

// goals for, goals against and goal difference
function goalsPerTeam()  {

}

// wins, draws and losses