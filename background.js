// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
console.log('Bckground script started');
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  // chrome.tabs.executeScript({
  //    code: 'document.body.style.backgroundColor="red"'
  // });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ? "I got a message from a content script:" + sender.tab.url : "from the extension");
    if (request.greeting == "hi background") {
    	var isbn = request.isbn;
    	console.log(isbn);
     	sendResponse({farewell: "goodbye"});
    }
  }
);