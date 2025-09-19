/*jslint node: true */
/*jslint plusplus: true */
/*jslint white: true */
/*jslint browser: true */

"use strict";

// Setup variables used throughout
var teamlist = []; // Array of Records, one per team in the division.
var winner   = []; // INDEX: Playoff Match Number. Holds winning team number for each playoff match
var loser    = []; // INDEX: Playoff Match Number. Holds losing team number for each playoff match
var dates    = []; // new Array();

//
// FUNCTION: getTeamNum <team>
// PARM    : team
//             "Sn"       -- Indicates Playoff Seed Number
//             "Wxx"      -- Indicates WINNER of playoff match #xx
//             "Winnerxx" -- Indicates WINNER of playoff match #xx
//             "Lxx"      -- Indicates LOSER  of playoff match #xx
//             "Loserxx"  -- Indicates LOSER  of playoff match #xx
//             <n>        -- Team Number in regular season.  Returned as-is.
// PURPOSE : Return team number (1-N) for <team>
//           For "Sn", looks up in [seeds] array
//           For "Wxx", looks up in [winner] array
//           For "Lxx", looks up in [loser] array
//
function getTeamNum(team) {
	if ((typeof team) === "number") {
		// Team number specified, just return it
		return team;
	}

	// Otherwise, a string with one or two digits at the end.
	var digitCount;
	if (isNaN(team.substring(team.length-2,team.length-1))) {
		digitCount = 1;
	} else {
		digitCount = 2;
	}

	var label = team.substring(0,team.length-digitCount);
	var num   = team.substring(team.length-digitCount,team.length);

	if (label === "S" || label === "Seed") {
		return seeds[num-1];
	}
	
	if (label === "W" || label === "Winner") {
		return winner[num];
	}

	if (label === "L" || label === "Loser") {
		return loser[num];
	}
	
	alert("Unknown label for team <" + team + "> = " + label);
	return team;
} // getTeamNum()

// -------------------------------------------------------------

//
// FUNCTION: getTeamName <team> <plain>
// PARM    : team (see getTeamNum() above)
//           plain    -- optional.  Any string will cause the team name
//                       to NOT be enclosed in HTML formatting tags.
// PURPOSE : Return HTML string for name of <team> using [teamlist] array.
//           If team number for team is not identified (e.g., "W10" specified
//           but 10th match not yet played, so "W10" lookup in [winner] 
//           array returns 0), return the input string (e.g., "W10").
// DEFAULT : Returned string will be enclosed in HTML formatting tags.
//
function getTeamName(team, plain) {
	var t = getTeamNum(team);
	var bold1   = "<b>";
	var bold2   = "</b>";
	var italic1 = "<i>";
	var italic2 = "</i>";
	if (plain !== undefined) {
		bold1   = "";
		bold2   = "";
		// italic1 = "";
		// italic2 = "";
	}
	if (isNaN(t)) {
		t = italic1 + team + italic2;
	} else if (t>0) {
		t = bold1 + teamlist[t-1].name + bold2;
	} else {
		// Handle playoff not completed (getTeamNum() = 0)
		t = italic1 + team + italic2;;
	}
	return t;
} // getTeamName()

// -------------------------------------------------------------

//
// FUNCTION: setWins
// PARM    : match
// PURPOSE : Record match results in the match.winCount & match.lossCount
//           fields.  As well, record results in the winner[] & loser[] arrays
//
function setWins(match) {
	match.winCount = 0;
	match.lossCount = 0;
	for (var g=0; g<match.games.length; g++) {
		if (match.games[g].scores != null) {
			if (match.games[g].scores[0] > match.games[g].scores[1]) {
				match.winCount++;
			} else {
				match.lossCount++;
			}
		}
	}

	if (match.winCount >= 2 || match.lossCount >= 2) {
		if (match.winCount > match.lossCount) {
			winner[match.num] = getTeamNum(match.teams[0]);
			loser[match.num] = getTeamNum(match.teams[1]);
		} else {
			winner[match.num] = getTeamNum(match.teams[1]);
			loser[match.num] = getTeamNum(match.teams[0]);
		}
	} else {
		// Handle playoff not completed -- team number = 0
		winner[match.num] = 0;
		loser[match.num] = 0;
	}
} // setWins()

