class Controler {
	constructor() {
		this.positionX = 0;
		this.positionY = 0;
		this.wipe = this.setWipe();
		this.req_url = null;
		this.auth_key = null;
		this.mode = null;
		this.getInit(this);
		this.setTriggers(this);
	}
	getItem(key){
		return new Promise(function(resolve) {
			chrome.storage.local.get(key, function(res){
				resolve(res[key]);
			});
		});
	}
	// 必要情報を取得
	async getInit(self){
		this.req_url = await this.getItem("req_url");
		this.auth_key = await this.getItem("auth_key");
		this.mode = await this.getItem("translate_switch");
		if(!self.req_url || !self.auth_key){
			let promise = new Promise(function(resolve) {
				let req = new XMLHttpRequest();
				req.addEventListener("load", function(){
					if(this.status == 200 && this.readyState == XMLHttpRequest.DONE) {
						resolve(JSON.parse(this.responseText));
					}
				});
				req.open('GET', chrome.runtime.getURL('config.json'), true);
				req.send();
			});
			promise.then(function(val){
				if(val.auth_key){
					// setItem auth_key
					self.auth_key = val.auth_key
				}
				if(val.req_url){
					// setItem auth_key
					self.req_url = val.req_url
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
	setTriggers(self){
		document.addEventListener('copy', async function(){
			let errors = [];
			if(!self.req_url){
				errors.push('DeepL APIのリクエストURLがありません');
			}
			if(!self.auth_key){
				errors.push('DeepLの認証キーがありません。設定してください');
			}
			if(self.mode == 1){
				console.log('q');
				if(errors.length > 0){
					alert(errors.join('\n'));
				}else{
					console.log('b');
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