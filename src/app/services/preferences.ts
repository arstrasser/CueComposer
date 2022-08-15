
export enum RenderQuality {
  low = 0,
  medium = 1,
  high = 2
}

class Preferences {
  public cueListHeight = localStorage.getItem("preferences.cueListHeight") || (((window.innerHeight - 64) / 2)+"px")
  public cueWindowWidth = localStorage.getItem("preferences.cueWindowWidth") || "600px"
  public lastShowId: number = parseInt(localStorage.getItem("preferences.lastShowId") || "")
  public renderQuality = parseInt(localStorage.getItem("preferences.renderQuality") || "1") as RenderQuality

  save() {
    localStorage.setItem("preferences.cueListHeight", this.cueListHeight)
    localStorage.setItem("preferences.cueWindowWidth", this.cueWindowWidth)
    localStorage.setItem("preferences.lastShowId", this.lastShowId.toString())
    localStorage.setItem("preferences.renderQuality", this.renderQuality.toString())
  }

}

export const preferences = new Preferences()
