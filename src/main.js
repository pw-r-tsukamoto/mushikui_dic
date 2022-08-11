class Controler {
	constructor() {
		this.req_url = null;
		this.auth_key = null;
		this.translate_switch = 0;
		this.transToLang = null;
		this.positionX = 0;
		this.positionY = 0;
		this.wipe = this.setWipe();
		this.getInitFromStorage();
		this.setTriggers();
	}
	// ストレージから情報を取得。足りなければconfig.jsonからも取得
	async getInitFromStorage(){
		let self = this;
		let alldatas = await chrome.storage.local.get(null);
		self.req_url = alldatas.req_url;
		self.auth_key = alldatas.auth_key;
		self.translate_switch = alldatas.translate_switch;
		self.transToLang = alldatas.transToLang;
		// 値が欠けている場合、Configから足りないものだけを補う
		if(!self.req_url || !self.transToLang){
			let df1 = new Promise(function(resolve) {
				let req = new XMLHttpRequest();
				req.addEventListener("load", function(){
					if(this.status == 200 && this.readyState == XMLHttpRequest.DONE) {
						resolve(JSON.parse(this.responseText));
					}
				});
				req.open('GET', chrome.runtime.getURL('../config.json'), true);
				req.send();
			});
			df1.then(function(val){
				if(!self.req_url){
					self.req_url = val.req_url;
					chrome.storage.local.set({"req_url": val.req_url});
				}
				if(!self.transToLang){
					self.transToLang = val.lang;
					chrome.storage.local.set({"transToLang": val.lang});
				}
			});
		}
	}
	setWipe(){
		const bodyelement = document.querySelector('body');
		const wipeparent = document.createElement('div');
		wipeparent.style.position = 'relative';
		bodyelement.insertBefore(wipeparent, bodyelement.firstChild);

		const wipe = document.createElement('div');
		wipe.className = 'the_wipewindow_for_transrator';
		wipe.style.position = 'absolute';
		wipe.style.left = '100%';
		wipe.style.top = '100%';
		wipe.style.display = 'none';

		// 見た目のレイアウト
		wipe.style.border = '1px solid #585858';
		wipe.style.backgroundColor = '#ededed';
		wipe.style.padding = '0.1em 0.4em';

		wipe.addEventListener('copy', function(e){
			e.stopPropagation();
		});
		wipeparent.appendChild(wipe);
		return wipe;
	}
	showWipe(text){
		let self = this;
		let wipe = self.wipe;
		wipe.innerHTML = text;
		wipe.style.left = `${self.positionX}px`;
		wipe.style.top = `${self.positionY}px`;
		wipe.style.display = 'block';
		wipe.style.zIndex = '99999';

		const delbtn = document.createElement('span');
		delbtn.style.position = 'absolute';
		delbtn.style.right = '0';
		delbtn.style.top = '-15px';
		delbtn.style.width = '15px';
		delbtn.style.height = '15px';
		delbtn.style.backgroundColor = 'red';
		delbtn.style.display = 'block';
		delbtn.addEventListener('click', function(e){
			wipe.style.left = '100%';
			wipe.style.top = '100%';
			wipe.style.display = 'none';
			delbtn.removeEventListener('click', this);
		});
		wipe.appendChild(delbtn);
	}
	requestTransrate(text){
		let self = this;
		let req_url = self.req_url;
		let auth_key = self.auth_key;
		let lang = self.transToLang;
		return new Promise(function(resolve, f) {
			let req = new XMLHttpRequest();
			req.addEventListener("load", function(){
				if(this.status == 200 && this.readyState == XMLHttpRequest.DONE){
					let res = JSON.parse(this.responseText);
					resolve(res);
				}
			});
			req.open('POST', req_url, true);
			req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
			req.send(`auth_key=${auth_key}&text=${text}&target_lang=JA`);
		});
	}
	setTriggers(){
		let self = this;
		document.addEventListener('copy', async function(){
			// ページを開いた状態のまま値を変えているかもしれないので一度更新
			await self.getInitFromStorage();
			
			let errors = [];
			if(!self.req_url){
				errors.push('DeepL APIのリクエストURLがありません。config.jsonを確認してください');
			}
			if(!self.transToLang){
				errors.push('DeepL APIの翻訳先言語が設定されていません。config.jsonを確認してください');
			}
			if(!self.auth_key){
				errors.push('DeepLの認証キーがありません。設定してください');
			}
			
			if(self.translate_switch == 1){
				if(errors.length > 0){
					alert(errors.join('\n'));
				}else{
					let text = window.getSelection().toString();
					// 翻訳
					let res = await self.requestTransrate(text);
					let translated_text = res.translations[0].text;
					// 画面に反映
					self.showWipe(translated_text);
				}
			}
		});
		document.addEventListener('mousemove', function(event){
			self.positionX = event.pageX;
			self.positionY = event.pageY;
		});
	}
}
(function(){
	new Controler();
})();