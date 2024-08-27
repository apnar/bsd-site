// Setup variables used throughout
var teamlist = new Array();
var winner   = new Array();
var loser    = new Array();
var dates    = new Array();

//
// FUNCTION: setWins
// PARM    : match
// PURPOSE : Set match.winCount and match.lossCount based on game scores in match{}
//
function setWins(match) {
	match.winCount = 0;
	match.lossCount = 0;
	if (match.games[0].scores != null) {
		for (g=0; g<match.games.length; g++) {
			if (match.games[g].scores != null) {
				if (match.games[g].scores[0] > match.games[g].scores[1])
					match.winCount++;
				else
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
		// SAT 8/15 - Handle playoff not completed
		winner[match.num] = 0;
		loser[match.num] = 0;
	}
}

// -------------------------------------------------------------

function getTeamNum(team) {
	var digitCount;
	if ((typeof team) === "string") {

		// One or two-digit number
		if (isNaN(team.substring(team.length-2,team.length-1))) {
			digitCount = 1;
		} else {
			digitCount = 2;
		}

		var label = team.substring(0,team.length-digitCount);
		var num  = team.substring(team.length-digitCount,team.length);
		var teamnum;
		if (label == "S" || label == "Seed") {
			//alert("Seed " + num);
			teamnum = seeds[num-1];
		} else if (label == "W" || label == "Winner") {
			var win = team.substring(1,2);
			teamnum = winner[num];
		} else if (label == "L" || label == "Loser") {
			var win = team.substring(1,2);
			teamnum = loser[num];
		} else {
			alert("Unknown label = " + label);
		}

		if (typeof teamnum === "undefined") {
			return team;
		} else {
			return teamnum;
		}
	} else {
		return team;
	}
}

// -------------------------------------------------------------

function getTeamName(team) {
	var t = getTeamNum(team);
	if (isNaN(t)) {
		t = "<i>" + t + "</i>";
	} else if (t>0) {
		// SAT 8/15 - Handle playoff not completed
		t = "<b>" + teamlist[t-1].name + "</b>";
	} else {
		t = "<b>" + team + "</b>";
	}
	return t;
}

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
}

// -------------------------------------------------------------

function computeRecord() {
	if (!teamlist[0]) {
		// Reset indices to start at 0 because Javascript's "sort"
		// will eventually do the same thing.
		teamlist = teamlist.filter(function(val){return val});
	}

	for (d=0; d<dates.length; d++) {
		if (!dates[d].playoffs) {
			for (m=0; m<dates[d].matches.length; m++) {
				match = dates[d].matches[m];
				for (g=0; g<match.games.length; g++) {
					game = match.games[g];
					if (game.scores != null) {
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
}

// -------------------------------------------------------------

function writeStandings(level) {
	//============================================
	// Standings Table
	//============================================
	//teamlist.sort(function(a,b) {return b.wins - a.wins});
	teamlist.sort(compareTeamWins);
	for (t=0; t<teamlist.length; t++) {
		document.write("<tr>");
		document.write("<td align='center'>" + teamlist[t].num + "</td>");
		document.write("<td><a href='roster" + level + ".html'>" + teamlist[t].name + "</a> <span class='nickname'>" + (teamlist[t].nickname ? teamlist[t].nickname : "") + "</span></td>");
		document.write("<td align='center'>" + teamlist[t].wins + "</td>");
		document.write("<td align='center'>" + teamlist[t].losses + "</td>");
		document.write("</tr>");
	}
}

// -------------------------------------------------------------

function compareTeamWins(a, b) {
	// a & b are teamlist[] elements
	// Return negative if a < b; zero if a == b; positive if a > b
	if (a.wins != b.wins) {
		return b.wins - a.wins;
	} else {
		// When teams have the same number of wins, need to break
		// the tie by checking head-to-head matches to determine who
		// has the most wins.
		var aWins = 0;
		var bWins = 0;
		var aPos;
		var bPos;

		//alert("Team " + a.num + " team " + b.num);
		for (d=0; d<dates.length; d++) {
			if (!dates[d].playoffs) {
				for (m=0; m<dates[d].matches.length; m++) {
					match = dates[d].matches[m];
					if (match.teams) {
						// match.teams should be two element array [team#,team#]
						//alert(match.teams[0]);
						if (match.teams[0] == a.num && match.teams[1] == b.num) {
							//alert("1 Date " + d + " match " + m);
							aPos = 0; bPos = 1;
						} else if (match.teams[0] == b.num && match.teams[1] == a.num) {
							//alert("2 Date " + d + " match " + m);
							aPos = 1; bPos = 0;
						} else {
							aPos = -1; bPos = -1;
						}
						if (aPos >= 0) {
							for (g=0; g<match.games.length; g++) {
								game = match.games[g];
								if (game.scores != null) {
									if (game.scores[aPos] > game.scores[bPos]) {
										aWins++;
									} else {
										bWins++;
									}
								}
							}
						} // teams info is valid
					} // teams exist for this match
				} // for matches
			} // if playoffs
		} // for dates

		// Head to head record overall
		if (aWins != bWins) {
			return bWins - aWins;
		} else {
			return false;
		}
	}
} // compareTeamWins()

// -------------------------------------------------------------

function writeScheduleTable() {
	//============================================
	// Schedule Table
	//============================================
	// Sort on team number
	teamlist.sort(function(a,b) {return a.num - b.num});

	var unplayedWeek = 0;
	var nextWeek = false;

	document.write("<tr>");
	document.write("<th>Date</th>");
	document.write("<th>Time</th>");
	document.write("<th>Court</th>");
	document.write("<th>Match</th>");
	document.write("</tr>");
	for (d=0; d<playdates.length; d++) {
		document.write("<tr>");

		if ((typeof dates[d].matches[0].winCount === "undefined")) {
			unplayedWeek++;
		}
		if (unplayedWeek==1) {
			nextWeek = true;
		} else {
			nextWeek = false;
		}

		// Times
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		document.write(dates[d].date);
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write("<b>" + dates[d].matches[m].time + "</b><br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Court
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].court + "<br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Teams
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		if (!dates[d].playoffs) {
			for (m=0; m<dates[d].matches.length; m++) {
				if (dates[d].matches[m].teams != null) {
					document.write(dates[d].matches[m].teams[0] + " vs " + dates[d].matches[m].teams[1] + "<br/>");
				}
			}
		} else {
			document.write("Playoffs");
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");
		document.write("</tr>");
	}
} // writeScheduleTable()

// -------------------------------------------------------------

function writePlayoffScheduleTable() {
	//============================================
	// Schedule Table
	//============================================
	// Sort on team number
	teamlist.sort(function(a,b) {return a.num - b.num});

	var unplayedWeek = 0;
	var nextWeek = false;

	document.write("<tr>");
	document.write("<th>Date</th>");
	document.write("<th>Match</th>");
	document.write("<th>Time</th>");
	document.write("<th>Court</th>");
	document.write("<th>Match</th>");
	document.write("<th>Work</th>");
	document.write("</tr>");
	for (d=0; d<playdates.length; d++) {
		document.write("<tr>");

		if ((typeof dates[d].matches[0].winCount === "undefined")) {
			unplayedWeek++;
		}
		if (unplayedWeek==1) {
			nextWeek = true;
		} else {
			nextWeek = false;
		}

		// Dates
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		document.write(dates[d].date);
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Match Num
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].num + "<br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Times
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].time + "<br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Court
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].teams != null) {
				document.write(dates[d].matches[m].court + "<br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Teams
		var t;
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		if (!dates[d].playoffs) {
			for (m=0; m<dates[d].matches.length; m++) {
				if (dates[d].matches[m].teams != null) {
					var t1 = getTeamName(dates[d].matches[m].teams[0]);
					var t2 = getTeamName(dates[d].matches[m].teams[1]);
					document.write(t1 + " vs " + t2 + "<br/>");
				}
			}
		} else {
			document.write("Playoffs");
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		// Work Team
		document.write("<td align='center'><small>");
		if (nextWeek) document.write("<b>");
		for (m=0; m<dates[d].matches.length; m++) {
			if (dates[d].matches[m].work != null) {
				var t = getTeamName(dates[d].matches[m].work);
				document.write(t + "<br/>");
			}
		}
		if (nextWeek) document.write("</b>");
		document.write("</small></td>");

		document.write("</tr>");
	}
} // writePlayoffScheduleTable()

// -------------------------------------------------------------

function writeResultsTable() {
	//============================================
	// Results Table
	//============================================
	document.write("<tr>");
    document.write("<th>Winner<br></th>");
	document.write("<th>Games</th>");
	document.write("<th>Loser</th>");
	document.write("<th>Games</th>");
	document.write("<th>Scores</th>");
	document.write("</tr>");

	for (d=0; d<playdates.length; d++) {
		if (dates[d].matches[0].teams != null) {
			if (dates[d].matches[0].winCount > 0 ||  dates[d].matches[0].lossCount > 0) {

				document.write("<tr>");

				// Winning Team
				document.write("<td><small>");
				for (m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						match = dates[d].matches[m];
						if (match.winCount > match.lossCount) {
							teamNum = match.teams[0];
						} else if (match.winCount < match.lossCount) {
							teamNum = match.teams[1];
						} else {
							teamNum = 0;
						}
						if (typeof match.winCount === 'undefined') {
							alert('Problem with wins/losses in match ' + match.num);
						}
						document.write(teamlist[getTeamNum(teamNum)-1].name + "<br/>");
					}
				}
				document.write("</small></td>");

				// Winning Team games won
				document.write("<td align='center'><small>");
				for (m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						match = dates[d].matches[m];
						document.write("&nbsp;");
						if (match.winCount > match.lossCount) {
							document.write(match.winCount);
						} else if (match.winCount < match.lossCount) {
							document.write(match.lossCount);
						}
						document.write("&nbsp;<br/>");
					}
				}
				document.write("</small></td>");

				// Losing Team
				document.write("<td><small>");
				for (m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						match = dates[d].matches[m];
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
				document.write("</small></td>");

				// Losing Team games won
				document.write("<td align='center'><small>");
				for (m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						match = dates[d].matches[m];
						document.write("&nbsp;");
						if (match.winCount > match.lossCount) {
							document.write(match.lossCount);
						} else if (match.winCount < match.lossCount) {
							document.write(match.winCount);
						}
						document.write("&nbsp;<br/>");
					}
				}
				document.write("</small></td>");

				// Scores
				document.write("<td id='scores'><small>");
				for (m=0; m<dates[d].matches.length; m++) {
					if (dates[d].matches[m].teams != null) {
						match = dates[d].matches[m];
						for (g=0; g<match.games.length; g++) {
							game = match.games[g];
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
				document.write("</small></td>");
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
	for (s=0; s<seeds.length; s++) {
		document.write("<tr>");
		document.write("<td align='center'>" + (s+1) + "<br></th>");
		document.write("<td align='center'>" + teamlist[seeds[s]-1].name + "<br></th>");
		document.write("</tr>");
	}
}

// -------------------------------------------------------------

function writePlayoffDiagramFour() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td rowspan='6'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("Winner1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td class='match'>#3</td><td colspan=2 class='team'>" + getTeamName("Winner3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#2</td><td class='team'>" + getTeamName("Winner2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td class='match'>#6</td><td colspan=3 class='team'>" + getTeamName("Winner6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W3") != getTeamNum("W6")) {
		document.write("<td></td><td class='match'>#7 *</td><td class='team'>" + getTeamName("Winner7") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser3") + "</td><td></td><td></td>");
	if (getTeamNum("W3") != getTeamNum("W6")) {
		document.write("<td></td><td class='team'>" + getTeamName("Loser6") + "</td><td><b>Champion</b></td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td>&nbsp;</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#5</td><td class='team'>" + getTeamName("Winner5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Loser1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#4</td><td class='team'>" + getTeamName("Winner4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Loser2") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramFour

// -------------------------------------------------------------

function writePlayoffDiagramSix() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed4") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td colspan='2' rowspan='7'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("Winner1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed5") + "</td><td class='match'>#2</td><td colspan=2 class='team'>" + getTeamName("Winner2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Seed1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td></td><td colspan=2 class='match'>#7</td><td colspan=2 class='team'>" + getTeamName("Winner7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Seed2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed3") + "</td><td class='match'>#4</td><td colspan=2 class='team'>" + getTeamName("Winner4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#3</td><td class='team'>" + getTeamName("Winner3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed6") + "</td><td></td><td></td><td></td><td></td><td class='match'>#10</td><td class='team'>" + getTeamName("Winner10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W7") != getTeamNum("W10")) {
		document.write("<td class='match'>#11 *</td><td class='team'>" + getTeamName("Winner11") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("Loser7") + "</td><td></td>");
	if (getTeamNum("W7") != getTeamNum("W10")) {
		document.write("<td class='team'>" + getTeamName("Loser10") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#5</td><td class='team'>" + getTeamName("Winner5") + "</td><td class='match'>#9</td><td class='team'>" + getTeamName("Winner9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td style='border:0'></td><td></td><td></td><td class='match'>#8</td><td class='team'>" + getTeamName("Winner8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#6</td><td class='team'>" + getTeamName("Winner6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser4") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramSix()

// -------------------------------------------------------------

function writePlayoffDiagramSixAlternate() {
	// Use this when playoff match #5 is W2 vs W4.  For 6 teams doing playoffs ON A SINGLE
	// NET, on week 2 we reverse the normal order since the two losing team matches (normally
	// matches 5 & 6) cannot play at the same time.
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("Seed4") + "</td>");
	document.write("  <td></td><td></td><td></td><td></td><td></td>");
	document.write("  <td rowspan='7'><table border='1'><tbody>"); writeSeedsTable(); document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='match'>#1</td><td class='team'>" + getTeamName("Winner1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("Seed5") + "</td><td class='match'>#2</td><td colspan=2 class='team'>" + getTeamName("Winner2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td class='team'>" + getTeamName("Seed1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td style='border:0'></td><td></td><td colspan=2 class='match'>#5</td><td colspan=2 class='team'>" + getTeamName("Winner5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td class='team'>" + getTeamName("Seed2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("Seed3") + "</td><td class='match'>#4</td><td colspan=2 class='team'>" + getTeamName("Winner4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='match'>#3</td><td class='team'>" + getTeamName("Winner3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td class='team'>" + getTeamName("Seed6") + "</td><td></td><td></td><td></td><td></td><td class='match'>#10</td><td colspan=2 class='team'>" + getTeamName("Winner10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td></td><td></td><td></td><td></td>");
	if (getTeamNum("W5") != getTeamNum("W10")) {
		document.write("  <td></td><td class='match'>#11 *</td><td class='team'>" + getTeamName("Winner11") + "</td>");
	} else {
		document.write("  <td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("Loser5") + "</td><td></td>");
	if (getTeamNum("W5") != getTeamNum("W10")) {
		document.write("<td></td><td class='team'>" + getTeamName("Loser10") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("Loser2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='match'>#6</td><td class='team'>" + getTeamName("Winner6") + "</td><td class='match'>#9</td><td class='team'>" + getTeamName("Winner9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("Loser3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td style='border:0'></td><td></td><td></td><td class='match'>#8</td><td class='team'>" + getTeamName("Winner8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("Loser1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='match'>#7</td><td class='team'>" + getTeamName("Winner7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("  <td></td><td></td><td class='team'>" + getTeamName("Loser4") + "</td>");
	document.write("</tr>");
} // writePlayoffDiagramSixAlternate()

function writePlayoffDiagramEight() {
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td colspan='4' rowspan='7'><table border='1'><tbody>");
	writeSeedsTable();
	document.write("</tbody></table></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#1</td><td class='team'>" + getTeamName("Winner1") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed8") + "</td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'>#3</td><td class='team'>" + getTeamName("Winner3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#2</td><td class='team'>" + getTeamName("Winner2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'></td><td class='match'>#11</td><td class='team'>" + getTeamName("Winner11") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed3") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#4</td><td class='team'>" + getTeamName("Winner4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed6") + "</td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td class='match'></td><td class='match'>#6</td><td class='team'>" + getTeamName("Winner6") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='match'>#5</td><td class='team'>" + getTeamName("Winner5") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td class='team'>" + getTeamName("Seed7") + "</td>");
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
	document.write("<td></td><td class='team'>" + getTeamName("Loser1") + "</td>");
	document.write("<td></td><td></td><td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#7</td><td class='team'>" + getTeamName("Winner7") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td>");
	document.write("</tr>");
	document.write("<tr/>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Loser2") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#9</td><td class='team'>" + getTeamName("Winner9") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Loser4") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='match'>#8</td><td class='team'>" + getTeamName("Winner8") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td class='team'>" + getTeamName("Loser5") + "</td><td></td><td class='match'>#12</td><td class='team'>" + getTeamName("Winner12") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser3") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='match'>#10</td><td class='team'>" + getTeamName("Winner10") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td class='team'>" + getTeamName("Loser6") + "</td><td></td><td class='match'>#13</td><td class='team'>" + getTeamName("Winner13") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<tr>");	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td></td><td colspan=1 class='team'>" + getTeamName("Winner14") + "</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td class='match'>#14</td>");
	if (getTeamNum("W12") != getTeamNum("W14")) {
		document.write("<td class='match'>#15 *</td><td class='team'>" + getTeamName("Winner15") + "</td>");
	} else {
		document.write("<td><b>Champion</b></td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("Loser11") + "</td><td></td>");
	if (getTeamNum("W12") != getTeamNum("W14")) {
		document.write("<td class='team'>" + getTeamName("Loser14") + "</td>");
	} else {
		document.write("<td>&nbsp;</td>");
	}
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td></td><td></td><td></td><td></td><td></td><td class='team'>" + getTeamName("Winner11") + "</td>");
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


