console.log("I am content", document.location.toString());
var isbn = document.getElementsByClassName("detail__amazon")[0].getElementsByTagName("a")[0].href.split("/")[5];
console.log(isbn);
sendBackgroundIsbn(isbn);

var libjson;

var city_selector = new CalilCitySelectDlg({
	"appkey" : "02e69dccae66fb1e1c4c0b5364bbfedc",
	"select_func" : on_select_city
});

// recieve from background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from extension");
    console.log(request.greeting);
    if (request.greeting == "receiveBooks") {
      console.log(request.json);
      if (request.json.continue == 1) {
        sendResponse({farewell: "request libraries again"})
        return;
      }
      var libs_to_show = makeDataFromJson(request.json);
      console.log(libs_to_show);
      if (!isEmpty(libs_to_show)) {
        showTable(libs_to_show);        
      } else {
        showTable({any_library: "book not available"})
      }
      sendResponse({farewell: "goodbye"}); 
    } else if (request.greeting == "receiveLibrary") {
      libjson = request.json;
      console.log(libjson);
      sendResponse({farewell: "got json about library information"});
    }
  });

function on_select_city(systemid_list, pref_name){
	console.log(systemid_list, pref_name); //FireBugで表示
    chrome.runtime.sendMessage(
        {greeting: "I am popup",
         systemid_list: systemid_list,
         pref_name: pref_name},
        function(response) {
            console.log(response.farewell);
        }
    );
}

function showTable(response){
  //This is a sample
  if (response == null) {
    response = { // this is a sample
        "Setagaya": {availability:"Available",reserveurl:"http://sample.com"},
        "Tamagawadai": {availability:"Unavailable",reserveurl:"http://sample2.com"}
    };
  }
  var table_wrapper = document.createElement("div");
  var table = document.createElement("table");
  table_wrapper.setAttribute("class", "bm-details-side--add-border-bottom");
  table.setAttribute("class", "book-availability-table");
  table_wrapper.appendChild(table);
  
  for (var lib in response) {
	  var tr = document.createElement("tr");
	  var th = document.createElement("th");
	  th.setAttribute("id", response[lib] + "_label");
	  th.innerHTML = lib;
	  var td = document.createElement("td");
	  td.setAttribute("headers", response[lib] + "_label");
	  td.innerHTML = response[lib].availability;
	  tr.appendChild(th);
	  tr.appendChild(td);
	  table.appendChild(tr);
  }
  var amazon = document.getElementsByClassName("detail__amazon")[0];
  amazon.parentNode.insertBefore(table_wrapper, amazon);
}

function sendBackgroundIsbn(isbn) {
  console.log("sending message from content to background");
  chrome.runtime.sendMessage({
      greeting: "I am content",
      isbn: isbn
    }, function(response){
	    if(response.farewell === "goodbye") {
//		  showTable(response);
          console.log("background received isbn");
	    }else if(response.farewell === "error") {
		  console.log("can not get library information");
	    }else if(response.farewell === "initialize"){
          console.log("initialize");
          city_selector.showDlg();
	    }
    });
}

function makeDataFromJson(json) {
  var libs_to_show ={};
  for (isbn in json.books) { // just one isbn is contained
    for (systemid in json.books[isbn]) {
      var libkeys = json.books[isbn][systemid].libkey;
      for (libkey in libkeys) {
        if (libkey) {
          var availability = libkeys[libkey];
          var formal = getFormalnameFromLibkey(libjson, libkey);
          var reserveurl = json.books[isbn][systemid].reserveurl;
          libs_to_show[formal] = {availability:availability, reserveurl:reserveurl};
        }
      }
    }
  }
  return libs_to_show;
}

function getFormalnameFromLibkey(json, libkey) {
  for (var i=0; i<json.length; i++) {
    if (json[i].libkey == libkey) {
      return json[i].formal;
    }
  }
  return libkey;
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
  return JSON.stringify(obj) === JSON.stringify({});
}