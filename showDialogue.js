var city_selector = new CalilCitySelectDlg({
	'appkey' : 'your app key',
	'select_func' : on_select_city
});
function on_select_city(systemid_list, pref_name){
	console.log(systemid_list, pref_name) //FireBugで表示
}

city_selector.showDlg(); //ダイアログを出す
//city_selector.closeDlg(); //ダイアログを隠す
