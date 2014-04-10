
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var Request = require("sdk/request").Request;
var URL = require("sdk/url").URL;
var Notifications = require("sdk/notifications");

var server = "http://bleed-1161785939.us-east-1.elb.amazonaws.com/bleed/";

 // should enable or disable checking with three states
  // 0 - don't check
  // 1 - check async
  // 2 - block load until check is completed.
var appstate = 0;
var state = 0;
var states = [ "inactive", "checking sites", "blocking sites"];
var state_msg = [
 "While disabled, Foxbleed doesn't leak any information.",
 "While enabled, Foxbleed sends each hostname you access to your configured test server while allowing you to load the page.",
 "While blocking Foxbleed sends each hostname you access to your configured test server before allowing a page to load."
];
var state_icons = [ "./disabled.png", "./enabled.png", "./blocking.png"];
var alert_icons = [ "disabled-64.png", "enabled-64.png", "blocking.png"];



var ui = require("sdk/ui");



var action_button = ui.ActionButton({
  id: "heart-button",
  label: "Heartbleed Detection",
  icon: "./disabled.png",
  onClick: function(state) {
    console.log("Changed state to " + states[appstate]);
    appstate += 1;
    // Don't have a blocking strategy yet.
    if (appstate > 1) { appstate = 0;}

    action_button.icon = state_icons[appstate];
    Notifications.notify(
    { 
      title: 'Heartbleed detection is ' + states[appstate],
      text: state_msg[appstate],
      iconURL : self.data.url(alert_icons[appstate])
    }
    );
  }
});

require("sdk/tabs").on("ready", onReady);





function onReady(tab)
{
  var port = URL(tab.url).port;
  var domain = URL(tab.url).hostname + (port == null ? "" : ":"+URL(tab.url).port);

  checkBleed(domain);
}

function checkBleed(domain) {
  if (appstate == 1) {
    try {
      
      console.log("Checking domain " + domain)
      var xhr = Request({
        url: server + domain,
        overrideMimeType: "application/json",
        onComplete: function (response) {
          var o = response.json;
          if (o.code === 0) {
            Notifications.notify({
              title: domain + ' is vulnerable!',
              text: 'This domain is vulnerable to the Heartbleed SSL bug.',
              iconURL: self.data.url("vulnerable-64.png")
            }
            );
          }
        }
      });
      xhr.get();
    } catch (e) {
      console.log(e);
    }
  }
}
