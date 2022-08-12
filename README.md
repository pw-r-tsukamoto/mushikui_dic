# honyaku


    // 仕様：
    // 選択すると、その個所を自動的に翻訳する


タスク
- ブラウザアクションにCSS実装
- ホットキーの実装　Fn+T
- ON/OFFがアイコンでわかるように



## 知識集

- mainifest.jsonの書き方
    - content_scriptsがメイン。ここの「match」と書かれたURLに一致したとき、"js"の中身が上から順番に読まれる。


- manifest_version v3 での書き方
    - chrome.browserAction.setBadgeBackgroundColor({color: modecolor});
    - chrome.action.setBadgeBackgroundColor({color: modecolor});
    - browserAction を　actionに変更
