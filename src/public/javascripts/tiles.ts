// All operations related to province handling
import { provinces } from "./tiles.json";

export interface ITile
{
    readonly points: IPoint[]
}

export interface IPoint
{
    readonly x: number,
    readonly y: number,
}

var tiles: IPoint[][] = []
export function GetTiles(): IPoint[][] {
    if(tiles.length == 0)
    {
        for (const tile in provinces)
        {
            var points: IPoint[] = []
            var counter: number = 1
            for (const key of Object.keys(provinces[tile])) {
                for(const point in provinces[tile][key])
                {
                    points.push(
                        {
                            x: Number(provinces[tile][key][point][0]),
                            y: Number(provinces[tile][key][point][1])
                        }
                    )
                }
             }
            
            counter++
            tiles.push(points)
        }
    }
    return tiles
}