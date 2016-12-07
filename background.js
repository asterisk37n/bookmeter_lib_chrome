// Copyright (c) 2016 Naoki Watanabe and Shinya Onuma
// Use of this source code is governed by xxx license that can be
// found in the LICENSE file.

console.log('Bckground script started');
chrome.tabs.onUpdated.addListener(showIcon);
function showIcon(tabId, changeInfo, tab) {
 if (tab.url.match(/^https?:\/\/elk.bookmeter.com/) != null) {
 	chrome.pageAction.show(tabId);
 	console.log(changeInfo);
  };
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ? "I got a message from a content script:" + sender.tab.url : "from the extension");
    if (request.greeting == "I am content") {
    	var isbn = request.isbn;
    	console.log(isbn+" in background");
     	sendResponse({farewell: "goodbye"});
    } else if(request.greeting == "I am popup") {
        var systemid_list = request.systemid_list;
        var pref_name = request.pref_name;
        sendResponse({farewell: "bye bye"});
    }
  }
);
