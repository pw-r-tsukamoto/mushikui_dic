(async function(){
	// 取得
	let translate_switch = await chrome.storage.local.get("translate_switch");
	let auth_key = await chrome.storage.local.get("auth_key");
	if(!/^\d+$/.test(translate_switch)){
		chrome.storage.local.set({translate_switch: 0});
		translate_switch = 0;
	}
	document.querySelector('input[name="translate_switch"][value="' + translate_switch + '"]').checked = true;
	if(auth_key.auth_key){
		document.querySelector('input[name="auth_key"]').value = auth_key.auth_key;
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
	
	shortcut.add("Alt+H", async function() {
		chrome.storage.local.get("translate_switch", function(val){
			let change = val.translate_switch == 1 ? 0 : 1;
			chrome.storage.local.set({"translate_switch": change});
		});
	});
})();