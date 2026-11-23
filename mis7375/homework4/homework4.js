/*
Program name: homework4.js
Author: Brian Nwabuoku
Date created: 11/23/2026
Date last edited: 11/23/2026
Version: 1.0
Description: Checks the form like Homework 3, loads the state list, and remembers returning patients.
I read form values by name, the same names in my data dictionary, and use IDs for the message spots, the review area, the status line, the bars, and the date.
*/

// Remembers if the last Review and Validate passed, so Submit only shows when it did
let formpassed = false;

// The text boxes that get cleaned up when the patient leaves them
const textfields = ["firstname", "middleinit", "lastname", "dob", "addr1", "addr2", "city", "zip", "phone", "email", "userid", "symptoms"];

// The cookie that remembers the first name, and how long it lasts
const cookiename = "firstname";
const cookiehours = 48;

// Saved answers go in local storage under this start, so they're easy to find and remove
const savestart = "bcfh_";

// The fields that are never saved on the computer because they're secret
const securefields = ["ssn", "password1", "password2"];

// The form clears after 10 minutes without any typing or clicking, with a warning 60 seconds before
const formseconds = 600;
const warnseconds = 60;
let secondsleft = formseconds;

// Runs when the page opens to start the clock and timer, load the states, and welcome the patient
async function startform() {
  showclock();
  setInterval(showclock, 1000);
  setInterval(countdown, 1000);
  document.addEventListener("input", resettimer);
  document.addEventListener("click", resettimer);
  await loadstates();
  welcome();
  showhealthscale();
  lockform();
  showstatus("Click Review and Validate when you're done. Submit shows up once everything passes.", "");
}

// Gets a field from the signup form by its name attribute, the same name the server will get
function field(name) {
  return document.forms["signup"].elements[name];
}

// Reads what's in a box with the extra spaces left off the ends, without changing the box
function getvalue(name) {
  return field(name).value.trim();
}

// Shows a message in the spot under a field, or clears it when the message is empty
// The message spots aren't data, so they're found by ID
function showerror(name, message) {
  document.getElementById(name + "_error").innerHTML = message;
}

// Shows the line next to the buttons that tells the patient where things stand
function showstatus(message, style) {
  const status = document.getElementById("formstatus");
  status.innerHTML = message;
  status.className = style;
}

// Gets the wording of a field's label so the review uses friendly names, not variable names
function labeltext(id) {
  const label = document.querySelector("label[for='" + id + "']");
  return label.textContent.replace("*", "").trim();
}

