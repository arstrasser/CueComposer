
class Preferences {
  public cueListHeight = localStorage.getItem("preferences.cueListHeight") || "150px"
  public cueWindowWidth = localStorage.getItem("preferences.cueWindowWidth") || "300px"

  save() {
    localStorage.setItem("preferences.cueListHeight", this.cueListHeight)
    localStorage.setItem("preferences.cueWindowWidth", this.cueWindowWidth)
  }
}


export const preferences = new Preferences()
