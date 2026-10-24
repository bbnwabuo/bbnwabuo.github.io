/*
Program name: homework2.js
Author: Brian Nwabuoku
Date created: 10/21/2026
Date last edited: 10/23/2026
Version: 1.3
Description: Checks the form, shows a message next to anything that needs fixing, shows the patient's answers in Review, and only lets Submit through when everything passes.
I read form values by name, the same names in my data dictionary, and use IDs for the message spots, the review area, and the date.
*/

// Runs when the page opens: today's date, the state list, and the slider number
function startform() {
  document.getElementById("today").innerHTML = new Date().toLocaleDateString();
  loadstates();
  showhealthscale();
}

// Gets a field from the signup form by its name attribute, the same name the server will get
function field(name) {
  return document.forms["signup"].elements[name];
}

// Gets a field's value with the extra spaces trimmed off the ends
// and puts the trimmed value back in the box so the HTML check sees the same thing
function getvalue(name) {
  const box = field(name);
  box.value = box.value.trim();
  return box.value;
}

// Shows a message in the spot next to a field, or clears it when the message is empty
// The message spots aren't data, so they're found by ID
function showerror(name, message) {
  document.getElementById(name + "_error").innerHTML = message;
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

// First name: required, 1 to 30 characters, letters, apostrophes, and dashes only
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

// Middle initial: optional, but if it's there it has to be one letter
function checkmiddleinit() {
  const middleinit = getvalue("middleinit");
  if (middleinit != "" && !/^[A-Za-z]$/.test(middleinit)) {
    return "Middle initial has to be one letter.";
  }
  return "";
}

// Last name: required, letters, apostrophes, dashes, and the numbers 2 to 5 for a suffix
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

// Date of birth: a real MM/DD/YYYY date, not in the future, and not more than 120 years ago
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
  // The limits come from today's date, the same date shown in the banner
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

// SSN: 9 digits, and dashes are fine if the patient types them
function checkssn() {
  const ssn = getvalue("ssn");
  if (ssn == "") {
    return "Social Security number is required.";
  }
  if (!/^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/.test(ssn)) {
    return "SSN needs 9 digits. Dashes are optional.";
  }
  return "";
}

// Address line 1: required, 2 to 30 characters
function checkaddr1() {
  const addr1 = getvalue("addr1");
  if (addr1 == "") {
    return "Address line 1 is required.";
  }
  if (addr1.length < 2 || addr1.length > 30) {
    return "Address line 1 needs 2 to 30 characters.";
  }
  return "";
}

// Address line 2: optional, but if it's filled in it follows the same rule as line 1
function checkaddr2() {
  const addr2 = getvalue("addr2");
  if (addr2 != "" && (addr2.length < 2 || addr2.length > 30)) {
    return "Address line 2 needs 2 to 30 characters, or leave it blank.";
  }
  return "";
}

// City: required, 2 to 30 characters
function checkcity() {
  const city = getvalue("city");
  if (city == "") {
    return "City is required.";
  }
  if (city.length < 2 || city.length > 30) {
    return "City needs 2 to 30 characters.";
  }
  return "";
}

// State: the patient has to pick one, since the list starts on Select
function checkstate() {
  if (field("state").value == "") {
    return "Please pick a state.";
  }
  return "";
}

// Zip: 5 digits or ZIP+4, and we keep just the first 5 digits and show them back
function checkzip() {
  const zipbox = field("zip");
  const zip = zipbox.value.trim();
  if (zip == "") {
    return "Zip code is required.";
  }
  if (!/^[0-9]{5}(-[0-9]{4})?$/.test(zip)) {
    return "Zip code needs 5 digits, like 77004 or 77004-1234.";
  }
  zipbox.value = zip.substring(0, 5);
  return "";
}

// Phone: 10 digits, and we show it back as 000-000-0000
function checkphone() {
  const phonebox = field("phone");
  const phone = phonebox.value.trim();
  if (phone == "") {
    return "Phone number is required.";
  }
  if (!/^\(?[0-9]{3}\)?[ .\-]?[0-9]{3}[ .\-]?[0-9]{4}$/.test(phone)) {
    return "Phone number needs 10 digits, like 713-555-1212.";
  }
  const digits = phone.replace(/[^0-9]/g, "");
  phonebox.value = digits.substring(0, 3) + "-" + digits.substring(3, 6) + "-" + digits.substring(6);
  return "";
}

// Email: has to look like name@domain.tld
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

// User ID: 5 to 30 characters, starts with a letter, no spaces, and saved in lowercase
function checkuserid() {
  const useridbox = field("userid");
  const userid = useridbox.value.trim();
  if (userid == "") {
    return "User ID is required.";
  }
  if (/\s/.test(userid)) {
    return "User ID can't have spaces.";
  }
  if (/^[0-9]/.test(userid)) {
    return "User ID can't start with a number.";
  }
  if (!/^[A-Za-z][A-Za-z0-9_\-]{4,29}$/.test(userid)) {
    return "User ID needs 5 to 30 letters, numbers, underscores, or dashes.";
  }
  useridbox.value = userid.toLowerCase();
  return "";
}

// Password: checked as the patient types, so they can see what's still missing
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

// Re-enter password: has to match the first password box
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

// Radio groups: the patient has to pick one answer in each group
function checkradio(name, message) {
  // All the buttons in a group share one name, so the group's value is the one picked
  if (field(name).value == "") {
    return message;
  }
  return "";
}

// Symptoms: optional, but no double quotes since they can break the database later
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
  symptoms: checksymptoms
};