// Keeps any typed tags or symbols from turning into real HTML on the review
function cleantext(text) {
  return text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Cleans up a box when the patient leaves it, so the box shows what we'll actually save
function tidy(name) {
  if (!textfields.includes(name)) {
    return;
  }
  const box = field(name);
  let value = box.value.trim();
  // Email and user ID are always saved in lowercase
  if (name == "email" || name == "userid") {
    value = value.toLowerCase();
  }
  if (name == "middleinit") {
    value = value.toUpperCase();
  }
  // A ZIP+4 is fine to type or paste, but we only keep the first 5 digits
  if (name == "zip" && /^[0-9]{5}-[0-9]{4}$/.test(value)) {
    value = value.substring(0, 5);
  }
  // A good phone number is shown back as 000-000-0000
  if (name == "phone" && /^\(?[0-9]{3}\)?[ .\-]?[0-9]{3}[ .\-]?[0-9]{4}$/.test(value)) {
    const digits = value.replace(/[^0-9]/g, "");
    value = digits.substring(0, 3) + "-" + digits.substring(3, 6) + "-" + digits.substring(6);
  }
  box.value = value;
}

// First name is required and takes 1 to 30 letters, apostrophes, and dashes
function checkfirstname() {
  const firstname = getvalue("firstname");
  if (firstname == "") {
    return "First name is required.";
  }
  if (!/^[A-Za-z'\-]{1,30}$/.test(firstname)) {
    return "First name can only have letters, apostrophes, and dashes.";
  }
  return "";
}

// Middle initial is optional, but if it's there it has to be one letter
function checkmiddleinit() {
  const middleinit = getvalue("middleinit");
  if (middleinit != "" && !/^[A-Za-z]$/.test(middleinit)) {
    return "Middle initial has to be one letter.";
  }
  return "";
}

// Last name is required and can also have the numbers 2 to 5 for a suffix like 3rd
function checklastname() {
  const lastname = getvalue("lastname");
  if (lastname == "") {
    return "Last name is required.";
  }
  if (!/^[A-Za-z'2-5 \-]{1,30}$/.test(lastname)) {
    return "Last name can only have letters, apostrophes, dashes, and the numbers 2 to 5.";
  }
  return "";
}

// Date of birth has to be a real MM/DD/YYYY date, not in the future, and not more than 120 years ago
function checkdob() {
  const dob = getvalue("dob");
  if (dob == "") {
    return "Date of birth is required.";
  }
  if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/[0-9]{4}$/.test(dob)) {
    return "Please use MM/DD/YYYY, like 03/05/1990.";
  }
  const parts = dob.split("/");
  const month = Number(parts[0]);
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  const birthday = new Date(year, month - 1, day);
  // A date like 02/30 rolls over into March, so this catches days that don't exist
  if (birthday.getMonth() != month - 1 || birthday.getDate() != day) {
    return "That date doesn't exist.";
  }
  // The limits come from today's date, the same date shown at the top of the page
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  if (birthday > today) {
    return "Date of birth can't be in the future.";
  }
  if (birthday < oldest) {
    return "Date of birth can't be more than 120 years ago.";
  }
  return "";
}

// Puts the dashes in the SSN while the patient types, so they never have to type them
// The box is hidden like a password, so the message says how many digits are in so far
function formatssn() {
  const box = field("ssn");
  const typed = box.value;
  const digits = typed.replace(/[^0-9]/g, "").substring(0, 9);
  let shown = digits;
  if (digits.length > 5) {
    shown = digits.substring(0, 3) + "-" + digits.substring(3, 5) + "-" + digits.substring(5);
  } else if (digits.length > 3) {
    shown = digits.substring(0, 3) + "-" + digits.substring(3);
  }
  box.value = shown;
  if (/[^0-9\-]/.test(typed)) {
    showerror("ssn", "SSN can only have numbers, so that character was left out.");
  } else if (digits.length < 9) {
    showerror("ssn", "SSN needs 9 digits. You have " + digits.length + " so far.");
  } else {
    showerror("ssn", "");
  }
}

// SSN has to be 9 numbers once the dashes are taken out
function checkssn() {
  const ssn = getvalue("ssn").replace(/-/g, "");
  if (ssn == "") {
    return "Social Security number is required.";
  }
  if (!/^[0-9]+$/.test(ssn)) {
    return "SSN can only have numbers.";
  }
  if (ssn.length != 9) {
    return "SSN needs 9 digits. You have " + ssn.length + ".";
  }
  return "";
}

// Address line 1 is required and takes 2 to 30 letters, numbers, spaces, and the usual address marks
function checkaddr1() {
  const addr1 = getvalue("addr1");
  if (addr1 == "") {
    return "Address line 1 is required.";
  }
  if (addr1.length < 2 || addr1.length > 30) {
    return "Address line 1 needs 2 to 30 characters.";
  }
  if (!/^[A-Za-z0-9 .,#'\-\/]+$/.test(addr1)) {
    return "Address line 1 can only have letters, numbers, spaces, and . , # ' - /";
  }
  return "";
}

// Address line 2 is optional, but if it's filled in it follows the same rules as line 1
function checkaddr2() {
  const addr2 = getvalue("addr2");
  if (addr2 == "") {
    return "";
  }
  if (addr2.length < 2 || addr2.length > 30) {
    return "Address line 2 needs 2 to 30 characters, or leave it blank.";
  }
  if (!/^[A-Za-z0-9 .,#'\-\/]+$/.test(addr2)) {
    return "Address line 2 can only have letters, numbers, spaces, and . , # ' - /";
  }
  return "";
}

// City is required and takes 2 to 30 letters, spaces, periods, apostrophes, and dashes
function checkcity() {
  const city = getvalue("city");
  if (city == "") {
    return "City is required.";
  }
  if (city.length < 2 || city.length > 30) {
    return "City needs 2 to 30 characters.";
  }
  if (!/^[A-Za-z .'\-]+$/.test(city)) {
    return "City can only have letters, spaces, periods, apostrophes, and dashes.";
  }
  return "";
}

// The patient has to pick a state, since the list starts on Select
function checkstate() {
  if (field("state").value == "") {
    return "Please pick a state.";
  }
  return "";
}

// Zip code is 5 digits, and a ZIP+4 gets cut down to the first 5 when the patient leaves the box
function checkzip() {
  const zip = getvalue("zip");
  if (zip == "") {
    return "Zip code is required.";
  }
  if (!/^[0-9]{5}(-[0-9]{4})?$/.test(zip)) {
    return "Zip code needs 5 digits, like 77004.";
  }
  return "";
}

// Phone number needs 10 digits, with or without dashes, dots, spaces, or parentheses
function checkphone() {
  const phone = getvalue("phone");
  if (phone == "") {
    return "Phone number is required.";
  }
  if (!/^\(?[0-9]{3}\)?[ .\-]?[0-9]{3}[ .\-]?[0-9]{4}$/.test(phone)) {
    return "Phone number needs 10 digits, like 713-555-1212.";
  }
  return "";
}

// Email has to look like name@domain.tld
function checkemail() {
  const email = getvalue("email");
  if (email == "") {
    return "Email address is required.";
  }
  if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
    return "Email needs to look like name@domain.com.";
  }
  return "";
}

// User ID is 5 to 20 characters, starts with a letter, and has no spaces or special characters
function checkuserid() {
  // This one reads the box as typed, so a space shows up as a problem right away
  const userid = field("userid").value;
  if (userid.trim() == "") {
    return "User ID is required.";
  }
  if (/\s/.test(userid)) {
    return "User ID can't have spaces.";
  }
  if (/^[0-9]/.test(userid)) {
    return "User ID can't start with a number.";
  }
  if (!/^[A-Za-z0-9_\-]+$/.test(userid)) {
    return "User ID can only have letters, numbers, underscores, and dashes.";
  }
  if (!/^[A-Za-z]/.test(userid)) {
    return "User ID has to start with a letter.";
  }
  if (userid.length < 5 || userid.length > 20) {
    return "User ID needs 5 to 20 characters. You have " + userid.length + ".";
  }
  return "";
}

// Password is checked as the patient types, so they can see what's still missing
function checkpassword1() {
  const password = field("password1").value;
  const userid = getvalue("userid").toLowerCase();
  const firstname = getvalue("firstname").toLowerCase();
  const lastname = getvalue("lastname").toLowerCase();
  const lowered = password.toLowerCase();
  const missing = [];
  if (password == "") {
    return "Password is required.";
  }
  if (password.length < 8 || password.length > 30) {
    missing.push("8 to 30 characters");
  }
  if (!/[A-Z]/.test(password)) {
    missing.push("an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    missing.push("a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    missing.push("a number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    missing.push("a special character");
  }
  if (password.includes('"')) {
    return "Password can't have double quotes.";
  }
  if (missing.length > 0) {
    return "Still needs " + missing.join(", ") + ".";
  }
  // The password can't be the user ID or hold the user ID or name inside it
  if (userid != "" && lowered.includes(userid)) {
    return "Password can't include your user ID.";
  }
  if ((firstname.length > 1 && lowered.includes(firstname)) || (lastname.length > 1 && lowered.includes(lastname))) {
    return "Password can't include your name.";
  }
  return "";
}

// The second password box has to match the first one
function checkpassword2() {
  const password1 = field("password1").value;
  const password2 = field("password2").value;
  if (password2 == "") {
    return "Please type your password again.";
  }
  if (password1 != password2) {
    return "Passwords do not match.";
  }
  return "";
}

// All the buttons in a radio group share one name, so the group's value is the one picked
function checkgender() {
  if (field("gender").value == "") {
    return "Please pick a gender.";
  }
  return "";
}

function checkvaccinated() {
  if (field("vaccinated").value == "") {
    return "Please answer the vaccination question.";
  }
  return "";
}

function checkinsurance() {
  if (field("insurance").value == "") {
    return "Please answer the insurance question.";
  }
  return "";
}

// Symptoms are optional, but no double quotes since they can break the database later
function checksymptoms() {
  if (field("symptoms").value.includes('"')) {
    return "Please leave out double quotes.";
  }
  return "";
}

// Shows the slider's number next to the bar as it moves
function showhealthscale() {
  const scale = field("healthscale").value;
  document.getElementById("healthvalue").innerHTML = scale + " out of 10";
}

// Reads the state list from its own file with fetch and adds it to the State drop-down
async function loadstates() {
  const statebox = field("state");
  try {
    const response = await fetch("homework4-states.html");
    if (!response.ok) {
      throw new Error("The state list didn't load.");
    }
    const options = await response.text();
    statebox.insertAdjacentHTML("beforeend", options);
  } catch (error) {
    showerror("state", "We couldn't load the state list. Please refresh the page.");
  }
}

// Looks up the zip code with a free zip code service and fills in the city and state
async function lookupzip() {
  if (checkzip() != "") {
    return;
  }
  const zip = getvalue("zip").substring(0, 5);
  try {
    const response = await fetch("https://api.zippopotam.us/us/" + zip);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    field("city").value = data.places[0]["place name"];
    field("state").value = data.places[0]["state abbreviation"];
    showresult("city");
    showresult("state");
    savefield("city");
    savefield("state");
  } catch (error) {
    // If the lookup service is down, the patient just types the city and state themselves
  }
}

// Shows today's date and the time in the top bar, and runs again every second
function showclock() {
  const now = new Date();
  document.getElementById("today").innerHTML = now.toLocaleDateString() + " " + now.toLocaleTimeString();
}

// Saves a cookie that lasts for a number of hours
function setcookie(name, value, hours) {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires.toUTCString() + "; path=/";
}

// Reads a cookie by name, or gives back an empty string if it isn't there
function getcookie(name) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(name + "=") == 0) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return "";
}

// Expires a cookie by giving it a date in the past
function deletecookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

// Checks the cookie when the page opens and welcomes the patient back or as a new user
function welcome() {
  const firstname = getcookie(cookiename);
  if (firstname == "") {
    // No cookie means a new user, so anything left on this computer from before gets removed
    forgetanswers();
    shownewuser();
    return;
  }
  document.getElementById("welcome").innerHTML = "Welcome back, " + cleantext(firstname) + "!";
  // The not-you box only shows up when we remember someone
  document.getElementById("notyou").innerHTML = "<input type='checkbox' id='newuser' onchange='startnewuser()'>" +
    "<label for='newuser'>Not " + cleantext(firstname) + "? Click here to start as a new user.</label>";
  // Like the professor's example, the patient confirms it's them before we fill in their answers
  if (!confirm("Welcome back, " + firstname + "! Click OK if this is you, or Cancel to start as a new user.")) {
    startnewuser();
    return;
  }
  field("firstname").value = firstname;
  loadanswers();
}

// Shows the new user welcome and takes away the not-you box
function shownewuser() {
  document.getElementById("welcome").innerHTML = "Welcome, new user!";
  document.getElementById("notyou").innerHTML = "";
}

// Runs when the patient checks the not-you box, so it forgets the old patient and clears the form
function startnewuser() {
  deletecookie(cookiename);
  forgetanswers();
  document.forms["signup"].reset();
  shownewuser();
}

// Saves one field's answer in local storage, unless it's secret or Remember Me is off
function savefield(name) {
  if (!field("rememberme").checked || securefields.includes(name) || (!checks[name] && !savedboxes.includes(name))) {
    return;
  }
  let value = field(name).value;
  if (field(name).type == "checkbox") {
    value = field(name).checked ? "1" : "0";
  }
  localStorage.setItem(savestart + name, value);
}

// The check boxes and the slider are saved too, even though they don't have a check of their own
const savedboxes = ["asthma", "diabetes", "bloodpressure", "heartdisease", "allergies", "healthscale"];

// Saves every answer that isn't secret, used when Remember Me is checked again
function saveall() {
  for (const name in checks) {
    savefield(name);
  }
  for (let i = 0; i < savedboxes.length; i++) {
    savefield(savedboxes[i]);
  }
}

// Puts the saved answers back in the form when the patient comes back
function loadanswers() {
  const names = Object.keys(checks).concat(savedboxes);
  for (let i = 0; i < names.length; i++) {
    const saved = localStorage.getItem(savestart + names[i]);
    if (saved == null || securefields.includes(names[i])) {
      continue;
    }
    const box = field(names[i]);
    if (box.type == "checkbox") {
      box.checked = saved == "1";
    } else {
      // Radio groups take the saved value and check the matching button
      box.value = saved;
    }
  }
}

// Removes every saved answer for this form from local storage
function forgetanswers() {
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(savestart) == 0) {
      localStorage.removeItem(keys[i]);
    }
  }
}

// Saves the first name cookie when the name is good and Remember Me is on
function savename() {
  if (field("rememberme").checked && checkfirstname() == "") {
    setcookie(cookiename, getvalue("firstname"), cookiehours);
  }
}

// Runs when Remember Me is checked or unchecked
function rememberchanged() {
  if (field("rememberme").checked) {
    savename();
    saveall();
  } else {
    deletecookie(cookiename);
    forgetanswers();
  }
}

// Shows the time left as minutes and seconds, and warns or clears the form when it runs out
function countdown() {
  secondsleft = secondsleft - 1;
  if (secondsleft <= 0) {
    clearfortime();
    return;
  }
  const minutes = Math.floor(secondsleft / 60);
  const seconds = secondsleft % 60;
  document.getElementById("timeleft").innerHTML = minutes + ":" + String(seconds).padStart(2, "0");
  if (secondsleft <= warnseconds) {
    document.getElementById("timeoutcount").innerHTML = secondsleft;
    document.getElementById("timeoutbox").hidden = false;
  }
}

// Any typing or clicking gives the patient the full time again, as long as the warning isn't up
function resettimer() {
  if (document.getElementById("timeoutbox").hidden) {
    secondsleft = formseconds;
  }
}

// The Continue button on the warning closes it and gives the patient the full time again
function keepgoing() {
  document.getElementById("timeoutbox").hidden = true;
  secondsleft = formseconds;
}

// Clears the form when time runs out, the same as Clear and Start Over, so nobody else sees it
function clearfortime() {
  document.getElementById("timeoutbox").hidden = true;
  document.forms["signup"].reset();
  secondsleft = formseconds;
  showstatus("Time ran out, so we cleared the form for your privacy.", "fail");
}

// The check for each field, looked up by the field's name
const checks = {
  firstname: checkfirstname,
  middleinit: checkmiddleinit,
  lastname: checklastname,
  dob: checkdob,
  ssn: checkssn,
  addr1: checkaddr1,
  addr2: checkaddr2,
  city: checkcity,
  state: checkstate,
  zip: checkzip,
  phone: checkphone,
  email: checkemail,
  userid: checkuserid,
  password1: checkpassword1,
  password2: checkpassword2,
  gender: checkgender,
  vaccinated: checkvaccinated,
  insurance: checkinsurance,
  symptoms: checksymptoms
};

// Checks one field while the patient is still typing in it and shows the result under it
function checknow(name) {
  showerror(name, checks[name]());
  // If the second password box is already filled in, check the match again too
  if (name == "password1" && field("password2").value != "") {
    showerror("password2", checkpassword2());
  }
}

// Runs when the patient leaves a field to clean it up, check it, show the result under it, and save it
function showresult(name) {
  tidy(name);
  checknow(name);
  savefield(name);
  if (name == "firstname") {
    savename();
  }
}

// Runs whenever anything on the form changes
function formchanged(event) {
  // A change means the last check is out of date, so Submit goes away until they validate again
  lockform();
  const name = event.target.name;
  // Check boxes and the slider are saved as soon as they change
  if (savedboxes.includes(name)) {
    savefield(name);
  }
  // Fields with their own oninput already checked themselves
  if (!checks[name] || event.target.getAttribute("oninput")) {
    return;
  }
  // If a message is showing for this field, check again right away so it clears as soon as it's fixed
  if (document.getElementById(name + "_error").innerHTML != "") {
    checknow(name);
  }
}

// Hides Submit so nothing can be sent without a fresh Review and Validate
function lockform() {
  const submitbutton = document.getElementById("submitbutton");
  if (formpassed) {
    showstatus("You changed something, so please click Review and Validate again.", "fail");
  }
  formpassed = false;
  submitbutton.hidden = true;
  submitbutton.disabled = true;
}

// Runs every check, shows each message under its field, and keeps the results for the review
function runchecks() {
  const results = {};
  for (let i = 0; i < textfields.length; i++) {
    tidy(textfields[i]);
  }
  for (const name in checks) {
    results[name] = checks[name]();
    showerror(name, results[name]);
  }
  return results;
}

// Joins the messages for fields that share one review line
function joinerrors(results, fields) {
  const messages = [];
  for (let i = 0; i < fields.length; i++) {
    if (results[fields[i]] != "") {
      messages.push(results[fields[i]]);
    }
  }
  return messages.join(" ");
}

// Builds one line of the review with the field, what was entered, and whether it passed
function reviewrow(label, value, error) {
  let status = "<td class='pass'>pass</td>";
  if (error != "") {
    status = "<td class='fail'>ERROR: " + error + "</td>";
  }
  return "<tr><td class='reviewlabel'>" + label + "</td><td>" + value + "</td>" + status + "</tr>";
}

// Gets the wording next to the radio button the patient picked
function radioanswer(name) {
  const buttons = field(name);
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].checked) {
      return labeltext(buttons[i].id);
    }
  }
  return "(not answered)";
}

