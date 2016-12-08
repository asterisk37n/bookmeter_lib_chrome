// Copyright (c) 2016 Naoki Watanabe and Shinya Onuma
// Use of this source code is governed by xxx license that can be
// found in the LICENSE file.

console.log('Bckground script started');

var app_key = "02e69dccae66fb1e1c4c0b5364bbfedc";
var isbn;
var systemid_list;
var pref_name;
var response;

chrome.tabs.onUpdated.addListener(showIcon);
function showIcon(tabId, changeInfo, tab) {
  if (tab.url.match(/^https?:\/\/elk.bookmeter.com/) != null) {
    chrome.pageAction.show(tabId);
  }
};

chrome.storage.sync.get(["systemid_list", "pref_name"], function(result) {
  systemid_list = result.systemid_list;
  pref_name = result.pref_name;
  console.log('storage '+systemid_list+pref_name);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "I am content") {
      isbn = request.isbn;
      requestCheck(app_key,isbn,["Aomori_Pref"]);
      sendResponse({
        farewell: "goodbye",
        response: response
      });
    } else if(request.greeting == "I am popup") {
      systemid_list = request.systemid_list;
      pref_name = request.pref_name;
      saveChanges(systemid_list, pref_name);
      sendResponse({
        farewell: "bye bye",
      });
    }
  }
);

// send to content
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});

function requestCheck(app_key, isbn, systemid_list) {
    var url = "https://api.calil.jp/check?appkey="+app_key+"&isbn="+isbn+"&systemid="+systemid_list.join(",")+"&format=json&callback=callbackCheck";
    console.log(url);
    var script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
};

function callbackCheck(json) {
  console.log(json);
  // check if json['continue'] == 1
};

function saveChanges(systemid_list, pref_name) {
  if (!systemid_list || !pref_name) {
    return;
  }
  chrome.storage.sync.set({'systemid_list': systemid_list, 'pref_name': pref_name}, function() {
    console.log('successfully saved: '+systemid_list+pref_name);
  });
}
