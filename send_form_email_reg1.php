<?php

# PHP Version (as of Feb 25 2020): 5.3.3

if (! isset($_POST['email']))
{
	echo "<p>EMAIL is required.</p>";
	exit;
}

// Set to TRUE if you want to see all form fields
if (FALSE) {
	foreach ($_POST as $key=>$value) {
    	echo "<p>".$key.' '.$value."</p>";
	}
	exit;
}

require_once("Mail.php"); //PEAR mail is already installed in our current environment

//|	require_once("recaptchalib.php");
//|	echo "<p>REMOTE_ADDR: '" . $_SERVER["REMOTE_ADDR"] . "'</p>";
//|	echo "<p>recaptcha_challenge_field: '" . $_POST["recaptcha_challenge_field"] . "'</p>";
//|	echo "<p>recaptcha_response_field: '"  . $_POST["recaptcha_response_field"]  . "'</p>";
//|	$resp = recaptcha_check_answer (
//|		"6Ldd9dEUAAAAAP4uTBrklrYrW1fPYsEfLh91LrEE", // private key
//|		$_SERVER["REMOTE_ADDR"],
//|		$_POST["recaptcha_challenge_field"],
//|		$_POST["recaptcha_response_field"]);
//|	if (!$resp->is_valid) {
//|		echo "<p>Hello! (" . $resp->error . ")</p>";
//|		# echo '<meta HTTP-EQUIV="REFRESH" content="0; url=https://www.bumpsetdrink.com/regstep1.html">';
//|		die ();
//|	}

$email_bsdreg  = "registration@bumpsetdrink.com";  //Enter the email you want to send the form to
// $email_bsdreg  = "jackjackjackaroo@gmail.com";  //Enter the email you want to send the form to
$email_jack    = "jackjackjackaroo@gmail.com";
$email_jackg   = "jackjackjackaroo@yahoo.com";
$email_subject = "Registration";  // You can put whatever subject here
$host          = "mail.bumpsetdrink.com";  // The name of your mail server. (Commonly mail.yourdomain.com if your mail is hosted with HostMySite)
$username      = "no_reply@bumpsetdrink.com";  // A valid email address you have setup
$from_address  = "no_reply@bumpsetdrink.com";  // If your mail is hosted with HostMySite this has to match the email address above
$password      = "xF2hY4Dns53Kkr7Tcb";  // Password for the above email address
$reply_to      = "no_reply@bumpsetdrink.com";  //Enter the email you want customers to reply to
$port          = "50"; // This is the default port. Try port 50 if this port gives you issues and your mail is hosted with HostMySite

$DEBUG         = False;
$DEBUGINFO     = "";

function form_should_now_die($error) {
	// your error code can go here
	echo "<html>";
	echo "$error\n";
	echo "  <br />\n";
	echo "  <br />\n";
	echo "  <p><strong>Please go back in your browser, correct the errors shown above, and resubmit.</strong></p>";
	echo "</html>";
	die();
}

//
// FUNCTION: clean_string STRING-TO-CLEAN
// PURPOSE : Return slightly sanitized version of input string.
//
function clean_string($string) {
	$bad = array("content-type","bcc:","to:","cc:","href");
	return trim(str_replace($bad,"",$string));
}

//
// FUNCTION: fix_up_string STRING
// PURPOSE : Return input string after formatting it for later parsing.
//              Change "~" (tilde) character to " (about)" string literal
//              Change "|" character to " " (space)
//              Change right quote characters to "'" (single quote)
//              Change double quote characters to '"' (double quote)
//              Change ellipses characters to "..." (three periods)
//              Change prime characters to "'" (single quote)
//              Change double prime characters to '"' (double quote)
//              Change CR/LF characters to " ~~~ " (tildes)
//
$fieldsep = "|";  # used to separate fields in packed line
$CRsep    = "~";  # used to replace carriage return & newlines