// -------------------------------------------------------------

function boldScore(score1, score2) {
	if (score1 > score2) { document.write("<b>"); }
	if (score1 < 10)     { document.write("0"); }
	document.write(score1);
	if (score1 > score2) { document.write("</b>"); }
	document.write("-");
	if (score1 < score2) { document.write("<b>"); }
	if (score2 < 10)     { document.write("0"); }
	document.write(score2);
	if (score1 < score2) { document.write("</b>"); }
} // boldScore()

// -------------------------------------------------------------

function computeRecord() {
	if (!teamlist[0]) {
		// Reset indices to start at 0 because Javascript's "sort"
		// will eventually do the same thing.
		teamlist = teamlist.filter(function(val){return val;});
	}

	for (var d=0; d<dates.length; d++) {
		if (!dates[d].playoffs) {
			for (var m=0; m<dates[d].matches.length; m++) {
				var match = dates[d].matches[m];
				for (var g=0; g<match.games.length; g++) {
					var game = match.games[g];
					if (game.scores != null) {
						var winTeamNum;
						var loseTeamNum;
						if (game.scores[0] > game.scores[1]) {
							winTeamNum = match.teams[0];
							loseTeamNum = match.teams[1];
						} else {
							winTeamNum = match.teams[1];
							loseTeamNum = match.teams[0];
						}
						teamlist[winTeamNum-1].wins++;
						teamlist[loseTeamNum-1].losses++;
					}
				}
			}
		}
	}
} // computeRecord()

// -------------------------------------------------------------

var teamTieBreakerInfo; // GLOBAL ARRAY.  INDEX: 1-n

function writeStandings(level) {
	//============================================
	// Standings Table
	//============================================
	teamTieBreakerInfo = ["","","","","","","","",""]; // [0] not used, [1-8] team numbers
	teamlist.sort(compareTwoTeams); // compare function, see below; updates teamTieBreakerInfo[] above
	for (var t=0; t<teamlist.length; t++) {
		var tieBreakerTag = "";
		var N = teamlist[t].num; // Shorthand team number for below
		if (teamTieBreakerInfo[N].length) {
			var lines = teamTieBreakerInfo[N].includes("<br>") ? 5 : 3;
			var STYLE = "<style>" + 
			  " .showTieBreaker"   + N + " { position:relative; font-weight:bold; font-size:65%; color:white; background:rgba(224,32,32,1.00); }" + 
			  " .hiddenTieBreaker" + N + " { position:absolute; width:30em; height:" + lines + "em; font-size:65%; color:white; background:rgba(32,108,160,1.00); font-style:italic; visibility:visible; display:none; }" +
			  " .showTieBreaker"   + N + ":hover + .hiddenTieBreaker" + N + " { visibility:visible; display:block; z-index:10; }" +
			  "</style>";
			document.write(STYLE);

			tieBreakerTag =  "&nbsp;<span class='showTieBreaker" + N + "'><a ref=''> <u>TIED</u>&nbsp;</a></span>";
			tieBreakerTag += "<span class='hiddenTieBreaker" + N + "'><p>" + teamTieBreakerInfo[N] + "</p></span>";
			// console.log ("Tag: " + tieBreakerTag);
			// console.log ("Style: " + STYLE);
		}
		var nicknameTag = teamlist[t].nickname ? " <span class='nickname'>" + teamlist[t].nickname + " </span>" : "";

		document.write("<tr>");
		document.write("<td align='center'>" + teamlist[t].num + "</td>");
		document.write("<td><div><a href='roster" + level + ".html'>" + teamlist[t].name + "</a>" + nicknameTag + tieBreakerTag + "</div></td>");
		document.write("<td align='center'>" + teamlist[t].wins + "</td>");
		document.write("<td align='center'>" + teamlist[t].losses + "</td>");
		document.write("</tr>");
	}
} // writeStandings()

// -------------------------------------------------------------

