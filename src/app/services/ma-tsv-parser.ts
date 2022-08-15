import { parse } from 'papaparse'
import { MathUtils } from 'three';

interface LightData {
  'Device Type': 'Light' | 'Moving Light' | 'SFX',
  'Instrument Type': string,
  'Fixture ID': string,
  'Fixture Mode': string,
  'GDTF Fixture': string,
  'GDTF Fixture Mode': string,
  'Wattage': string,
  'Purpose': string,
  'Position': string,
  'Unit Number': string,
  'Color': string,
  'Dimmer': string,
  'Channel': string,
  'User Address': string,
  'Universe': string,
  'User U Address': string,
  'Circuit Number': string,
  'Circuit Name': string,
  'System': string,
  'User Field 1': string,
  'User Field 2': string,
  'User Field 3': string,
  'User Field 4': string,
  'User Field 5': string,
  'User Field 6': string,
  'Voltage': string,
  'Breaker ID': string,
  'Time': string,
  'Cost': string,
  'DMX Footprint': string,
  'Frame Size': string,
  'Field Angle': string,
  'Field Angle 2': string,
  'Beam Angle': string,
  'Beam Angle 2': string,
  'Weight': string,
  'Gobo 1': string,
  'Gobo 1 Rotation': string,
  'Gobo 2': string,
  'Gobo 2 Rotation': string,
  'Gobo Shift': string,
  'Mark': string,
  'Draw beam': string,
  'Draw beam as 3D solid': string,
  'Use vertical beam': string,
  'Show Beam at': string,
  'Falloff Distance': string,
  'Lamp Rotation Angle': string,
  'Top Shutter Depth': string,
  'Top Shutter Angle': string,
  'Left Shutter Depth': string,
  'Left Shutter Angle': string,
  'Right Shutter Depth': string,
  'Right Shutter Angle': string,
  'Bottom Shutter Depth': string,
  'Bottom Shutter Angle': string,
  'Symbol Name': string,
  'Use Legend': string,
  '3D Legend View': string,
  'Flip top and bottom 3D legend': string,
  'Flip left and right 3D legend': string,
  'Rotate 3D legend with Z rotation': string,
  'Flip front and back 2D legend': string,
  'Flip left and right 2D legend': string,
  'Focus': string,
  'Set 3D Orientation': string,
  'X Rotation': string,
  'Y Rotation': string,
  'Custom plan rotation': string,
  'Z Rotation': string,
  'Vertical Focus Angle': string,
  'Horizontal Focus Angle': string,
  'Angle To Face': string,
  'Off Axis Angle': string,
  'Throw Distance': string,
  'X Location': string,
  'Y Location': string,
  'Z Location': string,
  '__UID': string,
  'Edit...': string,
  'Edit Accessories': string,
  'Edit Cell': string,
  'Edit Accessory': string,
  'Edit GDTF Data...': string,
  'Absolute Address': string,
  'Universe/Address': string,
  'DMX Address': string,
  'Replace Lighting Device…': string,
  'Refresh Labels': string,
  'Use GDTF Geometry': string,
  'Pan': string,
  'Tilt': string,
  'Plan Rotation': string,
  'Load Information': string
}

export interface BetterLightData {
  type: string,
  channel: number,
  location: { x: number, y: number, z: number },
  rotation: { x: number, y: number, z: number, pan: number, tilt: number },
  address: string,
  has_color: boolean,
  has_strobe: boolean,
  has_moving: boolean,
  angle: number,
  intensity: number
}

class MaTsvParserService {

  constructor() {}

  parse(tsv: string): BetterLightData[] {
    let lightData = parse(tsv, {delimiter: '\t', header: true, skipEmptyLines: true}).data as LightData[]
    return lightData.map(x => {
      console.log(x)
      return {
        type: x['Instrument Type'],
        channel: parseInt(x['Channel']),
        location: {
          x: this.feetToMeters(x['X Location']),
          y: this.feetToMeters(x['Y Location']),
          z: this.feetToMeters(x['Z Location'])
        },
        rotation: {
          x: MathUtils.degToRad(parseFloat(x['X Rotation'])),
          y: MathUtils.degToRad(parseFloat(x['Y Rotation'])),
          z: MathUtils.degToRad(parseFloat(x['Z Rotation'])),
          pan: MathUtils.degToRad(parseFloat(x['Pan'])),
          tilt: MathUtils.degToRad(parseFloat(x['Tilt'])),
        },
        address: x['DMX Address'],
        has_color: parseInt(x['DMX Footprint']) > 1,
        has_strobe: x["Instrument Type"].includes("Stormy"),
        has_moving: x['Device Type'] === 'Moving Light',
        angle: MathUtils.degToRad(parseFloat(x['Field Angle'])),
        intensity: this.getLightTypeIntensity(x['Instrument Type'])
      }
    })
  }

  getLightTypeIntensity(type:string) {
    if (type.includes("Colorforce II")) {
      return 50
    }
    console.log(type)
    return 0.3
  }

  feetToMeters(feetStr: string): number {
    let values = feetStr.split("'")
    let feet = parseFloat(values[0])
    if (values.length > 1) {
      let inches = parseFloat(values[1])
      if (feet < 0) {
        inches = -inches
      }
      feet += inches / 12
    }
    return feet * 0.3048
  }
}


export const parser = new MaTsvParserService()