function fix_up_string($string) {
	global $fieldsep, $CRsep;
	global $DEBUG, $DEBUGINFO;
	$lookfor  = array("$CRsep"  , "|", "’", "‘", "‛", "”", "“", "‟", "…", "′", "″", "ʹ", "ʺ");
	$changeto = array(" (about)", " ", "'",     "'",     "'",     "\"",    "\"",    "\"",    "...",  "'",    "\""  , "'", "\"");
	$result = preg_replace("/\\r\\n/"," $CRsep$CRsep$CRsep ", str_replace($lookfor,$changeto,$string));
	if ($DEBUG) {
		if ($string != $result) {
			$DEBUGINFO .= "<ul><li>INPUT : $string</li><li>OUTPUT: $result</li></ul>";
		}
	}
	return trim($fieldsep . $result);
}


//
// FUNCTION: spaced_string $ENTRY-LIST
// PURPOSE : Add string entries to a space-delimited string that is returned.
//
function spaced_string($entrylist) {
	$entrysep = "";
	$spacedstring = "";
	foreach ($entrylist as $entry) {
		if ($entry != "") {
			$spacedstring .= $entrysep . $entry;
			$entrysep = " ";
		}
	}

	return $spacedstring;
}

// Validate expected data exists
$missing = "";
$sep     = "";
if (!isset($_POST['firstname']))  { $missing .= "${missing}${sep}First Name"; $sep=", "; }
if (!isset($_POST['lastname']))   { $missing .= "${missing}${sep}Last Name"; $sep=", "; }
if (!isset($_POST['email']))      { $missing .= "${missing}${sep}Email Address"; $sep=", "; }
if (!isset($_POST['gendermale'])) { $missing .= "${missing}${sep}Gender Male"; $sep=", "; }
if (!isset($_POST['height']))     { $missing .= "${missing}${sep}Height"; $sep=", "; }
if (!isset($_POST['captain']))    { $missing .= "${missing}${sep}Captain"; $sep=", "; }
if (!isset($_POST['liability']))  { $missing .= "${missing}${sep}I Agree (checkbox)"; $sep=", "; }

if (!isset($_POST['experience'])) { $missing .= "${missing}${sep}Experience"; $sep=", "; }
elseif (strlen($_POST['experience']) == 0) { $missing .= "${missing}${sep}Experience"; $sep=", "; }

if (strlen($missing) > 0) {
	// These checks are likely no longer needed, the form was updated to require info for all these fields.
	form_should_now_die("  <h1>STOP!</h1>\n  <p><strong>One or more required fields were not found.</strong></p>\n  <p>MISSING: $missing</p>\n");
}

//
// These are in order of how they appear in the form:
//
$firstname         = $_POST['firstname'];          // required
$lastname          = $_POST['lastname'];           // required
$phone             = $_POST['phone'];              // required
$email_address     = $_POST['email'];              // required
$gendermale        = $_POST['gendermale'];         // required
$pronouns          = $_POST['pronouns'];           // OPTIONAL
$mypronouns        = $_POST['mypronouns'];         // OPTIONAL
$height            = $_POST['height'];             // required
$age               = $_POST['age'];                // required
$birthdate         = $_POST['birthdate'];          // required if under 18
$pairing_info      = $_POST['pairing_info'];       // OPTIONAL
$captain           = $_POST['captain'];            // OPTIONAL
$experience        = $_POST['experience'];         // required
$p_hitter          = $_POST['p_hitter'];           // OPTIONAL
$p_setter          = $_POST['p_setter'];           // OPTIONAL
$p_passer          = $_POST['p_passer'];           // OPTIONAL
$p_other           = $_POST['p_other'];            // OPTIONAL
$positions         = "$p_hitter/$p_setter/$p_passer/$p_other";
$note_to_directors = $_POST['note_to_directors'];  // OPTIONAL
$referby           = $_POST['referby'];            // OPTIONAL
$emergencyinfo     = $_POST['emergencyinfo'];      // OPTIONAL
$liability         = $_POST['liability'];          // required
$missingdates      = spaced_string(array($_POST['miss0808'],$_POST['miss0815'],$_POST['miss0822'],$_POST['miss0905'],$_POST['miss0912'],$_POST['miss0919'],$_POST['miss0926'],$_POST['miss1003'],$_POST['miss1010'],$_POST['miss1017'],$_POST['miss1024'],$_POST['miss1107']));
$tryoutweekone     = $_POST['tryoutweekone'];      // OPTIONAL
$spam_input_field  = $_POST['t_e_l_e_p_h_o_n_e'];  // hidden, only filled in by spambots