//
// FUNCTION : compareTwoTeams
// PARM     : a & b -- teamlist[] elements
// PURPOSE  : Used as compare function in writeStandings().
//            Negative return value ==> team a is lower  than team b
//            Positive return value ==> team a is higher than team b
//            Zero     return value ==> team a is the same as team b
// ALGORITHM: 1. Team with higher overall wins sorts toward end of list.
//            2. If wins are identical, compare teams head-to-head
//               record.  Team with higher number of wins head-to-head
//               sorts toward end of list.
//            3. If head-to-head wins are identical, compare teams'
//               head-to-head for game scores.  Team with higher game
//               scores head-to-head sorts toward end of list.
//            4. If head-to-head points are identical, compare teams'
//               points differential (points for each game minus the
//               opposing team's points across all matches/games)
//            5. If points differentials are identical, compare teams'
//               overall points (points for each game across all
//               matches/games)
//
// EXCEPTION: If there is a circular condition in head-to-head
//            matches (team A beat team B & team B beat team C &
//            team C beat team A), the final order among them is
//            indeterminate -- it is based on the sort algorithm that
//            invokes this function.  AS WELL, other teams' rankings
//            may seem skewed because their matchups with the teams
//            in the circular condition may be decided by other
//            factors (overall points, for example).
//
function compareTwoTeams(a, b) {
	// Start of season -- no wins/losses, so keep order as-is
	if (a.wins + a.losses == 0) {
		return 0;
	}

	// Return negative if a has more overall game wins than b
	// (this presumes both teams played the same number of games)
	if (a.wins != b.wins) {
		return b.wins - a.wins;
	}
	
	// When teams have the same number of wins, we need to break the tie.  If no
	// head-to-head matches, then use total points scored so far.  Otherwise,
	// check head-to-head matches to determine who has the most wins.  If that
	// doesn't resolve the tie, use head-to-head match scores to identify who
	// has the most points.  If that doesn't resolve the tie, use overall total
	// points.

	var aH2HWins    = 0;
	var bH2HWins    = 0;
	var aH2HPoints  = 0; 
	var bH2HPoints  = 0;
	var aPointDiff  = 0;
	var bPointDiff  = 0;
	var aPointTotal = 0;
	var bPointTotal = 0;
	var aIndex;
	var bIndex;

	var tieBreakerInfoA = "";
	var tieBreakerInfoB = "";

	console.log("TIE: Team " + a.num + " (" + a.name + ") vs Team " + b.num + " (" + b.name + ")");

	for (var d=0; d<dates.length; d++) { // ALL dates that are not playoffs
		if (!dates[d].playoffs) {
			for (var m=0; m<dates[d].matches.length; m++) { // ALL matches on this date
				var match = dates[d].matches[m];
				if ((match.teams) ? (match.games[0].scores != null) : false) {
					// Match scores were recorded, proceed with reviewing games in this match
					aIndex = (match.teams[0] == a.num) ? 0 : (match.teams[1] == a.num) ? 1 : -1;
					bIndex = (match.teams[0] == b.num) ? 0 : (match.teams[1] == b.num) ? 1 : -1;

					for (var g=0; g<match.games.length; g++) { // ALL games in this match
						var game = match.games[g];
						if (aIndex >= 0) { aPointTotal += game.scores[aIndex]; aPointDiff += game.scores[aIndex] - game.scores[1-aIndex]; }
						if (bIndex >= 0) { bPointTotal += game.scores[bIndex]; bPointDiff += game.scores[bIndex] - game.scores[1-bIndex]; }

						if (aIndex + bIndex == 1) {
							// Head-to-head match found
							if (game.scores[aIndex] > game.scores[bIndex]) {
								aH2HWins++;
							} else {
								bH2HWins++;
							}
							aH2HPoints += game.scores[aIndex];
							bH2HPoints += game.scores[bIndex];
						} // head-to-head match found
					} // for g (ALL games in match m)
				} // teams exist for this match & scores were recorded
			} // for m (ALL matches on this date)
		} // if NOT playoffs
	} // for d (ALL dates)

	console.log("     H2HWins (" + aH2HWins + " vs " + bH2HWins + "). " +
	            "H2HPoints (" + aH2HPoints + " vs " + bH2HPoints + ")" + ". PointDiff (" + aPointDiff + " vs " + bPointDiff + ").");

	// Any head-to-head matches for these two teams?
	if ((aH2HWins+bH2HWins) > 0) {
		// For the 'a' team, ensure we didn't already include the "versus" info for team 'b'
		if (teamTieBreakerInfo[a.num].indexOf("vs " + teamlist[b.num-1].name + ": ") == -1) {
			teamTieBreakerInfo[a.num] = "vs " + teamlist[b.num-1].name + ": " + aH2HWins + "-" + bH2HWins + " games, " + aH2HPoints + "-" + bH2HPoints + " pts" +
			                            ((teamTieBreakerInfo[a.num].length) ? "<br>" : "") + teamTieBreakerInfo[a.num];
		}

		// For the 'b' team, ensure we didn't already include the "versus" info for team 'a'
		if (teamTieBreakerInfo[b.num].indexOf("vs " + teamlist[a.num-1].name + ": ") == -1) {
			teamTieBreakerInfo[b.num] = "vs " + teamlist[a.num-1].name + ": " + bH2HWins + "-" + aH2HWins + " games, " + bH2HPoints + "-" + aH2HPoints + " pts" +
                                     ((teamTieBreakerInfo[b.num].length) ? "<br>" : "") + teamTieBreakerInfo[b.num];
		}
	}

	// Head to head record overall game wins
	if (aH2HWins != bH2HWins) {
		return bH2HWins - aH2HWins;
	}

	// Head to head record overall points
	if (aH2HPoints != bH2HPoints) {
		return bH2HPoints - aH2HPoints;
	}

	if (teamTieBreakerInfo[a.num].indexOf("ALL MATCHES") == -1) {
		teamTieBreakerInfo[a.num] += ((teamTieBreakerInfo[a.num].length) ? "<br>" : "") + 
		                             "<u>ALL MATCHES</u>: " + aPointDiff + " pt diff, "  + aPointTotal + " total pts" ;
	}

	if (teamTieBreakerInfo[b.num].indexOf("ALL MATCHES") == -1) {
		teamTieBreakerInfo[b.num] += ((teamTieBreakerInfo[b.num].length) ? "<br>" : "") + 
		                             "<u>ALL MATCHES</u>: " + bPointDiff + " pt diff, "  + bPointTotal + " total pts" ;
	}

	// Point differential comparison
	if (aPointDiff != bPointDiff) {
		return bPointDiff - aPointDiff;
	}

	// Overall points comparison
	console.log("     Total Points " + aPointTotal + " vs " + bPointTotal);
	return bPointTotal - aPointTotal;
} // compareTwoTeams()

