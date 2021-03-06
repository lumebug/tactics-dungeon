import { Tileset } from "./Tileset"
import { ImageRefiner } from "./ImageRefiner"
import { TileRef } from "./Tile"

export class Assets {
    world!: Tileset
    creatures!: Tileset
    grayscaleCreatures!: Tileset
    items!: Tileset
    iconitems!: Tileset
    imgRefiner: ImageRefiner

    constructor() {
        this.imgRefiner = new ImageRefiner()
    }

    async loadImage(url: string): Promise<ImageBitmap> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = url
            img.onload = () => {
                this.imgRefiner.editImage(img).bitmap().then(bmap => resolve(bmap))
            }
        })
    }

    async load() {
        const [world, creatures, items] = await Promise.all([
            this.loadImage('oryx_16bit_fantasy_world_trans.png'),
            this.loadImage('oryx_16bit_fantasy_creatures_trans.png'),
            this.loadImage('oryx_16bit_fantasy_items_trans.png')
        ])

        this.world = new Tileset(world, 24, 24)
        this.creatures = new Tileset(creatures, 24, 24)
        this.items = new Tileset(items, 16, 16)

        const grayscale = await this.imgRefiner.edit(creatures).grayscale().bitmap()
        this.grayscaleCreatures = new Tileset(grayscale, 24, 24)


        const iconic = await this.imgRefiner.edit(items).purewhite().bitmap()
        this.iconitems = new Tileset(iconic, 16, 16)
    }

    getTileset(tilesetId: string) {
        const tileset = (this as any)[tilesetId] as Tileset | undefined
        if (!tileset) {
            throw new Error(`No such tileset ${tilesetId}`)
        }
        return tileset
    }

    tileToDataUrl(tile: TileRef): string {
        const tileset = this.getTileset(tile.tilesetId)
        const { canvas, ctx } = this.imgRefiner
        canvas.width = tileset.tileWidth
        canvas.height = tileset.tileHeight
        tileset.drawTile(ctx, tile.index, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL()
    }
}