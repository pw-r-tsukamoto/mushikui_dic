(async function(){
	function getItem(key){
		return new Promise(function(resolve) {
			chrome.storage.local.get(key, function(res){
				resolve(res[key]);
			});
		});
	}
	// 取得
	let translate_switch = await getItem("translate_switch");
	let auth_key = await getItem("auth_key");
	if(!/^\d+$/.test(translate_switch)){
		chrome.storage.local.set({translate_switch: 0});
		translate_switch = 0;
	}
	document.querySelector('input[name="translate_switch"][value="' + translate_switch + '"]').checked = true;
	if(auth_key){
		document.querySelector('input[name="auth_key"]').value = auth_key;
	}
	// 入力値を変更したとき
	let modehtml = document.querySelectorAll('input[name="translate_switch"]');
	for(var i = 0; i < modehtml.length; i++){
		modehtml[i].addEventListener('change', function(){
			chrome.storage.local.set({translate_switch: this.value});
		});
	}
	let auth_key_html = document.querySelector('input[name="auth_key"]');
	auth_key_html.addEventListener('change', function(){
		chrome.storage.local.set({auth_key: this.value});
	});
})();