// -------------------------------------------------------------

function writeScheduleTable() {
	//============================================
	// Schedule Table (REGULAR SEASON)
	//============================================
	// Sort on team number
	teamlist.sort(function(a,b) {return a.num - b.num;});

	var unplayedWeek = 0;

	document.write("<tr>");
	document.write("<th>Date</th>");
	document.write("<th>Time</th>");
	document.write("<th>Court</th>");
	document.write("<th>Match</th>");
	document.write("</tr>");
	for (var d=0; d<playdates.length; d++) {

		var rowid = "";
		if ((dates[d].matches[0].winCount === undefined)) {
			if ( ++unplayedWeek == 1 ) {
				rowid = "id='next'"; // See bsdstyle.css -- gets bold text
			}
		}

		document.write("<tr " + rowid + ">");

		document.write("<td>");
		document.write(dates[d].date);
		document.write("</td>");

		document.write("<td>");
		if (dates[d].playoffs) {
			document.write("&nbsp;");
		} else {
			// console.log (d + " (" + dates[d].date + "): matches=" + dates[d].matches.length);
			for (var m=0; m<dates[d].matches.length-1; m++) {
				document.write(dates[d].matches[m].time + "<br/>");
			}
		}
		document.write("</td>");

		document.write("<td>");
		if (dates[d].playoffs) {
			document.write("&nbsp;");
		} else {
			for (var m=0; m<dates[d].matches.length-1; m++) {
				document.write(dates[d].matches[m].court + "<br/>");
			}
		}
		document.write("</td>");

		document.write("<td>");
		if (dates[d].playoffs) {
			document.write("Playoffs");
		} else {
			for (var m=0; m<dates[d].matches.length-1; m++) {
				document.write(dates[d].matches[m].teams[0] + " vs " + dates[d].matches[m].teams[1] + "<br/>");
			}
		}
		document.write("</td>");

		document.write("</tr>");
	} // loop through all play dates
} // writeScheduleTable()

