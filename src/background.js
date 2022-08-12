let badgeObj = {
  0: {
    color: "red",
    switch: "OFF"
  },
  1: {
    color: "green",
    switch: "ON"
  }
};

chrome.storage.local.get("translate_switch", function(res){
  let curval = res.translate_switch;
  chrome.action.setBadgeBackgroundColor({color: badgeObj[curval].color });
  chrome.action.setBadgeText({ text: badgeObj[curval].switch });
});

chrome.storage.onChanged.addListener(function(changes, area) {
  if("translate_switch" in changes){
    let newval = changes.translate_switch.newValue;
    chrome.action.setBadgeBackgroundColor({color: badgeObj[newval].color });
    chrome.action.setBadgeText({ text: badgeObj[newval].switch });
    
  }
});