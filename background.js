// Copyright (c) 2016 Naoki Watanabe and Shinya Onuma
// Use of this source code is governed by xxx license that can be
// found in the LICENSE file.

console.log('Bckground script started');
var app_key = "02e69dccae66fb1e1c4c0b5364bbfedc";
var isbn;
var systemid_list;
var pref_name;
chrome.tabs.onUpdated.addListener(showIcon);
function showIcon(tabId, changeInfo, tab) {
  if (tab.url.match(/^https?:\/\/elk.bookmeter.com/) != null) {
    chrome.pageAction.show(tabId);
  }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "I am content") {
        isbn = request.isbn;
        console.log(isbn);
        requestCheck(app_key,isbn,["Aomori_Pref"]);
     	sendResponse({
            farewell: "goodbye"
            // put library information
        });
    } else if(request.greeting == "I am popup") {
        systemid_list = request.systemid_list;
        pref_name = request.pref_name;
        sendResponse({farewell: "bye bye"});
    }
  }
);

function requestCheck(app_key, isbn, systemid_list) {
    var url = "https://api.calil.jp/check?appkey="+app_key+"&isbn="+isbn+"&systemid="+systemid_list.join(",")+"&format=json&callback=callback_check";
    console.log(url);
    var script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
};

function callback_check(json) {
    console.log(json);
};