// -------------------------------------------------------------

function writePlayoffScheduleTable() {
	//============================================
	// Schedule Table (PLAYOFFS)
	//============================================
	// Sort on team number
	teamlist.sort(function(a,b) {return a.num - b.num;});

	var unplayedWeek = 0;

	document.write("<tr>");
	document.write("<th>Date</th>");
	document.write("<th>Match</th>");
	document.write("<th>Time</th>");
	document.write("<th>Court</th>");
	document.write("<th>Match</th>");
	document.write("<th>Work</th>");
	document.write("</tr>");

	for (var d=0; d<playdates.length; d++) {

		var rowid = "";
		if ((dates[d].matches[0].winCount === undefined)) {
			if ( ++unplayedWeek == 1 ) {
				rowid = "id='next'";
			}
		}

		document.write("<tr " + rowid + ">");

		document.write("<td>");
		document.write(dates[d].date);
		document.write("</td>");

		document.write("<td>");
		for (var m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].num + "<br/>");
			}
		}
		document.write("</td>");

		document.write("<td>");
		for (var m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].time + "<br/>");
			}
		}
		document.write("</td>");

		document.write("<td>");
		for (var m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].court + "<br/>");
			}
		}
		document.write("</td>");

		// Teams
		document.write("<td>");
		if (dates[d].playoffs) {
			document.write("Playoffs");
		} else {
			for (var m=0; m<dates[d].matches.length; m++) {
				if (dates[d].matches[m].teams != null) {
					var t1 = getTeamName(dates[d].matches[m].teams[0], "plain");
					var t2 = getTeamName(dates[d].matches[m].teams[1], "plain");
					var text = t1 + " vs " + t2;
					document.write(text + "<br/>");
				}
			}
		}
		document.write("</td>");

		// Work Team
		document.write("<td>");
		for (var m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].work != null) {
				document.write(getTeamName(dates[d].matches[m].work, "plain") + "<br/>");
			}
		}
		document.write("</td>");

		document.write("</tr>");
	}
} // writePlayoffScheduleTable()

// -------------------------------------------------------------

function writeResultsTable() {
	//============================================
	// Results Table (REGULAR SEASON & PLAYOFFS)
	//============================================
	document.write("<tr>");
	document.write("<th>Winner<br></th>");
	document.write("<th>Games</th>");
	document.write("<th>Loser</th>");
	document.write("<th>Games</th>");
	document.write("<th>Scores</th>");
	document.write("</tr>");

	for (var d=0; d<playdates.length; d++) {
		if (dates[d].matches[0].teams != null) {
			if (dates[d].matches[0].winCount > 0 ||  dates[d].matches[0].lossCount > 0) {

				document.write("<tr>");

				// Winning Team
				document.write("<td>");
				for (var m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						var match = dates[d].matches[m];
						var teamNum;
						if (match.winCount > match.lossCount) {
							teamNum = match.teams[0];
						} else if (match.winCount < match.lossCount) {
							teamNum = match.teams[1];
						} else {
							teamNum = 0;
						}
						if (match.winCount === undefined) {
							alert('Problem with wins/losses in match ' + match.num);
						}
						document.write(teamlist[getTeamNum(teamNum)-1].name + "<br/>");
					}
				}
				document.write("</td>");

				// Winning Team games won
				document.write("<td>");
				for (var m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						var match = dates[d].matches[m];
						document.write("&nbsp;");
						if (match.winCount > match.lossCount) {
							document.write(match.winCount);
						} else if (match.winCount < match.lossCount) {
							document.write(match.lossCount);
						}
						document.write("&nbsp;<br/>");
					}
				}
				document.write("</td>");

				// Losing Team
				document.write("<td>");
				for (var m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						var match = dates[d].matches[m];
						var teamNum;
						if (match.winCount > match.lossCount) {
							teamNum = match.teams[1];
						} else if (match.winCount < match.lossCount) {
							teamNum = match.teams[0];
						} else {
							teamNum = 0;
						}
						document.write(teamlist[getTeamNum(teamNum)-1].name + "<br/>");
					}
				}
				document.write("</td>");

				// Losing Team games won
				document.write("<td>");
				for (var m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						var match = dates[d].matches[m];
						document.write("&nbsp;");
						if (match.winCount > match.lossCount) {
							document.write(match.lossCount);
						} else if (match.winCount < match.lossCount) {
							document.write(match.winCount);
						}
						document.write("&nbsp;<br/>");
					}
				}
				document.write("</td>");

				// Scores
				document.write("<td id='scores'>");
				for (var m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						var match = dates[d].matches[m];
						for (var g=0; g<match.games.length; g++) {
							var game = match.games[g];
							if (game.scores != null) {
								if (match.winCount > match.lossCount) {
									boldScore(game.scores[0], game.scores[1]);
								} else {
									boldScore(game.scores[1], game.scores[0]);
								}
								if (g < match.games.length-1) {
									document.write("&nbsp;&nbsp;");
								}
							}
						}
						document.write("<br/>");
					}
				}
				document.write("</td>");
				document.write("</tr>");
			}
		}
	}
} // writeResultsTable()

