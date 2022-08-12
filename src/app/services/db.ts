import Dexie, { Table } from 'dexie';
import { Cue, Show } from './types/show';
import { LightValue } from './types/LightValue';
import { LightValueStore } from './types/LightValueStore';

interface dbShow {
  id?: number;
  name: string;
  song: Blob;
  modifyDate: number;
}

interface dbCue {
  id?: number;
  showId: number;
  time: number
  fade: number
  title: string
}

interface dbLightValue {
  id?: number
  cueId: number
  channel: number
  brightness: number
  color: number
  pan: number
  tilt: number
}

interface showExportFormat {
  show: {
    name: string,
    song: string
  },
  cues: dbCue[],
  lightValues: dbLightValue[]
}

const convertToDbLightValues = (cueId: number, store: LightValueStore): dbLightValue[] => {
  let channels = store.usedChannels()
  return channels.map(channel => {
    let value = store.get(channel)
    if (!value) return null
    return {
      cueId,
      channel,
      brightness: value.brightness,
      color: value.color,
      pan: value.pan,
      tilt: value.tilt
    }
  }).filter(value => value !== null) as dbLightValue[]
}

const convertFromDbCue = (dbCue: dbCue, lightValues: dbLightValue[]): Cue | null => {
  if (!dbCue.id) return null

  let channels = lightValues.map(lightValue => lightValue.channel)
  let values = lightValues.map(lightValue => {
    return new LightValue({
      brightness: lightValue.brightness,
      color: lightValue.color,
      pan: lightValue.pan,
      tilt: lightValue.tilt
    })
  })
  return {
    id: dbCue.id,
    time: dbCue.time,
    fade: dbCue.fade,
    title: dbCue.title,
    lightValues: new LightValueStore({channels, values})
  }
}

export class AppDB extends Dexie {
  shows!: Table<dbShow, number>;
  cues!: Table<dbCue, number>;
  lightValues!: Table<dbLightValue, number>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      shows: '++id,name',
      cues: '++id,showId,time,fade,title',
      lightValues: '++id,cueId,channel,brightness,color,pan,tilt'
    });
  }

  async newShow(name: string, song: Blob) {
    return await this.shows.add({
      name,
      song,
      modifyDate: Date.now()
    })
  }

  async updateShow(id: number, name: string) {
    this.shows.update(id, {
      name,
      modifyDate: Date.now()
    })
  }

  async listShows() {
    return await this.shows.toArray()
  }

  async deleteShow(showId: number) {
    await this.shows.delete(showId)
    let cues = this.cues.where("showId").equals(showId)
    await this.lightValues.where("cueId").anyOf(await cues.primaryKeys()).delete()
    await cues.delete()
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>{
        resolve(reader.result as string)
      }
      reader.onerror = (error) =>{
        reject(error)
      }
      reader.readAsDataURL(blob)
    })
  }

  private async base64ToBlob(base64: string) {
    return (await fetch(base64)).blob()
  }

  async exportShow(showId: number): Promise<showExportFormat | null> {
    let show = await this.shows.get(showId)
    let cues = await this.cues.where("showId").equals(showId)
    let lightValues = await this.lightValues.where("cueId").anyOf(await cues.primaryKeys())
    if (!show || !cues || !lightValues) return null
    const song = await this.blobToBase64(show.song)

    return {
      show: {
        name: show.name,
        song: song
      },
      cues: await cues.toArray(),
      lightValues: await lightValues.toArray()
    }
  }

  async importShow(data: showExportFormat) {
    let song = await this.base64ToBlob(data.show.song)
    let showId = await this.shows.add({
      name: data.show.name,
      song,
      modifyDate: Date.now()
    })

    let oldCueIds = data.cues.map(cue => cue.id)

    let cueIds = await this.cues.bulkAdd(data.cues.map(cue => {
      delete cue.id
      cue.showId = showId
      return cue
    }), {allKeys: true})

    let cueIdMap = new Map(oldCueIds.map((cueId, index) => [cueId, cueIds[index]]))

    let lightValues = data.lightValues.map(lightValue => {
      const newCueId = cueIdMap.get(lightValue.cueId)
      if (!newCueId) {
        console.error("Could not find cueId", lightValue.cueId)
        return null
      }
      lightValue.cueId = newCueId;
      delete lightValue.id
      return lightValue
    })

    await this.lightValues.bulkAdd(lightValues.filter(value => value !== null) as dbLightValue[])

    return showId
  }

  async loadShow(showId: number): Promise<Show | null> {
    let show = await this.shows.get(showId)
    let dbCues = this.cues.where("showId").equals(showId)
    let lightValues = await this.lightValues.where("cueId").anyOf(await dbCues.primaryKeys()).toArray()
    let dbCuesArray = await dbCues.toArray()

    let cues:Cue[] = []
    dbCuesArray.forEach(dbCue => {
      let cue = convertFromDbCue(dbCue, lightValues.filter(lightValue => lightValue.cueId === dbCue.id))
      if (cue !== null) {
        cues.push(cue)
      }
    })

    if (!show || !cues || !lightValues || !show.id) return null
    return {
      id: show.id,
      name: show.name,
      song: show.song,
      modifyDate: new Date(show.modifyDate),
      cues
    }
  }

  async saveShow(show: Show) {
    let deletedCues = await this.cues.where("showId").equals(show.id).delete()

    //Saving the show, cues, and deleting old light values can be done in parallel
    let res = await Promise.all([
      this.lightValues.where("cueId").anyOf(await deletedCues).delete(),

      this.shows.put({
        id: show.id,
        name: show.name,
        song: show.song,
        modifyDate: Date.now()
      }),

      this.cues.bulkAdd(show.cues.map(cue => {
        return {
          showId: show.id,
          time: cue.time,
          fade: cue.fade,
          title: cue.title
        }
      }), {allKeys: true})
    ])

    const newCueIds = res[2]

    await this.lightValues.bulkAdd(show.cues.flatMap((cue, index) => convertToDbLightValues(newCueIds[index], cue.lightValues)))
  }

  async showList() {
    return await this.shows.toArray()
  }
}

export const db = new AppDB()