// Runs one field's check when the patient leaves the box and shows the result next to it
function showresult(name) {
  showerror(name, checks[name]());
  // If the second password box is already filled in, check the match again too
  if (name == "password1" && field("password2").value != "") {
    showresult("password2");
  }
}

// Runs every check, shows each message next to its field, and keeps the results for the review
function runchecks() {
  const results = {
    firstname: checkfirstname(),
    middleinit: checkmiddleinit(),
    lastname: checklastname(),
    dob: checkdob(),
    ssn: checkssn(),
    addr1: checkaddr1(),
    addr2: checkaddr2(),
    city: checkcity(),
    state: checkstate(),
    zip: checkzip(),
    phone: checkphone(),
    email: checkemail(),
    userid: checkuserid(),
    password1: checkpassword1(),
    password2: checkpassword2(),
    gender: checkradio("gender", "Please pick a gender."),
    vaccinated: checkradio("vaccinated", "Please answer the vaccination question."),
    insurance: checkradio("insurance", "Please answer the insurance question."),
    symptoms: checksymptoms()
  };
  for (const name in results) {
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

// The Review button: checks everything and shows it all below the form
function reviewform() {
  const results = runchecks();
  const state = field("state");
  const ssn = getvalue("ssn").replace(/-/g, "");
  let name = cleantext(getvalue("firstname"));
  if (getvalue("middleinit") != "") {
    name = name + " " + cleantext(getvalue("middleinit")).toUpperCase();
  }
  name = name + " " + cleantext(getvalue("lastname"));
  let address = cleantext(getvalue("addr1"));
  if (getvalue("addr2") != "") {
    address = address + "<br>" + cleantext(getvalue("addr2"));
  }
  let statecode = "";
  if (state.value != "") {
    statecode = state.value;
  }
  address = address + "<br>" + cleantext(getvalue("city")) + ", " + statecode + " " + cleantext(getvalue("zip"));
  let ssnshown = "";
  if (ssn.length >= 4) {
    ssnshown = "***-**-" + ssn.substring(ssn.length - 4);
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
  output = output + "</table>";

  // Counts the problems so the patient knows if they can submit yet
  let problems = 0;
  for (const field in results) {
    if (results[field] != "") {
      problems = problems + 1;
    }
  }
  if (problems == 0) {
    output = output + "<p class='pass'>Everything looks good. Click Submit to send your registration.</p>";
  } else {
    output = output + "<p class='fail'>Please fix the " + problems + " item(s) marked ERROR, then click Review again.</p>";
  }
  document.getElementById("review").innerHTML = output;
  return problems;
}

// Submit: runs the same checks and only sends the form when nothing is wrong
function checkall() {
  const problems = reviewform();
  if (problems > 0) {
    document.getElementById("review").scrollIntoView();
    return false;
  }
  return true;
}

// Clear and Start Over: empties the review and every message
function startover() {
  document.getElementById("review").innerHTML = "";
  const messages = document.querySelectorAll(".error");
  for (let i = 0; i < messages.length; i++) {
    messages[i].innerHTML = "";
  }
  // The form resets after this runs, so the slider number waits a moment before updating
  setTimeout(showhealthscale, 0);
}

/* End of file: homework2.js */
