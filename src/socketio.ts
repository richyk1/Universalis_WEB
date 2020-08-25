import * as continents from './continents.json'
import * as Tiles from "./public/javascripts/tiles";

export function ContinentHandler(client: SocketIOClient.Socket) {
    client.on("find_continent", function (data: Tiles.Tile[], callback: any) {
        data.forEach((tile: Tiles.Tile, index: number) => {
            var adjustedIndex = index + 1;

            if(continents.africa.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "africa"
            else if(continents.asia.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "asia"
            else if(continents.europe.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "europe"
            else if(continents.north_america.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "north_america"
            else if(continents.south_america.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "south_america"
            else if(continents.oceania.find((tile)  => 
            {
                return tile === adjustedIndex;
            })) data[index].continent = "oceania"
        })

        callback(data);
    });
};