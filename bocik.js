// include
var tmi = require('tmi.js');
var statRequest = require('request');

var szMessage = "";

var options = { // config połączenia do twitch.tv
	options: {
		debug:true
	},

	connection: {
		cluster: "aws",
		reconnect: true
	},

	identity: {
		username:"USERNAME",
		password: "oauth_key"
	},

	channels: ["garewin"]
}; // end options

var client = new tmi.client(options);
client.connect();

client.on('connected', function(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
});

// komenda !stats
client.on('chat', function(channel, user, message, self) {
	var msg = message.slice(0, 6);
	if (msg === '!stats')
	{
		var userHandle
		if (message.length == 6) userHandle = "SayLeepey";
		else {
			msg = message.slice(7, message.length)
			var firstSpace = msg.indexOf(" ");
			if (firstSpace != -1) userHandle = msg.slice(0, firstSpace);
			else userHandle = msg;
			console.log(userHandle);
		}
		var initPromise = initStatRequest(userHandle);
		initPromise.then(function(result) {
			if (result.data != undefined)
			{
				var dataName = result.data.metadata.platformUserHandle;
				if (result.data.stats[0] != undefined) var dataLevel = result.data.stats[0].value; 
				else dataLevel = "N/A";
				if (result.data.stats[1] != undefined) var dataKills = result.data.stats[1].value; 
				else dataKills = "N/A";
				if (result.data.stats[1] != undefined) var dataRank = result.data.stats[1].rank; 
				else dataRank = "N/A";
				szMessage = "Statystyki gracza " + dataName + ": Level: " + dataLevel + ", Kills: " + dataKills + ", Rank: " + dataRank + ". Zobacz pełne statystyki na https://apex.tracker.gg/profile/pc/" +dataName;
				client.say(channel, "" + szMessage);
			}
		}) // end initPromise
	}
}); // end komenda !stats

function initStatRequest(userHandle) {
    var options = {
        url: "https://public-api.tracker.gg/apex/v1/standard/profile/5/" + userHandle,
        headers: {
            "TRN-Api-Key": "dc8ae989-94d1-432f-bd5a-c7386853b52a"
        }
    };
    return new Promise(function(resolve, reject) {
        statRequest.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
                console.log("couldn't fetch. error: " + err)
            } else {
                resolve(JSON.parse(body));
            }
        })
    }) // end promise
} // end initStatRequest