$error_message     = "";

if ($firstname == "TESTJACK") {
	$DEBUG = True;
}

$email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
if (!preg_match($email_exp,$email_address)) {
	$error_message .= '  <li>The Email Address you entered does not appear to be valid.</li>
';
}

$name_exp = "/^[A-Za-z .'-]+$/";
if (!preg_match($name_exp,$firstname)) {
	$error_message .= '  <li>The First Name you entered does not appear to be valid.</li>
';
}

if (!preg_match($name_exp,$lastname)) {
	$error_message .= '  <li>The Last Name you entered does not appear to be valid.</li>
';
}

if (preg_match('/^(\d{3})(\d{3})(\d{4})$/',$phone,$matches)) {
	// 10 digits (stupid iPhones), update to include dashes
	$phone = "$matches[1]-$matches[2]-$matches[3]";
} elseif (! preg_match('/^\d{3}-\d{3}-\d{4}$/',$phone)) {
	$error_message .= '  <li>The Phone Number you entered does not appear to be valid.</li>
';
}

if (!preg_match('/[1-9]/',$height)) {
	$error_message .= '  <li>You need to enter your height.</li>
';
}

if ((preg_match('/pennies/i',$height)) or (preg_match('/reams/i',$height))) {
	$error_message .= '  <li><span style="font-weight: bold; font-size: larger;">Really Fred??!??</span></li>
';
}

if (($age != "18-19") and ($age != "20+") and (strlen($birthdate) != 10)) {
	$error_message .= '  <li>A valid birthdate is required for anyone under 18.</li>
';
}

if (($age == "14-15") and (! preg_match('/\W/',$pairing_info))) {
	$error_message .= '  <li>You <u>MUST</u> pair with another registered player at this age. &nbsp;Please indicate with whom you will pair.</li>
';
}

if(strlen($error_message) > 0) {
	form_should_now_die("  <h1>STOP!</h1>\n  <ul>" . $error_message . "  </ul>\n");
}


// Fix up First & Last Name if all upper or lower case
if (($firstname == strtoupper($firstname)) or ($firstname == strtolower($firstname))) {
	$firstname = ucwords(strtolower($firstname));
}

if (($lastname == strtoupper($lastname)) or ($lastname == strtolower($lastname))) {
	$lastname = ucwords(strtolower($lastname));
}


// Try to fix up Height input so that it conforms to N' NN"
$height_original = $height;
$height = str_replace("-"," ",$height);

if (preg_match('/^\s*(\d+)\s*[Cc][Mm]\s*$/',$height,$matches)) {
	$cm = $matches[1];
	if ($cm < 500) {
		$inches = round($cm / 2.54);
		$height = floor($inches / 12) . "' " . ($inches % 12) . "\"";
	}
} elseif (preg_match('/^\s*(\d+)\s*[\'".,]\s*(\d+)\s*[\'"]*\s*$/',$height,$matches)) {
	$height = $matches[1] . "' " . $matches[2] . "\"";
} elseif (preg_match('/^\s*(\d+)\s*[\'"]*\s*$/',$height,$matches)) {
	$height = $matches[1] . "' 0\"";
} elseif (preg_match('/^\s*(\d+)\s*(\d+)\s*$/',$height,$matches)) {
	$height = $matches[1] . "' " . $matches[2] . "\"";
} elseif (preg_match('/^\s*(\d+)\s*[Ff][OoEe]*[Tt][.]*\s*(\d+)\s*[Ii][Nn][A-Za-z]*\s*$/',$height,$matches)) {
	$height = $matches[1] . "' " . $matches[2] . "\"";
} elseif (preg_match('/^\s*(\d+)\s*[Ff][OoEe]*[Tt][.]*\s*(\d+)\s*$/',$height,$matches)) {
	$height = $matches[1] . "' " . $matches[2] . "\"";
} elseif (preg_match('/^\s*(\d+)\s*[Ff][OoEe]*[Tt]\s*$/',$height,$matches)) {
	$height = $matches[1] . "' 0\"";
} elseif (preg_match('/^\s*(\d+)\s*[Ii][Nn][A-Za-z]*\s*$/',$height,$matches)) {
	$inches = $matches[1];
	if ($inches < 150) {
		$height = floor($inches / 12) . "' " . ($inches % 12) . "\"";
	}
}


