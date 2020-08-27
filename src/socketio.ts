import * as continents from './continents.json'
import * as Tiles from "./public/javascripts/tiles";

export function ContinentHandler(client: SocketIOClient.Socket) {
    client.on("find_continent", function (data: Tiles.Tile[], callback: any) {
        data.forEach((currentTile: Tiles.Tile, index: number) => {

            if(continents.africa.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "africa";
                // data[index].color = [87, 147, 255]; // Blue
                data[index].color = 0x5793FF; // Blue
            }
            else if(continents.asia.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "asia";
                data[index].color = 0x8BE836; // Green
            }
            else if(continents.europe.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "europe";
                data[index].color = 0xFFC142; // Yellow
            }
            else if(continents.north_america.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "north_america";
                data[index].color = 0xE83938; // Red
            }
            else if(continents.south_america.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "south_america";
                data[index].color = 0xC100FF; // Purple
            }
            else if(continents.oceania.find((tile)  => 
            {
                return tile === currentTile.tileId;
            })) 
            {
                data[index].continent = "oceania";
                data[index].color = 0x595959; // Gray
            }
        })

        callback(data);
    });
};