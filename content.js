window.onload = function() {
  console.log("content script loaded window", document.location.toString());
//  var inn = document.getElementById("main_right").getElementsByClassName("inner")[1].children[1]; for older ui
  var action__items = document.getElementsByClassName('action__items')[0];
  var t = document.createTextNode("Ohayooo");
  var isbn = document.location.href.split('/')[4];
  action__items.appendChild(t);
  console.log(isbn);
  sendLinksToBackground(isbn);
};

document.onload = function() {
	console.log("HHHHH");
};

function sendLinksToBackground(isbn) {
  console.log("sending message from content to background");
  chrome.runtime.sendMessage({
      greeting: "hi background",
      isbn: isbn
    },
    function(response) {
      console.log(response.farewell);
    });
}