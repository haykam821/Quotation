const Discord = require("discord.io");
const bot = new Discord.Client({
	autorun: true,
	token: "YOUR TOKEN HERE!",
});

const Vibrant = require("node-vibrant");

/**
 * Gets a RGB component from a string.
 * @param {String} numStr The component number as a string.
 * @param {boolean} percent Whether the number should be out of 100 rather than 255.
 * @returns {number} The RGB component.
 */
function componentFromStr(numStr, percent) {
	const num = Math.max(0, parseInt(numStr, 10));
	return percent ?
		Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}

/**
 * Converts a RGB string to its respective hexadecimal string.
 * @param {String} rgb The RGB string.
 * @returns {String} The hexadecimal string.
 */
function rgbToHex(rgb) {
	const rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
	let result;
	let r;
	let g;
	let b;
	let hex = "";
	if ((result = rgbRegex.exec(rgb))) {
		r = componentFromStr(result[1], result[2]);
		g = componentFromStr(result[3], result[4]);
		b = componentFromStr(result[5], result[6]);

		hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	return hex;
}

bot.on("message", function(user, userID, channelID, message) {
	if (message === "ping") {
		bot.sendMessage({
			message: "pong",
			to: channelID,
		});
	}

	if (message.startsWith(">eval ")) {
		bot.sendMessage({
			/* eslint-disable-next-line no-eval */
			message: eval(message.replace(">eval ", "")),
			to:channelID,
		});
	}
});

bot.on("any", function(event) {
	try {
		if (event.t == "MESSAGE_REACTION_ADD" && event.d.emoji.name == "📝" && event.d.user_id == bot.id) {
			bot.removeReaction({
				channelID: event.d.channel_id,
				messageID: event.d.message_id,
				reaction: "📝",
			});

			bot.getMessages({
				before: event.d.message_id,
				channelID: event.d.channel_id,
				limit: 1,
			}, (error, messages) => {
				if (error) return;

				const message1 = messages[0].id;
				bot.getMessages({
					after: message1,
					channelID: event.d.channel_id,
					limit: 1,
				}, (subError, subMessages) => {
					if (subError) return;

					const message = subMessages[0];
					const user = bot.users[message.author.id];
					const imageUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;

					Vibrant.from(imageUrl).getPalette().then(palette => {
						try {
							const rgb = palette.Vibrant._rgb;
							const rgbStr = `rgb(${rgb.join(",")})`;
							const hex = rgbToHex(rgbStr);

							const time = message.edited_timestamp == null ? message.timestamp : message.edited_timestamp;

							bot.sendMessage({
								embed: {
									author: {
										/* eslint-disable-next-line camelcase */
										icon_url: imageUrl,
										name: `${message.author.username}#${message.author.discriminator}`,
									},
									color: parseInt(hex),
									description: message.content,
									timestamp: time,
								},
								// Message: ':thinking: Congratulations! This is a placeholder for the quote function! ' + hex,
								to: event.d.channel_id,
							});
						} catch (error_) {
							return;
						}
					});
				});
			});
		}
	} catch (error) {
		return;
	}
});
