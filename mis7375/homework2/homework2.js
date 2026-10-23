/*
Program name: homework2.js
Author: Brian Nwabuoku
Date created: 10/21/2026
Date last edited: 10/23/2026
Version: 1.1
Description: Checks the name and contact fields when the patient leaves them and shows a message next to anything that needs fixing.
I read form values by name, the same names in my data dictionary, and use IDs for the message spots and the date.
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
  email: checkemail
};

// Runs one field's check when the patient leaves the box and shows the result next to it
function showresult(name) {
  showerror(name, checks[name]());
}

/* End of file: homework2.js */
