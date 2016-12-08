window.onload = function() {
  console.log("content script loaded window", document.location.toString());
//  var inn = document.getElementById("main_right").getElementsByClassName("inner")[1].children[1]; for older ui
  var group__detail = document.getElementsByClassName('group__detail')[0];
  var t = document.createTextNode("Ohayooo");
  var isbn = document.location.href.split('/')[4];
  group__detail.appendChild(t);
  console.log(isbn);
  sendLinksToBackground(isbn);
};

function sendLinksToBackground(isbn) {
  console.log("sending message from content to background");
  chrome.runtime.sendMessage({
      greeting: "I am content",
      isbn: isbn
    },
    function(response) {
      console.log(response.farewell);
    });
}

// recieve from background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });