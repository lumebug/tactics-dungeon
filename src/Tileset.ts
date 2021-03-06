import { ImageRefiner } from "./ImageRefiner"


export class Tileset {
    image: HTMLImageElement | ImageBitmap
    tileWidth: number
    tileHeight: number
    rows: number
    columns: number

    constructor(image: HTMLImageElement | ImageBitmap, tileWidth: number, tileHeight: number) {
        this.image = image
        this.tileWidth = tileWidth
        this.tileHeight = tileHeight

        const imgWidth = 'naturalWidth' in image ? image.naturalWidth : image.width
        const imgHeight = 'naturalHeight' in image ? image.naturalHeight : image.height
        this.columns = Math.ceil(imgWidth / tileWidth)
        this.rows = Math.ceil(imgHeight / tileHeight)
    }

    drawTile(ctx: CanvasRenderingContext2D, tileIndex: number, dx: number, dy: number, dWidth: number, dHeight: number) {
        const column = tileIndex % this.columns
        const row = Math.floor(tileIndex / this.columns)
        const sx = column * this.tileWidth
        const sy = row * this.tileHeight

        ctx.drawImage(this.image, sx, sy, this.tileWidth, this.tileHeight, dx, dy, dWidth, dHeight)
    }
}