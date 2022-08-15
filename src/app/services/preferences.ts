
class Preferences {
  public cueListHeight = localStorage.getItem("preferences.cueListHeight") || (((window.innerHeight - 64) / 2)+"px")
  public cueWindowWidth = localStorage.getItem("preferences.cueWindowWidth") || "600px"
  public lastShowId: number = parseInt(localStorage.getItem("preferences.lastShowId") || "")

  save() {
    localStorage.setItem("preferences.cueListHeight", this.cueListHeight)
    localStorage.setItem("preferences.cueWindowWidth", this.cueWindowWidth)
    localStorage.setItem("preferences.lastShowId", this.lastShowId.toString())
  }
}

export const preferences = new Preferences()
