<?php
if(isset($_POST['email'])) {
require_once "Mail.php"; //PEAR mail is already installed in our current environment

$email_to = "dee@bumpsetdrink.com";  //Enter the email you want to send the form to
$email_subject = "T-Shirt Order";  // You can put whatever subject here 
$host = "mail.bumpsetdrink.com";  // The name of your mail server. (Commonly mail.yourdomain.com if your mail is hosted with HostMySite)
$username = "no_reply@bumpsetdrink.com";  // A valid email address you have setup 
$from_address = "no_reply@bumpsetdrink.com";  // If your mail is hosted with HostMySite this has to match the email address above 
$password = "xF2hY4Dns53Kkr7Tcb";  // Password for the above email address
$reply_to = "no_reply@bumpsetdrink.com";  //Enter the email you want customers to reply to
$port = "50"; // This is the default port. Try port 50 if this port gives you issues and your mail is hosted with HostMySite

function died($error) {
// your error code can go here 
echo "We are very sorry, but there were error(s) found with the form you submitted. "; 
echo "These errors appear below.<br /><br />"; 
echo $error."<br /><br />"; 
echo "Please go back and fix these errors.<br /><br />";
die();
}

// Validate expected data exists
if(!isset($_POST['firstname']) || !isset($_POST['lastname']) || !isset($_POST['phone']) || !isset($_POST['shirtsize']) || !isset($_POST['email']) || !isset($_POST['shipaddress'])) {
died('We are sorry, but there appears to be a problem with the form you submitted.');
}

$firstname = $_POST['firstname']; // required 
$lastname = $_POST['lastname']; // required 
$phone = $_POST['phone']; // not required 
$shirtsize = $_POST['shirtsize']; // required 
$email = $_POST['email']; // required 
$shipaddress = $_POST['shipaddress']; // required 
$error_message = ""; 
$email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/'; 
if(!preg_match($email_exp,$email)) {
$error_message .= 'The Email Address you entered does not appear to be valid.<br />';
} 
$string_exp = "/^[A-Za-z .'-]+$/"; 
if(!preg_match($string_exp,$firstname)) {
$error_message .= 'The First Name you entered does not appear to be valid.<br />';
}
if(!preg_match($string_exp,$lastname)) {
$error_message .= 'The Last Name you entered does not appear to be valid.<br />';
} 
if(strlen($phone) < 2) {
$error_message .= 'The Phone you entered do not appear to be valid.<br />';
}
if(strlen($error_message) > 0) {
died($error_message);
}
$email_message = "Form details below.\n\n";
function clean_string($string) {
$bad = array("content-type","bcc:","to:","cc:","href");
return str_replace($bad,"",$string);
}
$email_message .= "First Name: ".clean_string($firstname)."\n";
$email_message .= "Last Name: ".clean_string($lastname)."\n"; 
$email_message .= "Phone: ".clean_string($phone)."\n";
$email_message .= "Shirt Size: ".clean_string($shirtsize)."\n";
$email_message .= "Email: ".clean_string($email)."\n";
$email_message .= "Shipping Address: ".clean_string($shipaddress)."\n";

// This section creates the email headers
$auth = array('host' => $host, 'auth' => true, 'username' => $username, 'password' => $password);
$headers = array('From' => $from_address, 'To' => $email_to, 'Subject' => $email_subject, 'Reply-To' => $reply_to);

// This section send the email
$smtp = Mail::factory('smtp', $auth);
$mail = $smtp->send($email_to, $headers, $email_message);

if (PEAR::isError($mail)) {?>
<!-- include your own failure message html here -->
  Unfortunately, the message could not be sent at this time. Please try again later.

<!-- Uncomment the line below to see errors with sending the message -->
<!-- <?php echo("<p>". $mail->getMessage()."</p>"); ?> -->

<?php } else { ?>

<!-- include your own success message html here -->

<meta HTTP-EQUIV="REFRESH" content="0; url=http://www.bumpsetdrink.com/tshirt2.html">

<?php } } ?>