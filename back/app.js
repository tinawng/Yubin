require('dotenv').config();
var fs = require('fs');
const SMTPServer = require("smtp-server").SMTPServer;
const simpleParser = require('mailparser').simpleParser;
const got = require('got');

const api = got.extend({
    prefixUrl: process.env.API_URL,
    headers: { 'secret': process.env.API_SECRET }
});


function onData(stream, session, callback) {
    simpleParser(stream).then(parsed => {
        fs.writeFile(`mails/${Date.now()}.json`, JSON.stringify(parsed), 'utf8', () => { })
        api.post('mail', { json: parsed, responseType: 'json' });
    }).catch(err => { console.log(err); });

    stream.on("data", function (chunk) {
    });

    stream.on("end", function () {
        console.log("end");
        callback();
    });

    stream.on("close", function () {
        console.log("close");
    });

    stream.on("error", function (error) {
        console.log("error", error);
    });
}

function onAuth(auth, session, streamCallback) {
}

function onMailFrom(address, session, streamCallback) {
    console.log("onMailFromo@address: ", address);
    streamCallback();
}

function onRcptTo(address, session, streamCallback) {
    console.log("onRcptTo@address: ", address);
    streamCallback();
}

const server = new SMTPServer({
    banner: "tina.cafe smtp server",
    logger: false,
    disabledCommands: ["AUTH"],
    onData: onData,
    onAuth: onAuth,
    onMailFrom: onMailFrom,
    onRcptTo: onRcptTo
    // SSL: https://github.com/Flolagale/mailin/issues/127
});

server.listen(process.env.SRV_PORT, "0.0.0.0", function (err) {
    if (!err) {
        console.log(
            "NodeMailin Smtp server listening on port " + process.env.SRV_PORT
        );
    } else {
        callback(err);
        console.log(
            "Could not start server on port " + process.env.SRV_PORT + "."
        );
        if (process.env.SRV_PORT < 1000) {
            console.log("Ports under 1000 require root privileges.");
        }
        console.log(err.message);
    }
});

server.on("close", function () {
    console.log("Closing smtp server");
});

server.on("error", function (error) {
    if (error.code == "ETIMEDOUT")
        console.log(error);
    else if (error.code == "ECONNRESET")
        console.log(error);
    else
        console.log(error);
});