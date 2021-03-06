import { Assets } from "./Assets"
import { observable, action } from "mobx"
import { World } from "./World"
import { TimeReactor } from "./TimeReactor"
import { CanvasBoard } from "./CanvasBoard"
import { Soundboard } from "./soundboard"
import { MusicTracks } from "./music"

export type PeepScreenRef = {
    id: 'peep'
    peepId: string
    tab: 'equipment' | 'abilities'
}

export type SimpleScreenId = 'titleScreen' | 'chooseTeam' | 'dungeon' | 'board' | 'enemyPhase' | 'event' | 'floorCleared' | 'team' | 'help' | 'floorIntro'
export type ScreenRef = { id: SimpleScreenId } | PeepScreenRef | { id: 'upgrade', peepId: string }

export class UI {
    @observable screen: ScreenRef = { id: 'titleScreen' }
    @observable.ref board?: CanvasBoard
    time: TimeReactor

    constructor(readonly world: World, readonly assets: Assets, readonly sounds: Soundboard, readonly music: MusicTracks) {
        this.time = new TimeReactor()
        this.music.floor.play()
    }

    @action goto(screen: SimpleScreenId | ScreenRef) {
        if (typeof screen === "string")
            this.screen = { id: screen }
        else
            this.screen = screen
    }
}