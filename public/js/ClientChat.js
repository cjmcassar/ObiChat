//TODO - add variable (maybe just use email for fast build) from share design to friends from below

//CometChat code
// let uid = localStorage.getItem('uid');
let email = localStorage.getItem('email');
let FriendEmail = $('#DropdownFormEmail').val();

var chat_appid = '56012';
var chat_auth = 'e2f6f8e9f032eb8233b99b8e2e33cb9b';
var chat_id = email;
var chat_name = email;
// var chat_avatar = 'USER_AVATAR';
// var chat_link = 'USER_PROFILELINK';
var chat_friends = FriendEmail;

var chat_position = 'left';


(function()
{
  var chat_css = document.createElement('link');
  chat_css.rel = 'stylesheet';
  chat_css.type = 'text/css';
  chat_css.href = 'https://fast.cometondemand.net/' + chat_appid + 'x_xchat.css';
  document.getElementsByTagName("head")[0].appendChild(chat_css);
  var chat_js = document.createElement('script');
  chat_js.type = 'text/javascript';
  chat_js.src = 'https://fast.cometondemand.net/' + chat_appid + 'x_xchat.js';
  var chat_script = document.getElementsByTagName('script')[0];
  chat_script.parentNode.insertBefore(chat_js, chat_script);
})();

// const options = {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}};

// fetch('https://api.cometondemand.net/api/v2/addFriends', options)
//   .then(response => console.log(response))
//   .catch(err => console.error(err));

//LiveChat code
window.__lc = window.__lc ||
{};
window.__lc.license = 12486450;
(function(n, t, c)
{
  function i(n)
  {
    return e._h ? e._h.apply(null, n) : e._q.push(n);
  }
  var e = {
    _q: [],
    _h: null,
    _v: "2.0",
    on: function()
    {
      i(["on", c.call(arguments)]);
    },
    once: function()
    {
      i(["once", c.call(arguments)]);
    },
    off: function()
    {
      i(["off", c.call(arguments)]);
    },
    get: function()
    {
      if (!e._h) throw new Error("[LiveChatWidget] You can't use getters before load.");
      return i(["get", c.call(arguments)]);
    },
    call: function()
    {
      i(["call", c.call(arguments)]);
    },
    init: function()
    {
      var n = t.createElement("script");
      n.async = !0, n.type = "text/javascript", n.src = "https://cdn.livechatinc.com/tracking.js", t.head.appendChild(n);
    }
  };
  !n.__lc.asyncInit && e.init(), n.LiveChatWidget = n.LiveChatWidget || e
}(window, document, [].slice));