export interface Channel {
  number: number;
  name: string;
  line: string;
  src: string | null;
  kind: "picture" | "snow";
}

export const CHANNELS: Channel[] = [
  {
    number: 2,
    name: "Lab Feed",
    line: "Test pattern · the tuner is locked",
    src: "/tv/ch-lab.jpg",
    kind: "picture",
  },
  {
    number: 3,
    name: "Hearth",
    line: "Fireplace · no rights, just a picture",
    src: "/tv/ch-hearth.jpg",
    kind: "picture",
  },
  {
    number: 4,
    name: "Tank",
    line: "Aquarium · the calm channel",
    src: "/tv/ch-tank.jpg",
    kind: "picture",
  },
  {
    number: 5,
    name: "Sky",
    line: "Weather plate · Midwestern afternoon",
    src: "/tv/ch-weather.jpg",
    kind: "picture",
  },
  {
    number: 7,
    name: "Rain",
    line: "City window · overnight",
    src: "/tv/ch-city.jpg",
    kind: "picture",
  },
  {
    number: 11,
    name: "Snow",
    line: "No signal · what a dead tuner looks like",
    src: null,
    kind: "snow",
  },
];

export function wrapIndex(i: number): number {
  const n = CHANNELS.length;
  return ((i % n) + n) % n;
}
