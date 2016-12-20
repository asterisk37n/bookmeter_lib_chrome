// Copyright (c) 2016 Naoki Watanabe and Shinya Onuma
// Use of this source code is governed by xxx license that can be
// found in the LICENSE file.

console.log("Bckground script started");

//////////GLOBAL VARIABLES//////////
const app_key = "02e69dccae66fb1e1c4c0b5364bbfedc";
const baseURL = "https://api.calil.jp/";
const MAX_REQUEST_COUNT = 5;
var systemid_list;
var pref_name;
var pref;
var city;
var count;

//////////INITIAL PROCESS//////////
chrome.storage.sync.get(["systemid_list", "pref_name"], function(result){
	if(!result.systemid_list || !result.pref_name) return;
	systemid_list = result.systemid_list;
	pref_name = result.pref_name;
	prefcity = splitPref(pref_name); //split into prefucturec and city
	pref = prefcity[0];
	city = prefcity[1];
	console.log("loaded from storage");
	console.log(systemid_list);
	console.log(pref_name, pref+" "+city);
});

//////////EVENT LISTENER//////////
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.greeting === "I am content"){
		if(!pref_name || !request.isbn){
			sendResponse({
				status: "ERROR",
				message: "PARAMS_NOT_FOUND"
			});
			return;
		}
		requestCheck(app_key, request.isbn, systemid_list);
		sendResponse({status: "SUCCESS"}); //TODO:
	}else if(request.greeting === "I am popup"){
	  	systemid_list = request.systemid_list;
		pref_name = request.pref_name;
		prefcity = splitPref(pref_name);
		pref = prefcity[0];
		city = prefcity[1];
		saveChanges(systemid_list, pref_name);
		requestLibrary(app_key, pref, city, function(response){
			sendContentJson("receiveLibrary", response);
		});
	}else if(request.greeting === "LibRequest"){
		if(app_key && pref && city){
			requestLibrary(app_key, pref, city, function(response){
				sendResponse({
					status: "SUCCESS",
					json: response
				});
			});
		}else{
			sendResponse({
				status: "PARAMS_NOT_FOUND"
			});
		}
	}
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){ // icon is visible on elk.bookmeter.com
	if(tab.url.match(/^https?:\/\/elk.bookmeter.com/)){
		chrome.pageAction.show(tabId);
	}
	if(changeInfo.status === "complete"){
		sendContentJson("init", "tab updated"); //TODO: 
	}
});

//////////XHR FUNCTIONS//////////

function requestCheck(app_key, isbn, systemid_list){
	count = 0;
	var param = {
		appkey: app_key,
		isbn: isbn,
		systemid: systemid_list.join(",")
	};
	baseRequest("check", param, function(response){
		sendContentJson("receiveBooks", response);
		if(response.continue === 1){
			setTimeout(function(){
				requestPolling(app_key, response.session)
			}, 2000);
		}
	});
}

function requestLibrary(app_key, pref, city, callback) {
	var param = {
		appkey: app_key,
		pref: pref,
		city: city
	}
	baseRequest("library", param, callback);
}

function requestPolling(app_key, session){
	count++;
	if(count >= MAX_REQUEST_COUNT){
		sendContentJson("receiveBooks", {continue: -1});
	       	return;
	}
	var param = {
		appkey: app_key,
		session: session
	};
	baseRequest("check", param, function(response){
		sendContentJson("receiveBooks", response);
		if(response.continue === 1){
			setTimeout(function(){
				requestPolling(app_key, response.session)
			}, 2000);
		}
	});
}

function baseRequest(type, param, callback){
	var url = baseURL + type + "?";
	if(param){
		for(var i in param){
			url += i + "=" + param[i] + "&";
		}
	}
	url += "format=json&callback=";
	if(type === "check") url += "no";
	var xhr = new XMLHttpRequest();

	// do it synchronously to avoid to return a response to content.js before receiving the response. 
	// Chrome warns a sync request but it's not problem because the client side process can work asynchronously.
	xhr.open("GET", url, false); 
	xhr.onload = function(e){
		if(xhr.readyState === 4){
			if(xhr.status === 200){
				if(callback)
					callback(JSON.parse(xhr.response));
			}else{
				//TODO: error handling
			}
		}
	};
	xhr.send();
}

//////////UTILITY FUNCTIONS//////////

function splitPref(pref_name){
	var l = "都道府県".split("");
	for(var i=0; i<l.length; i++){
		pre = l[i];
		ix = pref_name.indexOf(pre);
		if(ix > 0){
			pref = pref_name.substring(0,ix+1);
			city = pref_name.substring(ix+1);
			return [pref, city];
		} 
	}
}

function sendContentJson(greeting, message){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {greeting: greeting, json: message});
	});
}

function saveChanges(systemid_list, pref_name){
	if(!pref_name) return;
	chrome.storage.sync.set({
		"systemid_list": systemid_list,
		"pref_name": pref_name
	}, function(){
		console.log("successfully saved: "+systemid_list+pref_name);
	});
}

// Deprecated: use setTimeout
function sleep(delay){
	var start = new Date().getTime();
	while (new Date().getTime() - start < delay) {};
}
