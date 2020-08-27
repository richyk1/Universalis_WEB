// All operations related to province handling
import { tiles } from "./tiles.json";
import * as THREE from 'three';

export interface Tile {
    readonly name: string,
    readonly tileId: number,
    readonly borders: Border[],
    continent?: string,
    color?: number
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
                    borderPoints.push({ x: point[0], y: point[1] })
                }
                tileBorders.push({ points: borderPoints });
            }

            var tile: Tile = {
                name: tiles[tileIndex]["name"],
                tileId: tiles[tileIndex]["tileId"],
                borders: tileBorders,
            }

            tilesGrouped.push(tile)
        }
    }
    return tilesGrouped
}

class TextMesh extends THREE.Mesh {
    public wWorldTxt: number | undefined;
    public wPxTxt: number | undefined;
    public wPxAll: number | undefined;
    public hPxAll: number | undefined;
    public ctx: CanvasRenderingContext2D | undefined;
    public wWorldAll: number | undefined;
}

export function dcText(txt: string, hWorldTxt: number, hWorldAll: number, hPxTxt: number, fgcolor: number, bgcolor?: number) {
    // txt is the text.
    // hWorldTxt is world height of text in the plane.
    // hWorldAll is world height of whole rectangle containing the text.
    // hPxTxt is px height of text in the texture canvas; larger gives sharper text.
    // The plane and texture canvas are created wide enough to hold the text.
    // And wider if hWorldAll/hWorldTxt > 1 which indicates padding is desired.
    const kPxToWorld = hWorldTxt / hPxTxt * 0.1;                // Px to World multplication factor
    // hWorldTxt, hWorldAll, and hPxTxt are given; get hPxAll
    const hPxAll = Math.ceil(hWorldAll / kPxToWorld);     // hPxAll: height of the whole texture canvas
    // create the canvas for the texture
    const txtcanvas = document.createElement("canvas"); // create the canvas for the texture
    const ctx = txtcanvas.getContext("2d");
    if (ctx) {

        ctx.font = hPxTxt + "px sans-serif";
        // now get the widths
        const wPxTxt = ctx.measureText(txt).width;         // wPxTxt: width of the text in the texture canvas
        const wWorldTxt = wPxTxt * kPxToWorld;               // wWorldTxt: world width of text in the plane
        const wWorldAll = wWorldTxt + (hWorldAll - hWorldTxt); // wWorldAll: world width of the whole plane
        const wPxAll = Math.ceil(wWorldAll / kPxToWorld);    // wPxAll: width of the whole texture canvas
        // next, resize the texture canvas and fill the text
        txtcanvas.width = wPxAll;
        txtcanvas.height = hPxAll;
        if (bgcolor != undefined) { // fill background if desired (transparent if none)
            ctx.fillStyle = "#" + bgcolor.toString(16).padStart(6, '0');
            ctx.fillRect(0, 0, wPxAll, hPxAll);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#" + fgcolor.toString(16).padStart(6, '0'); // fgcolor
        ctx.font = hPxTxt + "px sans-serif";   // needed after resize
        ctx.fillText(txt, wPxAll / 2, hPxAll / 2); // the deed is done

        // Texture creation
        const texture = new THREE.Texture(txtcanvas); // now make texture
        texture.minFilter = THREE.LinearFilter;     // eliminate console message
        texture.needsUpdate = true;                 // duh
        // and make the world plane with the texture
        const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(wWorldAll, hWorldAll);
        const material = new THREE.MeshBasicMaterial(
            { side: THREE.DoubleSide, map: texture, transparent: true, opacity: 1.0 });
        // and finally, the mesh
        const mesh = new TextMesh(geometry, material);
        mesh.wWorldTxt = wWorldTxt; // return the width of the text in the plane
        mesh.wWorldAll = wWorldAll; //    and the width of the whole plane
        mesh.wPxTxt = wPxTxt;       //    and the width of the text in the texture canvas
        // (the heights of the above items are known)
        mesh.wPxAll = wPxAll;       //    and the width of the whole texture canvas
        mesh.hPxAll = hPxAll;       //    and the height of the whole texture canvas
        mesh.ctx = ctx;             //    and the 2d texture context, for any glitter

        // console.log(wPxTxt, hPxTxt, wPxAll, hPxAll);
        // console.log(wWorldTxt, hWorldTxt, wWorldAll, hWorldAll);
        return mesh;
    }

}