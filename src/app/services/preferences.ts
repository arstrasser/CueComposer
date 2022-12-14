import { EventEmitter } from "@angular/core"

export enum RenderQuality {
  low = 0,
  medium = 1,
  high = 2
}

export class Preferences {
  public cueListHeight = localStorage.getItem("preferences.cueListHeight") || (((window.innerHeight - 64) / 2)+"px")
  public cueWindowWidth = localStorage.getItem("preferences.cueWindowWidth") || "600px"
  public lastShowId: number = parseInt(localStorage.getItem("preferences.lastShowId") || "")
  public renderQuality = parseInt(localStorage.getItem("preferences.renderQuality") || "1") as RenderQuality
  public autoSave: boolean = localStorage.getItem("preferences.autoSave") === "true" || true
  public volume: number = parseFloat(localStorage.getItem("preferences.volume") || "1")

  public volumeEmitter = new EventEmitter()

  save() {
    localStorage.setItem("preferences.cueListHeight", this.cueListHeight)
    localStorage.setItem("preferences.cueWindowWidth", this.cueWindowWidth)
    localStorage.setItem("preferences.lastShowId", this.lastShowId.toString())
    localStorage.setItem("preferences.renderQuality", this.renderQuality.toString())
    localStorage.setItem("preferences.autoSave", this.autoSave.toString())
    localStorage.setItem("preferences.volume", this.volume.toString())
  }

}

export const preferences = new Preferences()
