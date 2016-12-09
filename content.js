function showTable(response){
  //This is a sample
  var response = { // this is a sample
  	libkey: {
		"Setagaya": "Available",
		"Tamagawadai": "Unavailable"
	}
  };
  var table_wrapper = document.createElement("div");
  var table = document.createElement("table");
  table_wrapper.setAttribute("class", "bm-details-side--add-border-bottom");
  table.setAttribute("class", "book-availability-table");
  table_wrapper.appendChild(table);
  
  for(var lib in response.libkey){
	  var tr = document.createElement("tr");
	  var th = document.createElement("th");
	  th.setAttribute("id", response.libkey[lib] + "_label");
	  th.innerHTML = lib;
	  var td = document.createElement("td");
	  td.setAttribute("headers", response.libkey[lib] + "_label");
	  td.innerHTML = response.libkey[lib];
	  tr.appendChild(th);
	  tr.appendChild(td);
	  table.appendChild(tr);
  }
  var amazon = document.getElementsByClassName("detail__amazon")[0];
  amazon.parentNode.insertBefore(table_wrapper, amazon);
}


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

var city_selector = new CalilCitySelectDlg({
	'appkey' : '02e69dccae66fb1e1c4c0b5364bbfedc',
	'select_func' : on_select_city
});

function sendBackgroundIsbn(isbn) {
  console.log("sending message from content to background");
  chrome.runtime.sendMessage({
      greeting: "I am content",
      isbn: isbn
    }, function(response){
	    if(response.farewell === "goodbye") {
		    showTable(response);
	    }else if(response.farewell === "error") {
		    console.log("can not get library information");
	    }else if(response.farewell === "initialize"){
		    console.log("initialize");
		    city_selector.showDlg();
	    }
    });
}

//window.onload = function() {
  console.log("content script loaded window", document.location.toString());
//  var inn = document.getElementById("main_right").getElementsByClassName("inner")[1].children[1]; for older ui
  var group__detail = document.getElementsByClassName('group__detail')[0];
  var t = document.createTextNode("Ohayooo");
  var isbn = document.location.href.split('/')[4];
  //action__items.appendChild(t);
  console.log(isbn);
  sendBackgroundIsbn(isbn);
//};

// recieve from background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });
