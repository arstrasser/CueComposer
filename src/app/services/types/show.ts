import { LightValueStore } from "./LightValueStore";

export interface Show {
  id: number;
  name: string;
  song: Blob;
  modifyDate: Date;
  cues: Cue[];
}

export interface Cue {
  id: number,
  time: number,
  fade: number,
  title: string,
  lightValues: LightValueStore
}
