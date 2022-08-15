import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionsService, CueLoadAction, CueSelectAction, LightSelectAction, LightValueSetAction } from 'src/app/services/actions/actions.service';
import { LightValueStoreMode, patch } from 'src/app/services/patch';
import { preferences, RenderQuality } from 'src/app/services/preferences';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LightValue } from '../../services/types/LightValue'

const millimetersToMeters = 1/1000
const s4Color = 0xFFB97E

@Component({
  selector: 'scene-render',
  templateUrl: './scene-render.component.html',
  styleUrls: ['./scene-render.component.scss']
})
export class SceneRenderComponent {
  @ViewChild('renderCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  private scene: THREE.Scene;
  private renderer!: THREE.Renderer;
  private camera: THREE.Camera;
  private rig: THREE.Group | undefined = undefined
  private isRendering: boolean = false
  private renderQueued: boolean = false

  private lightDatabase = new Map<number, THREE.Light>();
  private indicatorDatabase = new Map<number, THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>();

  constructor(private actions: ActionsService) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0, 200)
    // this.camera = new THREE.PerspectiveCamera(20, 1, 0.1, 10000)

    const globalLight = new THREE.AmbientLight(0x404040, 0.2);
    const pointLight = new THREE.PointLight(0xffffff, 0.1, 0);
    pointLight.position.set(0, 0, 0);
    this.scene.add(globalLight)
    this.scene.add(pointLight)

    this.camera.up.set(0, 0, 1)
    this.camera.position.set(0, -30, 7);
    this.camera.lookAt(0, 15, 3);

    let fadeId = 0
    this.actions.eventEmitter.subscribe(action => {
      if (action instanceof LightValueSetAction) {
        patch.getSelectedLights().forEach(channel => {
          this.updateLight(channel, patch.getLightValue(channel))
        })
      } else if (action instanceof LightSelectAction) {
        this.updateIndicators(patch.getSelectedLights())
      } else if (action instanceof CueLoadAction) {
        patch.getAllLights().forEach(channel => {
          this.updateLight(channel, patch.getLightValue(channel))
        })
        this.render()
      } else if (action instanceof CueSelectAction) {
        fadeId += 1
        if (!action.fade) {
          patch.getAllLights().forEach(channel => {
            this.updateLight(channel, patch.getLightValue(channel))
          })
        } else {
          const f = (currentFadeId:number) => {
            action.fadeEmitter!.subscribe(t => {
              if (currentFadeId === fadeId) {
                patch.getProgrammedChannels().forEach(channel => {
                  let oldValue = patch.getLightValue(channel, false, LightValueStoreMode.executor)
                  let newValue = patch.getLightValue(channel, false, LightValueStoreMode.both)
                  this.updateLight(channel, LightValue.interpolate(oldValue, newValue, t))
                })

                this.render()
              }
            })
          }

          f(fadeId)

        }
      }
    })

