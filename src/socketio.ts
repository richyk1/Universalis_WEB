export function ContinentHandler(client: SocketIOClient.Socket) {
    client.on("find_continent", function (data: any) {
        console.log("Received data", data);

        client.emit("found_continent", {message: "siers"});
    });
};