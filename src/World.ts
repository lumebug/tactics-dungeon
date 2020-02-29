import { GameView } from "./GameView"
import { observable, computed } from "mobx"
import { Cell } from "./Cell"
import { PointVector } from "./PointVector"
import _ = require("lodash")
import { Unit, Class, UnitStats, UnitSpec, Team } from "./Unit"

type AttackEvent = {
    type: 'attack'
    unit: Unit
    target: Unit
    damage: number
}

type MoveEvent = {
    type: 'move'
    unit: Unit
    from: Cell
    to: Cell
}

type EndMoveEvent = {
    type: 'endMove'
    unit: Unit
}

export type WorldEvent = AttackEvent | MoveEvent | EndMoveEvent

export class World {
    @observable grid: Cell[][] = []
    boardWidth: number = 6
    boardHeight: number = 8
    @observable eventLog: WorldEvent[] = []

    @computed get cells(): Cell[] {
        const cells: Cell[] = []
        for (let i = 0 ; i < this.boardWidth; i++) {
            for (let j = 0; j < this.boardHeight; j++) {
                cells.push(this.grid[i][j])
            }
        }
        return cells
    }

    @computed get units(): Unit[] {
        const units = []
        for (const cell of this.cells) {
            if (cell.unit)
                units.push(cell.unit)
        }
        return units
    }

    @computed get spawnableCells(): Cell[] {
        return this.cells.filter(c => c.pathable && !c.unit)
    }

    cellAt(pos: PointVector): Cell|undefined {
        if (pos.x < 0 || pos.y < 0 || pos.x >= this.grid.length || pos.y >= this.grid[0].length)
            return undefined
        else
            return this.grid[pos.x][pos.y]
    }

    spawnUnit(props: UnitSpec & { cell?: Cell, team: Team }): Unit {
        const cell = props.cell || _.sample(this.spawnableCells) as Cell
        const stats = new UnitStats(props)
        return new Unit(cell, stats, props.team)
    }

    event(event: WorldEvent) {
        this.eventLog.push(event)
    }

    constructor() {
        for (let x = 0; x < this.boardWidth; x++) {
            this.grid[x] = []
            for (let y = 0; y < this.boardHeight; y++) {
                this.grid[x][y] = new Cell(this, x, y)
            }
        }


    
        const cells = _.sampleSize(this.cells.filter(c => c.pathable), 5)
        this.spawnUnit({ team: Team.Player, class: Class.Rookie })
        this.spawnUnit({ team: Team.Player, class: Class.Rookie })
        this.spawnUnit({ team: Team.Player, class: Class.Rookie })
        this.spawnUnit({ team: Team.Player, class: Class.Rookie })


        this.spawnUnit({ team: Team.Enemy, class: Class.Skeleton })
        this.spawnUnit({ team: Team.Enemy, class: Class.Skeleton })
        this.spawnUnit({ team: Team.Enemy, class: Class.Skeleton })
        this.spawnUnit({ team: Team.Enemy, class: Class.Skeleton })
    }
}