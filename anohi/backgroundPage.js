var tsv;
var previousQuery;
var notifications = {};

function getTsv() {
  var parseTsv = function(str, delimiter){
    if(!delimiter) delimiter = '\t'
    return str.split('\n').reduce(function(table,row){
      if(!table) return;
      table.push(
        row.split(delimiter).map(function(d){ return d.trim() }) //余白削除
      );
      return table;
    }, []);
  };
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://docs.google.com/spreadsheets/d/1Vhri9oSxuVJ0zkoO3-9Im2J0_JDmaazQC8OaCHaDPdY/export?format=tsv&id=1Vhri9oSxuVJ0zkoO3-9Im2J0_JDmaazQC8OaCHaDPdY&gid=0", true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      tsv = parseTsv(xhr.responseText);
      console.log("tsv lenght: " + tsv.length);
    }
  }
  xhr.send();
}

function onQuery(query) {
  if (query == undefined || tsv == undefined) {
    return;
  }
  console.log("query: " + query);
  var matches = [];
  for(var i = 0; i < tsv.length; i++ ){
    var entry = tsv[i];
    var text = entry[2];

    if (text.indexOf(query) != -1) {
      matches.push(entry);
    }
  }

  console.log(matches.length);

  _.forEach(_.sample(matches, 5), function(entry, index) {
    var id = entry[0];
    var timestamp = new Date(entry[1]);
    var text = entry[2];
    var user = entry[3];
    var timeString = timestamp.getFullYear() + "/" + timestamp.getMonth() + "/" + timestamp.getDay() +
      " " + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    var message = timeString + " のことです。" + user + " がいいました。\n" + text;
    console.log("tweet id: " + id);
    chrome.notifications.create("", {
      type: 'basic',
      iconUrl: 'icon_big.png',
      title: 'あの日のふたり',
      message: message,
      eventTime: Date.now() + index * 3600
    },function(notificationId) {
      console.log("notification created: " + notificationId);
      // 増えすぎたらリセットする
      if (notifications.length > 100) {
        notifications = {};
      }
      notifications[notificationId] = id;
    });
  });
}

chrome.notifications.onClicked.addListener(function(notificationId) {
  id = notifications[notificationId];
  console.log("notification clicked: " + notificationId);
  console.log("notification id: " + id);
  chrome.tabs.create({ url: "https://twitter.com/june29/status/" + id });
});

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    var query = request.query;
    if (previousQuery != query) {
      setTimeout(function(){ onQuery(query); }, 0);
    }
    previousQuery = query;
  }
);
getTsv();
