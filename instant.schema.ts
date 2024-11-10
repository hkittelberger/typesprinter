import { i } from "@instantdb/core";

export default i.graph(
  {
    races: i.entity({
      text: i.string(),
      startedAt: i.number().optional(),
    }),
    entrants: i.entity({
      name: i.string(),
      team: i.string(),
      progress: i.number(),
      completedAt: i.number().optional(),
    }),
  },
  {
    raceEntrants: {
      forward: {
        on: "races",
        has: "many",
        label: "entrants",
      },
      reverse: {
        on: "entrants",
        has: "one",
        label: "race",
      },
    },
  }
);
