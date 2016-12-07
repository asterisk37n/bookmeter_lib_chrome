var city_selector = new CalilCitySelectDlg({
	'appkey' : '02e69dccae66fb1e1c4c0b5364bbfedc',
	'select_func' : on_select_city
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

city_selector.showDlg(); //ダイアログを出す
//city_selector.closeDlg(); //ダイアログを隠す