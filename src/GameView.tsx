import * as React from 'react'
import { observer, useObserver } from 'mobx-react-lite'

import { Game } from './Game'
import { TitleScreen } from './TitleScreen'
import { useContext, useEffect } from 'react'
import { UI } from './UI'
import { CanvasBoard } from './CanvasBoard'
import { BoardFooter } from './BoardFooter'
import { World } from './World'
import { FloorCleared } from './FloorCleared'
import { PeepBadge } from './PeepBadge'
import { Unit } from './Unit'
import { action } from 'mobx'
import { Peep } from './Peep'

export const GameContext = React.createContext<{ game: Game, ui: UI, world: World }>({} as any)

const BoardHeader = observer(function BoardHeader() {
    return <header/>
})

const BoardCanvas = observer(() => {
    const { game, ui } = useContext(GameContext)
    const canvasRef = React.createRef<HTMLCanvasElement>()

    let board: CanvasBoard|null = null
    useEffect(() => {
        // Set the canvas 
        if (!board && canvasRef.current) {
            board = new CanvasBoard(game, canvasRef.current)
            ui.time.add(board)
        }

        return () => {
            if (board) {
                ui.time.remove(board)
                board = null
            }
        }
    })

    return <canvas ref={canvasRef} id="board"></canvas>
})

function DungeonScreen() {
    const { ui } = useContext(GameContext)

    const nextFloor = () => ui.goto('board')
    const gotoTeam = () => ui.goto('team')

    return <div className="DungeonScreen">
        <div className="d-flex mt-4 justify-content-center">
            <button className="td-btn" onClick={nextFloor}>
                Next Floor
            </button>
            <button className="td-btn" onClick={gotoTeam}>
                Team
            </button>
        </div>
    </div>
}

function TeamScreen() {
    const { ui, world } = useContext(GameContext)

    const gotoPeep = (peep: Peep) => {
        ui.goto({ type: 'peep', peep: peep })
    }

    return <div className="TeamScreen d-flex justify-content-center mt-4">
        <table className="unitReports">
            <tbody>
                {world.playerUnits.map((unit, i) => <tr key={i} onClick={() => gotoPeep(unit.peep)}>
                    <td><PeepBadge peep={unit.peep}/> {unit.peep.name}</td>
                    <td><span className="levelUp">Level Up!</span></td>
                </tr>)}
            </tbody>
        </table>
    </div>
}

function UnitScreen(props: { peep: Peep }) {
    const { ui, world } = useContext(GameContext)
    const { peep } = props

    const changeName = action((e: React.ChangeEvent<HTMLInputElement>) => {
        peep.name = e.currentTarget.value
    })

    return useObserver(() => <div className="UnitScreen d-flex justify-content-center mt-4">
        <header className="d-flex align-items-center">
            <PeepBadge peep={peep}/>
            <div>
                <input className="name" type="text" value={peep.name} onChange={changeName}/>
                <br/><span className={`unitClass ${peep.class}`}>{peep.class}</span>
                {}
            </div>
            {peep.canPromote && <button>Promote Unit</button>}
        </header>
    </div>)
}


const CurrentScreen = observer(function CurrentScreen() {
    const { ui, world } = useContext(GameContext)

    useEffect(() => ui.goto({ type: 'peep', peep: world.playerUnits[0].peep }), [])

    if (ui.state.type === 'titleScreen') {
        return <TitleScreen/>
    } else if (ui.state.type === 'dungeon') {
        return <DungeonScreen/>
    } else if (ui.state.type === 'team') {
        return <TeamScreen/>
    } else if (ui.state.type === 'peep') {
        return <UnitScreen peep={ui.state.peep}/>
    } else {
        return <>
            <BoardHeader/>
            <BoardCanvas/>
            <BoardFooter/>
            {ui.state.type === 'floorCleared' && <FloorCleared/>}
        </>
    }    
})

export const GameView = observer(function GameView(props: { game: Game }) {
    const { game } = props
    const { ui } = game

    useEffect(() => {
        ui.time.start()
        return () => ui.time.stop()
    })

    const context = { game: game, ui: ui, world: game.world }

    return <GameContext.Provider value={context}>
        <CurrentScreen/>
    </GameContext.Provider>
})