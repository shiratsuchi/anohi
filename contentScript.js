function postQuery(query) {
  if (query == "") {
    return;
  }
  console.log(query);
  chrome.extension.sendMessage({query: query});
}

var input = $("input[name='q']");

// フォームに入力するたび
input.on("input", _.debounce(function() {
  var query = input.val();
  postQuery(query);
}, 500));

// 初回読み込み
setTimeout(function(){
  var query = input.val();
  postQuery(query);
}, 500);