// -------------------------------------------------------------

function writeSeedsTable() {
	document.write("<tr>");
	document.write("<th>Seed<br></th>");
	document.write("<th>Team</th>");
	document.write("</tr>");
	for (var s=0; s<seeds.length; s++) {
		document.write("<tr>");
		document.write("<td align='center'>" + (s+1) + "<br></th>");
		document.write("<td align='center'>" + teamlist[seeds[s]-1].name + "<br></th>");
		document.write("</tr>");
	}
} // writeSeedsTable()

// -------------------------------------------------------------

function writePlayoffDiagramFour() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td rowspan='6'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("W1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td class='match'>#3</td><td colspan=2 class='team'>" + getTeamName("W3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#2</td><td class='team'>" + getTeamName("W2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td class='match'>#6</td><td colspan=3 class='team'>" + getTeamName("W6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W3") != getTeamNum("W6")) {
		document.write("<td></td><td class='match'>#7 *</td><td class='team'>" + getTeamName("W7") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L3") + "</td><td></td><td></td>");
	if (getTeamNum("W3") != getTeamNum("W6")) {
		document.write("<td></td><td class='team'>" + getTeamName("L6") + "</td><td><b>Champion</b></td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td>&nbsp;</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#5</td><td class='team'>" + getTeamName("W5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#4</td><td class='team'>" + getTeamName("W4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L2") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramFour

// -------------------------------------------------------------

function writePlayoffDiagramSix() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S4") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td colspan='2' rowspan='7'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("W1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S5") + "</td><td class='match'>#2</td><td colspan=2 class='team'>" + getTeamName("W2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("S1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td></td><td colspan=2 class='match'>#7</td><td colspan=2 class='team'>" + getTeamName("W7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("S2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S3") + "</td><td class='match'>#4</td><td colspan=2 class='team'>" + getTeamName("W4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#3</td><td class='team'>" + getTeamName("W3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S6") + "</td><td></td><td></td><td></td><td></td><td class='match'>#10</td><td class='team'>" + getTeamName("W10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W7") != getTeamNum("W10")) {
		document.write("<td class='match'>#11 *</td><td class='team'>" + getTeamName("W11") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("L7") + "</td><td></td>");
	if (getTeamNum("W7") != getTeamNum("W10")) {
		document.write("<td class='team'>" + getTeamName("L10") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#5</td><td class='team'>" + getTeamName("W5") + "</td><td class='match'>#9</td><td class='team'>" + getTeamName("W9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td></td><td></td><td class='match'>#8</td><td class='team'>" + getTeamName("W8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#6</td><td class='team'>" + getTeamName("W6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L4") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramSix()

// -------------------------------------------------------------

function writePlayoffDiagramSixAlternate() {
	// Use this when playoff match #5 is W2 vs W4.  For 6 teams doing playoffs ON A SINGLE
	// NET, on week 2 we reverse the normal order since the two losing team matches (normally
	// matches 5 & 6) cannot play at the same time.
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("S4") + "</td>");
	document.write("  <td></td><td></td><td></td><td></td><td></td>");
	document.write("  <td rowspan='7'><table border='1'><tbody>"); writeSeedsTable(); document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='match'>#1</td><td class='team'>" + getTeamName("W1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("S5") + "</td><td class='match'>#2</td><td colspan=2 class='team'>" + getTeamName("W2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td class='team'>" + getTeamName("S1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td style='border:0'></td><td></td><td colspan=2 class='match'>#5</td><td colspan=2 class='team'>" + getTeamName("W5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td class='team'>" + getTeamName("S2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("S3") + "</td><td class='match'>#4</td><td colspan=2 class='team'>" + getTeamName("W4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='match'>#3</td><td class='team'>" + getTeamName("W3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("S6") + "</td><td></td><td></td><td></td><td></td><td class='match'>#10</td><td colspan=2 class='team'>" + getTeamName("W10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W5") != getTeamNum("W10")) {
		document.write("  <td></td><td class='match'>#11 *</td><td class='team'>" + getTeamName("W11") + "</td>");
	} else {
		document.write("  <td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("L5") + "</td><td></td>");
	if (getTeamNum("W5") != getTeamNum("W10")) {
		document.write("<td></td><td class='team'>" + getTeamName("L10") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("L2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='match'>#6</td><td class='team'>" + getTeamName("W6") + "</td><td class='match'>#9</td><td class='team'>" + getTeamName("W9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("L3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td style='border:0'></td><td></td><td></td><td class='match'>#8</td><td class='team'>" + getTeamName("W8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("L1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='match'>#7</td><td class='team'>" + getTeamName("W7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("L4") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramSixAlternate()

// -------------------------------------------------------------

function writePlayoffDiagramEight() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td colspan='4' rowspan='7'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("W1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S8") + "</td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'>#3</td><td class='team'>" + getTeamName("W3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#2</td><td class='team'>" + getTeamName("W2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'></td><td class='match'>#11</td><td class='team'>" + getTeamName("W11") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S3") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#4</td><td class='team'>" + getTeamName("W4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S6") + "</td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'>#6</td><td class='team'>" + getTeamName("W6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#5</td><td class='team'>" + getTeamName("W5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("S7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>=============</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#7</td><td class='team'>" + getTeamName("W7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#9</td><td class='team'>" + getTeamName("W9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#8</td><td class='team'>" + getTeamName("W8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("L5") + "</td><td></td><td class='match'>#12</td><td class='team'>" + getTeamName("W12") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#10</td><td class='team'>" + getTeamName("W10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("L6") + "</td><td></td><td class='match'>#13</td><td class='team'>" + getTeamName("W13") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td></td><td colspan=1 class='team'>" + getTeamName("W14") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td class='match'>#14</td>");
	if (getTeamNum("W12") != getTeamNum("W14")) {
		document.write("<td class='match'>#15 *</td><td class='team'>" + getTeamName("W15") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("L11") + "</td><td></td>");
	if (getTeamNum("W12") != getTeamNum("W14")) {
		document.write("<td class='team'>" + getTeamName("L14") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("W11") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
} // writePlayoffDiagramEight()

// -------------------------------------------------------------

//
// FUNCTION: writeDivisionResultsTables <division>
// PARM    : division        - String; division name (e.g., "AA")
// PURPOSE : Generate body text in generated HTML to show the regular
//           season tables (standings & schedule & results) for a division.
//
function writeDivisionResultsTables (division) {
	document.write("<h1 align='center'>" + division.toUpperCase() + " Division Standings &amp; Schedule</h1>");
	document.write("<hr> <br>");
	document.write("<center>");
	document.write("  <table id='standings'>");
	document.write("    <tbody>");
	document.write("      <tr>");
	document.write("        <th width='14%'><b>Team</b></td>");
	document.write("        <th width='43%'><b>Captain</b></td>");
	document.write("        <th width='14%'><b>Wins</b></td>");
	document.write("        <th width='14%'><b>Losses</b></td>");
	document.write("      </tr>");

	computeRecord();
	writeStandings(division.toLowerCase());

	document.write("    </tbody>");
	document.write("  </table>");
	document.write("  <br>");
	document.write("  <table cellspacing='5' cellpadding='5' border='0'>");
	document.write("    <tbody>");
	document.write("      <tr>");
	document.write("        <td valign='top'>");
	document.write("          <table id='schedule'>");
	document.write("            <tbody>");

	writeScheduleTable();

	document.write("            </tbody>");
	document.write("          </table>");
	document.write("        </td>");
	document.write("        <td valign='top'>");
	document.write("          <table id='results'>");
	document.write("            <tbody>");

	writeResultsTable();

	document.write("            </tbody>");
	document.write("          </table>");
	document.write("        </td>");
	document.write("      </tr>");
	document.write("    </tbody>");
	document.write("  </table>");
	document.write("</center>");
	document.write("<hr>");
	document.write("<font face='Helvetica, Arial, sans-serif' size='-1'>");
	document.write("Send comments/suggestions about this page to the <a href='mailto:webmaster@bumpsetdrink.com'>Webmaster</a>.<br>");
	document.write("Send comments/suggestions about the league to: <a href='mailto:comments@bumpsetdrink.com'>Comments</a>");
	document.write("</font>");

} // writeDivisionResultsTables()

// -------------------------------------------------------------

//
// FUNCTION: writeDivisionPlayoffBracket <division> <teamcount> <use_alternate> <standings_file>
// PARM    : division        - String; division name (e.g., "AA")
//           teamcount       - Number; count of teams in division (must be one of 4 | 6 | 8)
//           use_alternate   - String; "alternate" specifies for 6-team division to use
//                             alternate playoff schedule.  See writePlayoffDiagramSixAlternate()
//           standings_file  - String; HTML file name used for regular season standings.
// PURPOSE : Generate body text in generated HTML to show the playoff bracket for a division.
//
function writeDivisionPlayoffBracket(division, teamcount, use_alternate, standings_file) {
	document.write("  <h1 align=\"center\">" + division.toUpperCase() + " Division Playoff Bracket<br></h1>");
	document.write("  <hr>");
	document.write("  <center>");
	document.write("    <b>FORMAT</b><br>");
	document.write("    All Playoff match games start at 4 points, win by 2, with a cap of");
	document.write("    30 in the first two games and no cap in the third game (if played).");
	document.write("  </center>");
	document.write("  <hr>");
	document.write("  <table id=\"playoff\">");

	if (teamcount == 4) {
		writePlayoffDiagramFour();
	} else if (teamcount == 8) {
		writePlayoffDiagramEight();
	} else if (use_alternate == "alternate") {
		writePlayoffDiagramSixAlternate();
	} else {
		writePlayoffDiagramSix();
	}

	document.write("  </table>");
	document.write("  <br>");
	document.write("  <table>");
	document.write("    <tbody valign=\"top\">");
	document.write("      <tr>");
	document.write("        <td>");
	document.write("          <table id=\"schedule\">");
	document.write("            <tbody>");

	writePlayoffScheduleTable();

	document.write("            </tbody>");
	document.write("          </table>");
	document.write("        </td>");
	document.write("        <td> <br> </td>");
	document.write("        <td>");
	document.write("          <table id=\"results\">");
	document.write("            <tbody>");

	writeResultsTable();

	document.write("            </tbody>");
	document.write("          </table>");
	document.write("        </td>");
	document.write("      </tr>");
	document.write("    </tbody>");
	document.write("  </table>");
	document.write("  <p>");
	document.write("  <small>");
	document.write("    <a href=\"roster" + division.toLowerCase() + ".html\">Team Rosters</a> <br>");
	document.write("    <a href=\"" + standings_file + "\">Final Regular Season Standings</a>");
	document.write("  </small>");
	document.write("  </p>");

} // writeDivisionPlayoffBracket()