// ----------------------------------------------------------
$auth = array('host' => $host, 'auth' => true, 'username' => $username, 'password' => $password);
$smtp = Mail::factory('smtp', $auth);

// Send email response to customer
// $reply_message  = "\nTHANK YOU!\n\nThank you for registering for our volleyball league!\n\n";
// $reply_message .= "You should hear from us soon about the upcoming season. ";
// $reply_message .= "Until then, we highly recommend you join our Facebook group (https://www.facebook.com/groups/104345997024/) ";
// $reply_message .= "or follow our Facebook page (https://www.facebook.com/BumpSetDrinkVolleyball/).\n";

// Create the email headers & send the email -- uncomment these lines to send the note
// $headers = array('From' => $from_address, 'To' => clean_string($email_address), 'Subject' => 'Thank you for registering with BSD Volleyball!', 'Reply-To' => $reply_to);
// $usermail = $smtp->send(clean_string($email_address), $headers, $reply_message);

// ----------------------------------------------------------

// Build email message with info for league officials
$msg_to_bsd  = "Form details below.\n\n";
$msg_to_bsd .= "First Name: "            .clean_string($firstname)."\n";
$msg_to_bsd .= "Last Name: "             .clean_string($lastname)."\n";
$msg_to_bsd .= "Phone: "                 .clean_string($phone)."\n";
$msg_to_bsd .= "Email: "                 .clean_string($email_address)."\n";
$msg_to_bsd .= "Gender Male: "           .clean_string($gendermale)."\n";
$msg_to_bsd .= "Age: "                   .clean_string($age)."\n";
$msg_to_bsd .= "Pairing Info: "          .clean_string($pairing_info)."\n";
$msg_to_bsd .= "Captain: "               .clean_string($captain)."\n";
$msg_to_bsd .= "Experience: "            .clean_string($experience)."\n";
$msg_to_bsd .= "Height: "                .clean_string($height)."\n";
$msg_to_bsd .= "Note To Directors: "     .clean_string($note_to_directors)."\n";
$msg_to_bsd .= "Referred By: "           .clean_string($referby)."\n";
$msg_to_bsd .= "Liability: "             .clean_string($liability)."\n";
$msg_to_bsd .= "Birthdate: "             .clean_string($birthdate)."\n";
$msg_to_bsd .= "Positions: "             .clean_string($positions)."\n";
$msg_to_bsd .= "Emergency Contact Info:" .clean_string($emergencyinfo)."\n";
$msg_to_bsd .= "Pronouns: "              .clean_string($pronouns)."\n";
$msg_to_bsd .= "My Pronouns: "           .clean_string($mypronouns)."\n";
$msg_to_bsd .= "Missing Dates: "         .clean_string($missingdates)."\n";
$msg_to_bsd .= "Tryout Week One: "       .clean_string($tryoutweekone)."\n";

//
// Added some checks to help avoid spammers
//
$data_is_spam = False;
$send_spam_report = False;  // Set to control email of spam reports
$spaminfo = "";

if ($DEBUG) {
	echo "<p>DEBUG ENABLED</p>\n";
	if ($height != $height_original) {
		echo "<ul>DEBUG Height Cleanup: __ ${height_original} __ ${height} __</ul>\n";
	}
}