    this.actions.renderEmitter.subscribe(() => {
      this.render()
    })
  }

  ngOnInit() {
    this.loadModels()
    this.loadRig('assets/rigs/ds')
    this.loadLights()
  }

  async loadModels() {
    const loader = new GLTFLoader();
    let data = await Promise.all([
      loader.loadAsync('assets/dancer2.glb')
    ])

    data[0].scene.position.set(0, 11, 0.75)
    data[0].scene.rotateX(MathUtils.degToRad(90))

    // data[1].scene.traverse(child => {
    //   child.castShadow = true
    //   child.receiveShadow = true
    // })

    data.forEach(model => {
      this.scene.add(model.scene)
    })

    this.render()
  }

  async loadRig(location: string) {
    const loader = new GLTFLoader();
    let data = await loader.loadAsync(location+'/model.glb')

    data.scene.scale.set(millimetersToMeters, millimetersToMeters, millimetersToMeters)
    data.scene.up.set(0, 0, -1)
    data.scene.traverse(child => {
      // if (child instanceof THREE.Mesh) {
      //   console.log("MESH")
      //   child.material = new THREE.MeshStandardMaterial({
      //     color: child.material.color,
      //     map: child.material.map
      //   })

      //   child.material.opacity = 1.0
      //   child.material.transparent = true
      // } else {
      //   console.log(child)
      // }
    })

    if (this.rig !== undefined) {
      this.scene.remove(this.rig)
    }
    this.scene.add(data.scene)
    this.rig = data.scene

    this.render()
  }

  async loadLights() {
    let lights = await patch.loadLights()

    lights.forEach((myLight) => {

      const group = new THREE.Group()
      group.position.set(myLight.location.x, myLight.location.y, myLight.location.z+0.2)
      group.rotation.set(myLight.rotation.x, myLight.rotation.y, myLight.rotation.z)
      const color = myLight.has_color ? 0xff0000 : s4Color

      const target = new THREE.Vector3(0, 0, -10)
      target.applyAxisAngle(new THREE.Vector3(1, 0, 0), myLight.rotation.tilt)
      target.applyAxisAngle(new THREE.Vector3(0, 0, 1), myLight.rotation.pan)

      if (myLight.type.includes("Colorforce II")) {
        group.position.setY(myLight.location.y - 0.5)
        const light = new THREE.RectAreaLight(color, 0, 1, 0.1)
        light.position.set(0, 0, 0)
        light.lookAt(target)
        group.add(light)
        this.lightDatabase.set(myLight.channel, light)
      } else {
        const light = new THREE.SpotLight(color, 0, 0, myLight.angle, 0.2)
        light.position.set(0, 0, 0)
        light.target.position.set(target.x, target.y, target.z)
        group.add(light)
        group.add(light.target)
        this.lightDatabase.set(myLight.channel, light)
      }

      const geometry = new THREE.SphereGeometry(0.2);
      const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      material.depthTest = false
      material.transparent = true
      material.opacity = 0
      const sphere = new THREE.Mesh( geometry, material );
      sphere.renderOrder = 1
      this.indicatorDatabase.set(myLight.channel, sphere)

      group.add(sphere)

      this.scene.add(group)
    })

    this.render()
  }

  ngAfterViewInit(): void {
    let renderer = new THREE.WebGLRenderer({
      canvas: this.canvas.nativeElement,
      antialias: true,
    })
    // renderer.shadowMap.enabled = true

    let height = 200
    if (preferences.renderQuality === RenderQuality.low) {
      height = 100
    } else if (preferences.renderQuality === RenderQuality.medium) {
      height = 200
    } else if (preferences.renderQuality === RenderQuality.high) {
      height = 400
    }

    renderer.setSize(height*2, height)

    this.renderer = renderer

    this.render()
  }

  updateLight(channel: number, data: LightValue) {
    let light = this.lightDatabase.get(channel)
    let lightProperties = patch.getLightProperties(channel)

    if (light && lightProperties) {
      light.intensity = lightProperties.intensity*data.brightness

      if (lightProperties.has_color) light.color = new THREE.Color(data.color)

      if (lightProperties.has_moving) {
        const target = new THREE.Vector3(0, 0, -10)
        target.applyAxisAngle(new THREE.Vector3(1, 0, 0), MathUtils.degToRad(data.tilt))
        target.applyAxisAngle(new THREE.Vector3(0, 0, 1), MathUtils.degToRad(data.pan))
        let light2 = light as THREE.SpotLight
        light2.target.position.set(target.x, target.y, target.z)
      }
    }
  }

  updateIndicators(selection: number[]) {
    this.indicatorDatabase.forEach((indicator, channel) => {
      if (selection.includes(channel)) {
        indicator.material.opacity = 1.0
        indicator.material.needsUpdate = true
      } else {
        indicator.material.opacity = 0.0
        indicator.material.needsUpdate = true
      }
    })
    this.render()
  }

  render() {
    if (this.isRendering) {
      this.renderQueued = true
      return
    }
    this.isRendering = true
    console.log("RENDER")
    this.renderer.render(this.scene, this.camera)
    this.isRendering = false
    if (this.renderQueued) {
      this.renderQueued = false
      this.render()
    }
  }

}
