// Copyright (c) 2016 Naoki Watanabe and Shinya Onuma
// Use of this source code is governed by xxx license that can be
// found in the LICENSE file.

console.log('Bckground script started');
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
        requestAPI(isbn);
     	sendResponse({
            farewell: "goodbye"
            // library information
        });
    } else if(request.greeting == "I am popup") {
        systemid_list = request.systemid_list;
        pref_name = request.pref_name;
        sendResponse({farewell: "bye bye"});
    }
  }
);

function requestAPI(isbn, systemid_list) {
    var url = "https://api.calil.jp/check?appkey=02e69dccae66fb1e1c4c0b5364bbfedc&isbn="+isbn+"&systemid="+"Aomori_Pref"+"&format=json";
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.addEventListener("load", function(r) {
        console.log(xhr.response);
        //calback
    })
    xhr.send(null);
}