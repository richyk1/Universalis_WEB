// All operations related to province handling
import { tiles } from "./tiles.json";

export interface Tile {
  readonly name: string,
  readonly borders: Border[],
  continent?: string,
  color?: [number, number, number],
}

export interface Border {
  readonly points: Point[]
}

export interface Point {
  readonly x: number,
  readonly y: number
}

var tilesGrouped: Tile[] = []
export function GetTiles(socket: SocketIOClient.Socket): Tile[] {
  if (tilesGrouped.length == 0) {
    for (const tileIndex in tiles) {
      var tileBorders: Border[] = [];
      for (const border of tiles[tileIndex]["borders"]) {
        var borderPoints: Point[] = []
        for (const point of border) {
          borderPoints.push({x: point[0], y: point[1]})
        }
        tileBorders.push({points: borderPoints});
      }

      var tile: Tile = {
        name: tiles[tileIndex]["name"],
        borders: tileBorders,
      }
   
      tilesGrouped.push(tile)
    }
  }
  return tilesGrouped
}