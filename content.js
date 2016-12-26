//////////GLOBAL VARIABLES//////////
console.log("start to load content.js");
var isbn;
var initialized;

/**
 * library store object
 */
var libStore = {
	data: null,
	isLoaded: false,
	loadData: function(data){
		this.data = data;
		if(data) this.isLoaded = true;
		console.log("lib list data loaded");
	},
	getLibName: function(query){
		for (var i in this.data) {
			if (this.data[i].libkey == query) {
				return this.data[i].formal;
			}
		}
		return query;
	}
};

/**
 * table object
 */
var resultTable = {
	
	dom: {
		wrapper: null,
		table: null
	},
	status: "", // INITIALIZING / LOADING / COMPLETED / BOOKS_NOT_STORED / PARAMS_NOT_FOUND / API_ERROR
	rows: [],
	initialized: false,
	hasMessage: false,

	init: function(){
		if(this.initialized) return;
		this.dom.wrapper = document.createElement("div");
		this.dom.wrapper.setAttribute("class", "bm-details-side--add-border-bottom");
		this.dom.table = document.createElement("table");
		this.dom.table.setAttribute("class", "book-availability-table");
		this.dom.wrapper.appendChild(this.dom.table);

		this.appendMessage("LOADING...");
		this.status = "INITIALIZING"; //TODO
		this.initialized = true;
	},

	hasLibResult: function(libkey){
		for(var lib of this.rows){
			if(lib.libKey === libkey) return true;
		}
		return false;
	},

	reflectResponse: function(res){
		if(this.hasMessage){
			this.pop();
			this.hasMessage = false;
		}
		if(!libStore.isLoaded){
			console.log("lib data not found");
			this.appendMessage("SELECT A CITY");
			this.status = "PARAMS_NOT_FOUND";
			return;
		}
		if(res.continue < 0){
			console.log("exceeded max request count");
			this.appendMessage("TIMEOUT");
			this.status = "COMPLETE";
			return;
		}
		for (isbn in res.books) { // just one isbn is contained
			for (systemid in res.books[isbn]) {
				var libkeys = res.books[isbn][systemid].libkey;
				var url = res.books[isbn][systemid].reserveurl;
				for (libkey in libkeys) {
					if(libkey && !this.hasLibResult(libkey)){
						var lib = new LibResult(libkey, libkeys[libkey], url);
						this.append(lib);
					}
				}
			}
		}
		if(res.continue === 1){
			this.appendMessage("LOADING...");
			this.status = "LOADING";
		}else if(res.continue === 0){
			if(this.rows.length === 0){
				this.status = "BOOKS_NOT_STORED";
				this.appendMessage("NOT STORED");
			}else{
				this.status = "COMPLETED";
			}
		}
	},

	append: function(lib){
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

	appendMessage: function(message){
    		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.setAttribute("colspan","2");
    		td.innerHTML = message;
    		tr.appendChild(td);
    		
		this.rows.push({message:message});
		this.dom.table.appendChild(tr);
		this.hasMessage = true;
	},

	pop: function(){
		this.dom.table.removeChild(this.dom.table.childNodes[this.rows.length-1]);
		this.rows.splice(this.rows.length-1,1);
	},

	reset: function(){
		this.rows = [];
		if(this.dom.table) this.dom.table.innerHTML = "";
		this.appendMessage("LOADING...");
		this.status = "LOADING";
		this.show();
		console.log("table has been reset");
	},

	show: function(){
		var amazon = document.getElementsByClassName("detail__amazon")[0];
		amazon.parentNode.insertBefore(this.dom.wrapper, amazon);
	}
};


//////////CLASS DEFINITION//////////

/**
 * table row class
 * @param {string} libkey
 * @param {string} availability
 * @param {string} url
 * @return this
 */
var LibResult = function(libkey, availability, url){

	this.libKey = libkey;
	this.libName = libStore.getLibName(libkey);
	this.availability = availability;
	this.url = url;

	return this;
};

//////////EVENT LISTENER//////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.greeting === "receiveBooks"){
		console.log("received books availability");
		resultTable.reflectResponse(request.json);
	}else if(request.greeting == "receiveLibrary"){
		libStore.loadData(request.json);
		resultTable.reset();
		if(isbn) sendBackgroundIsbn(isbn);
	}else if(request.greeting === "init"){ // this is called when url changed
		console.log("changeInfo.status has been become complete");
		if(!initialized) init();
		//TODO: replace this function with more appropriate one.
		//	I'm using this in order to invoke init() after loading new page.
		//	If we can handle the event, it's the best.
		else setTimeout(refresh, 2000);
	}else if(request.greeting === "debug"){
		console.log(request.message);
	}
});

//////////INITIAL PROCESS//////////

function init(){
	resultTable.init();
	console.log("lib request has been sent to background");
	chrome.runtime.sendMessage({greeting: "LibRequest"}, function(response){
		if(response.status === "SUCCESS"){
			libStore.loadData(response.json);
			if(isbn) sendBackgroundIsbn(isbn);
		}else if(response.status === "ERROR"){
			console.log("API Error");
		}else if(response.status === "PARAMS_NOT_FOUND"){ // called when appkey/pref/city info was not found
			if(resultTable.hasMessage)
				resultTable.pop();
			resultTable.appendMessage("SELECT A CITY");
			resultTable.status = "PARAMS_NOT_FOUND";
		}
	});
	if (document.location.pathname.match(/^\/books/)){
		refresh();
	}
	initialized = true;
}

//////////UTILITY FUNCTIONS//////////

function refresh(){
	isbn = document.getElementsByClassName("detail__amazon")[0].getElementsByTagName("a")[0].href.split("/")[5];
	resultTable.reset();
	if(initialized) sendBackgroundIsbn(isbn);
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
    }
  return JSON.stringify(obj) === JSON.stringify({});
}

function sendBackgroundIsbn(isbn){
	console.log("isbn:" + isbn + " has been sent to background");
	chrome.runtime.sendMessage({
		greeting: "I am content",
		isbn: isbn
	}, function(response){
		if(response.status === "ERROR") {
			console.log("API Error");
		}else if(response.status === "SUCCESS"){
			//TODO
		}
	});
}
