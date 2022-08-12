import { Injectable } from '@angular/core';
import { MathUtils } from 'three';
import { parseStringPromise } from 'xml2js';

interface Fixture {
  $: {channel_id:string, fixture_id: string, name: string},
  FixtureType: FixtureType[],
  SubFixture: SubFixture[]
}

interface FixtureType {
  $: {name: string},
  No: string[]
}

interface SubFixture {
  $: {
    color: string,
    index: string,
    react_to_grandmaster: true
  },
  AbsolutePosition: Position[]
  Patch: {Address: string[]}[]
}

interface Position {
  Location: {$: MaVec3}[]
  Rotation: {$: MaVec3}[]
  Scaling: {$: MaVec3}[]
}

interface MaVec3 { x: string, y: string, z: string }

interface MyLight {
  channel: number | null,
  data: MyFixtureData,
  position: MyPosition,
}

interface MyFixtureData {
  name: string,
  has_color: boolean,
  intensity: number,
  angle: number
}

interface MyPosition {
  location: Vec3,
  rotation: Vec3,
  scaling: Vec3
}

interface Vec3 { x: number, y: number, z: number }

@Injectable({
  providedIn: 'root'
})
export class MaXmlParserService {

  constructor() {}

  public async parse(xml: string):Promise<MyLight[]> {
    let data = await parseStringPromise(xml)
    let layers = data.MA.Layers[0].Layer
    let lights:MyLight[] = []
    for(let i = 0; i < layers.length; i++) {
      lights = lights.concat(this.parseLayer(layers[i]))
    }
    return lights
  }

  private getAngle(name: string) {
    if (name.includes("36")) return 36
    else if (name.includes("26")) return 26
    else {
      console.warn("Unknown angle: " + name)
      return 90
    }
  }

  private fixtureTypeToLight(fixtureType: FixtureType):MyFixtureData | null {
    let name = fixtureType.$.name
    if (name.includes("LED2LS")) {
      return {
        name: "S4LED2LS",
        has_color: true,
        intensity: 0.5,
        angle: MathUtils.degToRad(this.getAngle(name))
      }
    } else if (name.includes("Source 4")) {
      return {
        name: "S4",
        has_color: false,
        intensity: 0.6,
        angle: MathUtils.degToRad(this.getAngle(name))
      }
    } else if (name.includes("D40 Lustr")) {
      return {
        name: "D40",
        has_color: true,
        intensity: 0.5,
        angle: MathUtils.degToRad(30)
      }
    } else if (name.includes("Stormy")) {
      return {
        name: "Stormy",
        has_color: true,
        intensity: 0.5,
        angle: MathUtils.degToRad(30)
      }
    }
    console.warn("Unknown fixture type: " + name)
    return null
  }

  private parseLayer(layer: {$: string, Fixture: Fixture[]}):MyLight[] {
    let lights: MyLight[] = []
    let fixtures = layer.Fixture
    for(let i = 0; i < fixtures.length; i++) {
      let fixture = this.parseFixture(fixtures[i])
      if (fixture !== null) {
        lights.push(fixture)
      }
    }
    return lights
  }

  private parseFixture(fixture: Fixture):MyLight | null {
    let lightData = this.fixtureTypeToLight(fixture.FixtureType[0])
    if (!lightData) {
      return null
    }

    let subfixture = fixture.SubFixture[0]
    let position = this.parseSubfixture(subfixture)
    let channel: number | null = parseInt(fixture.$.channel_id)
    if (isNaN(channel)) channel = null
    return {
      data: lightData,
      position,
      channel
    }
  }

  private parseSubfixture(subfixture: SubFixture):MyPosition {
    let location = this.parseMaVec3(subfixture.AbsolutePosition[0].Location[0].$)
    let rotation = this.parseMaVec3(subfixture.AbsolutePosition[0].Rotation[0].$)
    let scaling = this.parseMaVec3(subfixture.AbsolutePosition[0].Scaling[0].$)
    return { location, rotation, scaling }
  }

  private parseMaVec3(input: MaVec3): Vec3 {
    return {
      x: parseFloat(input.x),
      y: parseFloat(input.y),
      z: parseFloat(input.z)
    }
  }

}
