import { Block } from "./MapBase"
import { BOARD_ROWS, BOARD_COLS } from "./settings"
import { Biome } from "./TileDef"
import _ = require("lodash")
import { ActiveFloor } from "./Floor"
import { Cell } from "./Cell"
import { PointVector } from "./PointVector"
import { Peep } from "./Peep"
import { Team } from "./Unit"
import { RNG } from "./RNG"
import { PeepKindDefOf } from "./PeepKindDef"

function randomBlocks(rng: RNG): Block[] {
    if (rng.random() > 0.8) {
        return [Block.Floor, Block.Wall]
    } else {
        return [Block.Floor]
    }
}

export type MapgenOpts = {
    peeps: Peep[]
}

export function generateMap(floor: ActiveFloor, opts: MapgenOpts) {
    const rng = new RNG(floor.seed)
    // const biome = rng.sampleEnum(Biome)
    floor.biome = Biome.SkullHedge

    const [width, height] = [BOARD_COLS, BOARD_ROWS]

    // Start with some empty cells
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const pos = new PointVector(i, j)
            const cell = Cell.create(floor, { pos, blocks: [] })
            floor.cells.push(cell)
        }
    }

    const upstairCell = rng.sample(floor.cells)
    upstairCell.blocks = [Block.Floor, Block.UpStair]

    const downstairCell = rng.sampleBest(floor.cells, c => Math.min(height, c.pos.manhattanDistance(upstairCell.pos)))
    downstairCell.blocks = [Block.Floor, Block.DownStair]

    // let cell = rng.sampleFind(map.cells, cell => cell.pathable)
    // if (cell) {
    //     cell.add(Chest.create(Potion.create("healing")))
    // }

    // cell = rng.sampleFind(map.cells, cell => cell.pathable)
    // if (cell) {
    //     cell.add(Potion.create("healing"))
    // }

    let enemies = 4
    for (const cell of _.sortBy(floor.cells, c => c.pos.manhattanDistance(downstairCell.pos))) {
        if (cell === downstairCell) continue

        cell.blocks = [Block.Floor]
        floor.spawnUnit(Peep.create({ kind: PeepKindDefOf.Skeleton }), { cell: cell, team: Team.Enemy })
        enemies--
        if (enemies === 0) break
    }

    const peeps = [...opts.peeps]
    for (const cell of _.sortBy(floor.cells, c => c.pos.manhattanDistance(upstairCell.pos))) {
        if (cell === upstairCell) continue

        const peep = peeps.pop()
        if (!peep) break

        cell.blocks = [Block.Floor]
        floor.spawnUnit(peep, { cell: cell, team: Team.Player })
    }

    for (const cell of floor.cells) {
        if (!cell.blocks.length)
            cell.blocks = randomBlocks(rng)
    }
}