if ( (substr_count(strtoupper($msg_to_bsd), "HTTP:") + substr_count(strtoupper($msg_to_bsd), "HTTPS:") ) > 1 ) {
	$data_is_spam = True;
	$spaminfo = "__TOO_MANY_EMBEDDED_URLS";

} elseif (preg_match('/url=/', $msg_to_bsd)) {
	$data_is_spam = True;
	$spaminfo = "__EMBEDDED_URL          ";

} elseif ((strlen($firstname) > 4) and (strlen($lastname) > 4) and (substr($firstname,0,4) == substr($lastname,0,4))) {
	// Names like "Aaron Aaronson" will be flagged -- thinking that will be super infrequent.
	// We have this check here because nearly all spam registrations reuse the first name
	// for the last name but add some extra characters.
	$data_is_spam = True;
	$spaminfo = "__NAMES_TOO_SIMILAR     ";
	$send_spam_report = True;

} elseif ((strlen($p_hitter) > 0) and ($p_hitter != "hitter")) {
	$data_is_spam = True;
	$spaminfo = "__POSITION_INFO_IS_JUNK ";
	$send_spam_report = True;

} elseif ((strlen($p_setter) > 0) and ($p_setter != "setter")) {
	$data_is_spam = True;
	$spaminfo = "__POSITION_INFO_IS_JUNK ";
	$send_spam_report = True;

} elseif ((strlen($p_passer) > 0) and ($p_passer != "passer")) {
	$data_is_spam = True;
	$spaminfo = "__POSITION_INFO_IS_JUNK ";
	$send_spam_report = True;

} elseif ((strlen($p_other) > 0) and ($p_other != "other")) {
	$data_is_spam = True;
	$spaminfo = "__POSITION_INFO_IS_JUNK ";
	$send_spam_report = True;

} elseif (False) {
	// } elseif ( (strlen($pairing_info) > 50) or (strlen($experience) > 50) or (strlen($note_to_directors) > 50) ) {
	//
	// If long strings are entered for the free text fields, select a random
	// portion from within the first 50 characters of each and see if it's
	// found in one of the other free text fields -- a strong indication of
	// repetitive text which lazy spammers seem to be inclined to do.
	//

	//  // First make a copy of each free text field
	//  $copy_of_pairing_info      = $pairing_info;
	//  $copy_of_experience        = $experience;
	//  $copy_of_note_to_directors = $note_to_directors;
	//  $copy_of_referby           = $referby;

	//  // Then remove all whitespace from each copy
	//  preg_replace('/\s/',"",$copy_of_pairing_info);
	//  preg_replace('/\s/',"",$copy_of_experience);
	//  preg_replace('/\s/',"",$copy_of_note_to_directors);
	//  preg_replace('/\s/',"",$copy_of_referby);

	//  if ($DEBUG) {
	//  	echo "<p>DEBUG Checking matches...</p>\n";
	//  	echo "<ul>\n";
	//  	echo "  <li>pairing   : \"$copy_of_pairing_info\"</li>\n";
	//  	echo "  <li>experience: \"$copy_of_experience\"</li>\n";
	//  	echo "  <li>note      : \"$copy_of_note_to_directors\"</li>\n";
	//  	echo "  <li>referby   : \"$copy_of_referby\"</li>\n";
	//  	echo "</ul>\n";
	//  }

	//  if (strlen($copy_of_pairing_info) > 50) {
	//  	$checkstring = substr($copy_of_pairing_info,(rand() % 30),20);
	//  	if ((strpos($copy_of_experience,$checkstring) !== False) or (strpos($copy_of_note_to_directors,$checkstring) !== False) or (strpos($copy_of_referby,$checkstring) !== False)) {
	//  		$data_is_spam = True;
	//  		$spaminfo = "__PAIRING_MATCHES_OTHER_FIELDS";
	//  		$spaminfo .= " ('$checkstring' EXPERIENCE:" . fix_up_string(strpos($copy_of_experience,$checkstring)) . "; NOTE:" . fix_up_string(strpos($copy_of_note_to_directors,$checkstring)) . "; REFERBY:" . fix_up_string(strpos($copy_of_referby,$checkstring)) . ")";
	//  	}
	//  }

	//  if (!$data_is_spam and (strlen($copy_of_experience) > 50)) {
	//  	$checkstring = substr($copy_of_experience,(rand() % 30),20);
	//  	if ((strpos($copy_of_note_to_directors,$checkstring) !== False) or (strpos($copy_of_referby,$checkstring) !== False)) {
	//  		$data_is_spam = True;
	//  		$spaminfo = "__EXPERIENCE_MATCHES_OTHER_FIELDS";
	//  		$spaminfo .= " ('$checkstring' NOTE:" . strpos($copy_of_note_to_directors,$checkstring) . "; REFERBY:" . strpos($copy_of_referby,$checkstring) . ")";
	//  	}
	//  }

		if (!$data_is_spam and (strlen($copy_of_note_to_directors) > 50)) {
			$checkstring = substr($copy_of_note_to_directors,(rand() % 30),20);
			if (strpos($copy_of_referby,$checkstring) !== False) {
				$data_is_spam = True;
				$spaminfo = "__NOTE_MATCHES_OTHER_FIELDS";
				$spaminfo .= " ('$checkstring' REFERBY:" . strpos($copy_of_referby,$checkstring) . ")";
			}
		}

} elseif ( (strlen($pairing_info) > 4) and (strlen($experience) > 4) and (strlen($note_to_directors) > 4) and (strlen($referby) > 4) and (strlen($emergencyinfo) > 4) ) {
	//
	// Instead, if shorter strings are entered for the free text fields, count
	// how many of them are identical.  If more than 2, again that is a strong
	// indication of repetitive text put in by spammers.
	//
	$matchcount = 0;
	if ($pairing_info == $experience)         { $matchcount++; }
	if ($pairing_info == $note_to_directors)  { $matchcount++; }
	if ($pairing_info == $referby)            { $matchcount++; }
	if ($pairing_info == $emergencyinfo)      { $matchcount++; }

	if ($matchcount > 1) {
		// One free text field matches more than one other free text field.
		$data_is_spam = True;
		$spaminfo = "__TEXT_FIELDS_IDENTICAL ";
	}

} elseif ( (strlen($spam_input_field) > 0) and (ltrim($spam_input_field,"+1") !== ltrim($phone,"+1") ) ) {
	// if (!preg_match("/chapman/i",$lastname)) {

  	// Spam fillers for some reason enter different (random) numbers in each telephone number field
	$data_is_spam = True;
	$send_spam_report = True;
	$spaminfo = "__SPAMBOT! '" . clean_string($spam_input_field) . "'";
	if ((strlen($spam_input_field) > 10) and (substr($spam_input_field,0,1) == "8")) {
		$spaminfo .= "  LONG-HIDDEN-PHONE";
	}
}