// Shows Y or N for each medical history box
function checkboxanswer(name) {
  if (field(name).checked) {
    return "Y";
  }
  return "N";
}

// The Review and Validate button checks every field, shows it all below the form,
// counts the problems, and only brings out the Submit button when there are none
function reviewform() {
  const results = runchecks();
  const state = field("state");
  const ssn = getvalue("ssn").replace(/-/g, "");
  let name = cleantext(getvalue("firstname"));
  if (getvalue("middleinit") != "") {
    name = name + " " + cleantext(getvalue("middleinit"));
  }
  name = name + " " + cleantext(getvalue("lastname"));
  let address = cleantext(getvalue("addr1"));
  if (getvalue("addr2") != "") {
    address = address + "<br>" + cleantext(getvalue("addr2"));
  }
  address = address + "<br>" + cleantext(getvalue("city")) + ", " + state.value + " " + cleantext(getvalue("zip"));
  // Only the last 4 digits of a good SSN are shown, and a bad one isn't shown at all
  let ssnshown = "(hidden)";
  if (results.ssn == "") {
    ssnshown = "***-**-" + ssn.substring(5);
  }
  let symptoms = cleantext(getvalue("symptoms"));
  if (symptoms == "") {
    symptoms = "(none entered)";
  }
  const passwordshown = "*".repeat(field("password1").value.length) + " (hidden)";

  let output = "<h3>Please Review Your Information</h3>";
  output = output + "<table class='reviewtable'>";
  output = output + "<tr class='reviewhead'><th>Field</th><th>What You Entered</th><th>Check</th></tr>";
  output = output + reviewrow("First, MI, Last Name", name, joinerrors(results, ["firstname", "middleinit", "lastname"]));
  output = output + reviewrow(labeltext("dob"), cleantext(getvalue("dob")), results.dob);
  output = output + reviewrow(labeltext("ssn"), ssnshown, results.ssn);
  output = output + reviewrow("Address", address, joinerrors(results, ["addr1", "addr2", "city", "state", "zip"]));
  output = output + reviewrow(labeltext("phone"), cleantext(getvalue("phone")), results.phone);
  output = output + reviewrow(labeltext("email"), cleantext(getvalue("email")), results.email);
  output = output + "<tr><th colspan='3'>Health Information</th></tr>";
  output = output + reviewrow("Gender", radioanswer("gender"), results.gender);
  output = output + reviewrow("Vaccinations Up to Date?", radioanswer("vaccinated"), results.vaccinated);
  output = output + reviewrow("Health Insurance?", radioanswer("insurance"), results.insurance);
  output = output + reviewrow(labeltext("asthma"), checkboxanswer("asthma"), "");
  output = output + reviewrow(labeltext("diabetes"), checkboxanswer("diabetes"), "");
  output = output + reviewrow(labeltext("bloodpressure"), checkboxanswer("bloodpressure"), "");
  output = output + reviewrow(labeltext("heartdisease"), checkboxanswer("heartdisease"), "");
  output = output + reviewrow(labeltext("allergies"), checkboxanswer("allergies"), "");
  output = output + reviewrow(labeltext("healthscale"), field("healthscale").value + " out of 10", "");
  output = output + reviewrow(labeltext("symptoms"), symptoms, results.symptoms);
  output = output + "<tr><th colspan='3'>Account</th></tr>";
  output = output + reviewrow(labeltext("userid"), cleantext(getvalue("userid")), results.userid);
  output = output + reviewrow(labeltext("password1"), passwordshown, joinerrors(results, ["password1", "password2"]));
  output = output + reviewrow("Remember Me", checkboxanswer("rememberme"), "");
  output = output + "</table>";
  document.getElementById("review").innerHTML = output;

  // Counts the problems so the patient knows if they can submit yet
  let problems = 0;
  for (const name in results) {
    if (results[name] != "") {
      problems = problems + 1;
    }
  }
  const submitbutton = document.getElementById("submitbutton");
  if (problems == 0) {
    formpassed = true;
    submitbutton.hidden = false;
    submitbutton.disabled = false;
    showstatus("Everything checks out. Look over your answers below, then click Submit.", "pass");
  } else {
    formpassed = false;
    submitbutton.hidden = true;
    submitbutton.disabled = true;
    if (problems == 1) {
      showstatus("1 thing still needs fixing. It's marked in red above and in the review below.", "fail");
    } else {
      showstatus(problems + " things still need fixing. They're marked in red above and in the review below.", "fail");
    }
  }
  return problems;
}

// Submit runs the same checks one more time and only sends the form when nothing is wrong
function checkall() {
  const problems = reviewform();
  if (problems > 0) {
    return false;
  }
  // The name cookie and answers are saved one last time so we remember the patient next visit
  savename();
  saveall();
  return true;
}

// Clear and Start Over empties the review and every message, removes the saved answers, and hides Submit again
function startover() {
  // A reset would check Remember Me again, so we keep whatever the patient chose
  const remember = field("rememberme").checked;
  forgetanswers();
  document.getElementById("review").innerHTML = "";
  const messages = document.querySelectorAll(".error");
  for (let i = 0; i < messages.length; i++) {
    messages[i].innerHTML = "";
  }
  formpassed = false;
  lockform();
  showstatus("Click Review and Validate when you're done. Submit shows up once everything passes.", "");
  // The form resets after this runs, so the slider number and Remember Me wait a moment before updating
  setTimeout(function () {
    field("rememberme").checked = remember;
    showhealthscale();
  }, 0);
}

/* End of file: homework4.js */
