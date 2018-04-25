require('dotenv').config();
var restify = require('restify');
var bb = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT, function(){
  console.log('%s listenning to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new bb.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Memory of the bot
var inMemoryStorage = new bb.MemoryBotStorage();
var bot = new bb.UniversalBot(connector, [
            function(session){
              // session.beginDialog('greetings', session.userData.profile);
              session.beginDialog('menu');
            },
            // function(session, results){
            //   session.userData.profile = results.response;
            //   session.send('Hello %s :) !!', session.userData.profile.name);
            // }
          ]).set('storage', inMemoryStorage);

// Dialog named 'greetings'
bot.dialog('greetings', [
  // Step 1
  // next = jump to the next step
  function(session, args, next) {
    session.dialogData.profile = args || {};
    if(!session.dialogData.profile.name)
    {
      bb.Prompts.text(session, 'What is your name ?');
    } else {
      next();
    }
  },
  // Step 2
  function(session, results) {
    if(results.response){
      session.dialogData.profile.name = results.response;
    }
    session.endDialogWithResult({ response: session.dialogData.profile });
  }
]);

// Object with all options
const menuItems= {
  "toto" : {
    item:"option1"
  },
  "titi" : {
    item:"option2"
  },
  "tata" : {
    item:"option3"
  }
};

bot.dialog('menu', [
  function(session){
    bb.Prompts.choice(session, "Choose an option from the list bellow",
    menuItems,
    {listStyle: 3});
  },
  function(session, results) {
    var choice = results.response.entity;
    session.beginDialog(menuItems[choice].item);
  }
]);

bot.dialog('option1', [
  function(session){
    session.send('We are in the option 1 dialog');
  }
]);

bot.dialog('option2', [
  function(session){
    session.send('We are in the option 2 dialog');
  }
]);

bot.dialog('option3', [
  function(session){
    session.send('We are in the option 3 dialog');
  }
]);
