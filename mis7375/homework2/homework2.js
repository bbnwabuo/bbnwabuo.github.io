/*
Program name: homework2.js
Author: Brian Nwabuoku
Date created: 10/21/2026
Date last edited: 10/23/2026
Version: 1.0
Description: Fills in today's date, loads the state list, and shows the slider's number as it moves on the Bayou City Family Health registration form.
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

// Shows the slider's number next to the bar as it moves
function showhealthscale() {
  const scale = field("healthscale").value;
  document.getElementById("healthvalue").innerHTML = scale + " out of 10";
}

/* End of file: homework2.js */
