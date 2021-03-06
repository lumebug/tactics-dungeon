import * as React from 'react'
import { useContext, useEffect } from 'react'
import { observer, useObserver } from 'mobx-react-lite'
import { runInAction, action } from 'mobx'
import _ = require('lodash')

import { Game } from './Game'
import { TitleScreen } from './TitleScreen'
import { UI } from './UI'
import { CanvasBoard } from './CanvasBoard'
import { BoardFooter } from './BoardFooter'
import { BoardHeader } from './BoardHeader'
import { World } from './World'
import { FloorCleared } from './FloorCleared'
import { HelpOverlay } from './HelpOverlay'
import { ActiveFloor } from './Floor'
import { PeepScreen } from './PeepScreen'
import { TeamScreen } from './TeamScreen'
import { MessageLog } from './MessageLog'
import { PeepUpgradeOverlay } from './PeepUpgradeOverlay'
import { FloorIntroOverlay } from './FloorIntroOverlay'
import { DungeonScreen } from './DungeonScreen'

export const GameContext = React.createContext<{ game: Game, ui: UI, world: World }>({} as any)
export const FloorContext = React.createContext<{ ui: UI, world: World, floor: ActiveFloor, board: CanvasBoard }>({} as any)

function BoardCanvas() {
    const { ui, floor } = useContext(FloorContext)
    const canvasRef = React.createRef<HTMLCanvasElement>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        runInAction(() => {
            ui.board = new CanvasBoard(floor, ui, canvas)
            ui.time.add(ui.board)
        })

        return () => {
            runInAction(() => {
                ui.time.remove(ui.board!)
                ui.board = undefined
            })
        }
    }, [])

    return <canvas ref={canvasRef} id="board"></canvas>
}


function CurrentScreen() {
    const { ui, world } = useContext(GameContext)

    // useEffect(() => ui.goto({ type: 'peep', peep: world.team[0] }), [])

    return useObserver(() => {
        if (ui.screen.id === 'titleScreen') {
            return <TitleScreen />
        } else if (ui.screen.id === 'dungeon') {
            return <DungeonScreen />
        } else if (ui.screen.id === 'team') {
            return <TeamScreen />
        } else if (ui.screen.id === 'peep') {
            return <PeepScreen peepId={ui.screen.peepId} tab={ui.screen.tab} />
        } else {
            if (!world.floor)
                throw new Error(`No floor for screen ${ui.screen.id}`)
            const context = { ui: ui, world: world, floor: world.floor, board: ui.board! }
            return <FloorContext.Provider value={context}>
                <BoardHeader />
                <div className="boardContainer">
                    <BoardCanvas />
                    {/* <MessageLog /> */}
                </div>
                <BoardFooter />
                {ui.screen.id === 'floorCleared' && <FloorCleared />}
                {ui.screen.id === 'upgrade' && <PeepUpgradeOverlay peepId={ui.screen.peepId} />}
                {ui.screen.id === 'floorIntro' && <FloorIntroOverlay />}
                {ui.screen.id === 'help' && <HelpOverlay />}
            </FloorContext.Provider>
        }
    })
}

export function GameView(props: { game: Game }) {
    const { game } = props
    const { ui } = game

    useEffect(() => {
        ui.time.start()
        return () => ui.time.stop()
    })

    const context = { game: game, ui: ui, world: game.world }

    return <GameContext.Provider value={context}>
        <CurrentScreen />
    </GameContext.Provider>
}