// For packed line, substitute in My Pronouns when necessary

if (($pronouns == "Not Listed") && ($mypronouns != "")) {
	$pronouns = $mypronouns;
	$mypronouns = "";
}

$packed_line =
	fix_up_string(date("Y/m/d")) .
	fix_up_string(date("H:i:s")) .
	fix_up_string($firstname) .
	fix_up_string($lastname) .
	fix_up_string($phone) .
	fix_up_string($email_address) .
	fix_up_string($gendermale) .
	fix_up_string($age) .
	fix_up_string($pairing_info) .
	fix_up_string($captain) .
	fix_up_string($experience) .
	fix_up_string($height) .
	fix_up_string($note_to_directors) .
	fix_up_string($referby) .
	fix_up_string($birthdate) .
	fix_up_string($positions) .
	fix_up_string($emergencyinfo) .
	fix_up_string($pronouns) .
	fix_up_string($mypronouns) .
	fix_up_string($missingdates) .
	fix_up_string($tryoutweekone) .
	"$fieldsep";

if ($data_is_spam) {
	//
	// Send spam registration info for investigation
	//
	if ($send_spam_report) {
		$msg_to_bsd = "POSSIBLE-SPAM: $spaminfo\n" . 
		              "\nUSER-AGENT: " . $_SERVER['HTTP_USER_AGENT'] .
		              "\nSUBJECT   : " . clean_string($_POST['subject']) .
		              "\nRECIPIENT : " . clean_string($_POST['recipient']) .
		              "\nREQUIRED  : " . clean_string($_POST['required']) .
		              "\nREDIRECT  : " . clean_string($_POST['redirect']) .
		              "\nTELEPHONE : " . clean_string($_POST['telephonex']) . "\n" .
		              "\n$msg_to_bsd\nINFO:\n" . $packed_line . "\n";
		$headers = array('From' => $from_address, 'To' => $email_jack,  'Subject' => "BSD-InvestigateReg", 'Reply-To' => $reply_to, 'Date' => date("r"));
		$mail = $smtp->send($email_jack, $headers, $msg_to_bsd);
		$headers = array('From' => $from_address, 'To' => $email_jackg, 'Subject' => "BSD-InvestigateReg", 'Reply-To' => $reply_to, 'Date' => date("r"));
		$mail = $smtp->send($email_jackg, $headers, $msg_to_bsd);

		if ($DEBUG) {
			echo "<p>DEBUG: Email sent for SPAM investigation</p>";
			if (PEAR::isError($mail)) {
				echo "<p><u>ERROR</u>: ". $mail->getMessage() . "</p>";
			}
		}
	}

	if ($DEBUG) {
		echo "<p>DEBUG: SPAM INFO = </p><p>$spaminfo</p>";
		exit;
	}

	$myfile = fopen("spamregs.txt", "a");
	if ($myfile) {
		fwrite($myfile, "$spaminfo$fieldsep$packed_line\n");
		fclose($myfile);
	}

	// Let the page move on to the next registration page so spammers don't know we caught 'em
	echo '<meta HTTP-EQUIV="REFRESH" content="0; url=https://www.bumpsetdrink.com/regstep2.html">';

} else {
	//
	// Send "good" (non-spam) registration info for processing
	//

	$msg_to_bsd .= "\nINFO:\n" . $packed_line . "\n";

	//
	// Create the email headers & send the email
	//
	if ($DEBUG) {
		$headers = array('From' => $from_address, 'To' => "$email_jack,$email_jackg", 'Subject' => $email_subject, 'Reply-To' => $reply_to);
		$mail = $smtp->send("$email_jack,$email_jackg", $headers, $msg_to_bsd);
		if (PEAR::isError($mail)) {
			echo "<p><u>ERROR</u>: ". $mail->getMessage() . "</p>";
		}
		$myfile = fopen("lastreg.txt", "w");
		if ($myfile) {
			fwrite($myfile, "$packed_line\n");
			fclose($myfile);
		}
		echo "<p>DEBUG: Email sent for good registration (SPAMINFO: $spaminfo)</p>";
		$DEBUGINFO = preg_replace("/\n/","<br>",$msg_to_bsd);
		if (strlen($DEBUGINFO) > 0) {
			echo "<p>DEBUG INFO:</p><p>$DEBUGINFO</p>";
		}
		exit;
	} else {
		$myfile = fopen("goodregs.txt", "a");
		if ($myfile) {
			fwrite($myfile, "$packed_line\n");
			fclose($myfile);
		}

		$headers = array('From' => $from_address, 'To' => $email_bsdreg, 'Subject' => $email_subject, 'Reply-To' => $reply_to, 'Bcc' => "$email_jack,$email_jackg");
		$mail = $smtp->send("$email_bsdreg,$email_jack,$email_jackg", $headers, $msg_to_bsd);

		if (PEAR::isError($mail)) {
			echo "<p>Unfortunately, the message could not be sent at this time. Please try again later.</p>";
		} else {
			echo '<meta HTTP-EQUIV="REFRESH" content="0; url=https://www.bumpsetdrink.com/regstep2.html">';
		}
	}
}

?>
