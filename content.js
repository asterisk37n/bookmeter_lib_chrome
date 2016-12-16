var LibStore = function(data){
	this.data = data;
	this.getLibName = function(query){
		for (var i in this.data) {
			if (this.data[i].libkey == query) {
				return this.data[i].formal;
			}
		}
		return query;
	}
};

var resultTable = {

	dom: {
		wrapper: null,
		table: null
	},
	status: "",
	rows: [],

	init: function(){
		this.dom.wrapper = document.createElement("div");
		this.dom.wrapper.setAttribute("class", "bm-details-side--add-border-bottom");
		this.dom.table = document.createElement("table");
		this.dom.table.setAttribute("class", "book-availability-table");
		this.dom.wrapper.appendChild(this.dom.table);

		this.appendMessageRow("Select a city");
		this.status = "INITIALIZED";
	},

	reflectResponse: function(res){
		if(!store){
			return;
		}
		if(this.status === "LOADING" || this.status === "INITIALIZED" || this.status === "NOTFOUND"){
			this.removeRow(this.rows.length - 1);
		}
		for (isbn in res.books) { // just one isbn is contained
			for (systemid in res.books[isbn]) {
				var libkeys = res.books[isbn][systemid].libkey;
				var url = res.books[isbn][systemid].reserveurl;
				for (libkey in libkeys) {
					if(libkey){
						var lib = new LibResult(libkey, libkeys[libkey], url);
						this.appendRow(lib);
					}
				}
			}
		}
		if(res.continue === 1){
			this.appendMessageRow("LOADING...");
			this.status = "LOADING";
		}else{
			if(this.rows.length === 0){
				this.status = "NOTFOUND";
				this.appendMessageRow("NOT STORED");
			}else{
				this.status = "COMPLETED";
			}
		}
	},

	appendRow: function(lib){
    		var tr = document.createElement("tr");
		var th = document.createElement("th");
    		th.innerHTML = lib.libName;
		var td = document.createElement("td");
		if(lib.url){
    			td.innerHTML = '<a href = '+lib.url+'>'+lib.availability+'</a>';
		}else{
			td.innerHTML = lib.availability;
		}
   		tr.appendChild(th);
    		tr.appendChild(td);
    		
		this.rows.push(lib);
		this.dom.table.appendChild(tr);
	},

	appendMessageRow: function(message){
    		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.setAttribute("colspan","2");
    		td.innerHTML = message;
    		tr.appendChild(td);
    		
		this.rows.push({message:message});
		this.dom.table.appendChild(tr);
	},

	removeRow: function(row_id){
		this.dom.table.removeChild(this.dom.table.childNodes[row_id]);
		this.rows.splice(row_id,1);
	},

	reset: function(){
		this.rows = [];
		if(this.dom.table) this.dom.table.innerHTML = "";
		this.appendMessageRow("LOADING...");
		this.status = "LOADING";
	},

	show: function(){
		var amazon = document.getElementsByClassName("detail__amazon")[0];
		amazon.parentNode.insertBefore(this.dom.wrapper, amazon);
	}
};
resultTable.init();
resultTable.show();

var LibResult = function(libkey, availability, url){

	this.libKey = libkey;
	this.libName = store.getLibName(libkey);
	this.availability = availability;
	this.url = url;

	return this;
};

function sendLibRequest(){

};

function sendBackgroundIsbn(isbn){
	chrome.runtime.sendMessage({
		greeting: "I am content",
		isbn: isbn
	}, function(response){
		if(response.status === "error") {
			console.log("API Error");
		}
	});
}

// recieve from background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "receiveBooks") {

      resultTable.reflectResponse(request.json);

      if (request.json.continue == 1) {
	resultTable.status = "LOADING";
        sendResponse({farewell: "request libraries again"});
      } else {
	resultTable.status = "COMPLETED";
        sendResponse({farewell: "goodbye"});
      }	
    } else if (request.greeting == "receiveLibrary") {
      store = new LibStore(request.json);
      resultTable.reset();
      sendBackgroundIsbn(isbn);
      sendResponse({farewell: "got json about library information"});
    }
  });

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
    }
  return JSON.stringify(obj) === JSON.stringify({});
}

console.log("I am content", document.location.toString());

var isbn = document.getElementsByClassName("detail__amazon")[0].getElementsByTagName("a")[0].href.split("/")[5];
var store;

resultTable.reset();
chrome.runtime.sendMessage({greeting: "LibRequest"}, function(response){
	if(response.status === "success"){
		store = new LibStore(response.json);
		sendBackgroundIsbn(isbn);
	}else if(response.status === "error"){
		console.log("API Error");
	}else if(response.status === "initialize"){
	}
});
