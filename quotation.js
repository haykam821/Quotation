var Discord = require('discord.io');
var bot = new Discord.Client({
    autorun: true,
    token: "YOUR TOKEN HERE!"
});

var Vibrant = require('node-vibrant');

function componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
        Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}

function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);

        hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
}

bot.on('message', function(user, userID, channelID, message, event) {
    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }

    if (message.startsWith(">eval ")){
      bot.sendMessage({
        to:channelID,
        message: eval(message.replace(">eval ",""))
      })
    }
});

bot.on('any', function(event) {
  try {
    if (event.t == 'MESSAGE_REACTION_ADD' && event.d.emoji.name == '📝' && event.d.user_id == bot.id) {
      bot.removeReaction({
        channelID: event.d.channel_id,
        messageID: event.d.message_id,
        reaction: '📝'
      });

      var message = {};
      var message1 = '';
      bot.getMessages(
        {before: event.d.message_id, channelID: event.d.channel_id, limit: 1},
        function(e,m){
          message1 = m[0].id;
          bot.getMessages(
            {after: message1, channelID: event.d.channel_id, limit: 1},
            function(e,m){
              message = m[0];
              console.log(message)
              var user = bot.users[message.author.id];
              var imageUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;

              Vibrant.from(imageUrl).getPalette().then(function(p){
                try{
                palette = p;
                var rgb = palette['Vibrant']['_rgb']
                var rgbStr = `rgb(${rgb.join(',')})`;
                var hex = rgbToHex(rgbStr);

                var time = message.edited_timestamp == null ? message.timestamp : message.edited_timestamp;

                  bot.sendMessage({
                    to: event.d.channel_id,
                    //message: ':thinking: Congratulations! This is a placeholder for the quote function! ' + hex,
                    embed: {timestamp: time,author: {name: `${message.author.username}#${message.author.discriminator}`, icon_url: imageUrl}, description: message.content, color: parseInt(hex)}
                  })
                }catch(e){
                  console.log(e)
                }
              })
            }
          );
        }
      )
    }
  } catch (e) {
    console.log(e)
  }
});
