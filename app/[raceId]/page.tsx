"use client";

import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { id, tx } from "@instantdb/react";
import useLocalStorage from "use-local-storage";
import { db, Entrant, Race } from "@/lib/db";
import { TEAMS } from "@/lib/constants";
import Link from "next/link";

export default function RacePage() {
  const { raceId } = useParams<{ raceId: string }>();

  const { data } = db.useQuery({
    races: {
      $: {
        where: {
          id: raceId,
        },
      },
      entrants: {},
    },
  });

  const race = data?.races[0] as Race & { entrants: Entrant[] };

  const [entrantId] = useLocalStorage(`entrantId-${raceId}`, id());
  const [name, setName] = useLocalStorage("name", "");
  const [team, setTeam] = useLocalStorage("team", "");

  useEffect(() => {
    db.transact([
      tx.entrants[entrantId].update({ name, team }),
      tx.races[raceId].link({ entrants: entrantId }),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      /Mobi|Android/i.test(navigator.userAgent)
    ) {
      alert("This game doesn’t work on phones, only computers.");
    }
  }, []);

  return (
    <div className="p-4">
      <Link href="/" className="text-gray-600">
        &larr;{" "}
        <span className="underline decoration-gray-400">
          Start another race
        </span>
      </Link>

      <div className="mt-4 grid grid-cols-[1fr_350px] gap-x-4">
        <Typing race={race} entrantId={entrantId} />
        <Profile
          name={name}
          setName={setName}
          team={team}
          setTeam={setTeam}
          entrantId={entrantId}
        />
      </div>

      <div className="mt-4">
        <Results race={race} />
      </div>
    </div>
  );
}

const Typing = ({
  race,
  entrantId,
}: {
  race?: Race & { entrants: Entrant[] };
  entrantId: string;
}) => {
  const raceHasStartTime = !!race?.startedAt;
  const msInFuture = race?.startedAt ? race.startedAt - Date.now() : null;
  const inRace = raceHasStartTime && msInFuture && msInFuture < 0;

  const [ownedRaceIds] = useLocalStorage<string[]>("ownedRaceIds", []);
  const [text, setText] = useState("");

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const forceUpdateRecursive = () => {
      forceUpdate();
      setTimeout(forceUpdateRecursive, 500);
    };
    forceUpdateRecursive();
  }, [race?.startedAt]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!race) {
    return <div />;
  }

  const thisEntrant = race?.entrants.find(
    (entrant) => entrant.id === entrantId
  );

  const startRace = () => {
    db.transact(tx.races[race.id].update({ startedAt: Date.now() + 5_000 }));
  };

  if (!raceHasStartTime) {
    const isOwner = ownedRaceIds.includes(race.id);
    return (
      <div className="p-4 bg-white rounded-xl ring-1 ring-gray-900/10 shadow-sm space-y-4">
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Joined: </span>
            {race.entrants
              .map((entrant) =>
                entrant.name === "" ? "Unnamed" : entrant.name
              )
              .join(", ")}
          </p>

          {isOwner ? (
            <button
              onClick={startRace}
              className="px-4 py-2 rounded-full ring-1 ring-gray-900/10 shadow-sm font-medium"
            >
              Everyone is here. Start the race!
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-x-2">
              <div className="border-2 border-gray-300 p-1 border-t-gray-400 size-4 rounded-full animate-spin" />
              <p className="text-gray-500">
                Waiting for race creator to start the race...
              </p>
            </div>
          )}

          <ul className="text-gray-500 max-w-lg border-l-2 border-cyan-500 pl-6 py-1 list-disc space-y-0.5">
            {isOwner && <li>Send this link to have people join the race.</li>}
            <li>
              When the race starts, there will be a countdown, and then you’ll
              be shown a paragraph to type.
            </li>
            <li>
              You <em className="font-semibold">do</em> need to go back and
              correct mistakes.
            </li>
            <li>Fastest typing speed wins.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (raceHasStartTime && !inRace && msInFuture) {
    return (
      <div className="p-4 bg-white rounded-xl ring-1 ring-gray-900/10 shadow-sm">
        <p className="text-xl font-bold">
          Starting in {Math.ceil(msInFuture / 1_000)}...
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const changeLength = value.length - text.length;
    if (changeLength > 1) {
      return;
    }
    setText(value);

    db.transact(
      tx.entrants[entrantId].update({
        progress: Math.min(value.length / race.text.length, 1),
      })
    );

    if (value === race.text) {
      db.transact(tx.entrants[entrantId].update({ finishedAt: Date.now() }));
    }
  };

  const invalid = !race.text.startsWith(text);

  return (
    <div className="p-4 bg-white rounded-xl ring-1 ring-gray-900/10 shadow-sm">
      <div className="text-lg font-mono">{race.text}</div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className={`mt-4 w-full rounded-lg bg-gray-50 font-mono text-lg ${
          invalid
            ? "bg-red-100 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300"
        }`}
        autoFocus
        disabled={!!thisEntrant?.finishedAt}
      ></textarea>

      {invalid && (
        <p className="text-red-500 mt-0.5">
          The text you typed doesn’t match the given text.
        </p>
      )}
    </div>
  );
};

const Profile = ({
  name,
  setName,
  team,
  setTeam,
  entrantId,
}: {
  name: string;
  setName: (name: string) => void;
  team: string;
  setTeam: (team: string) => void;
  entrantId: string;
}) => {
  return (
    <div className="p-4 bg-white rounded-xl ring-1 ring-gray-900/10 shadow-sm space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-500"
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            db.transact(tx.entrants[entrantId].update({ name: value }));
          }}
          className="mt-1 rounded-lg border-gray-300 bg-gray-50 w-full"
        />
      </div>
      <select
        value={team}
        onChange={(e) => {
          const value = e.target.value;
          setTeam(value);
          db.transact(tx.entrants[entrantId].update({ team: value }));
        }}
        className="rounded-lg border-gray-300 bg-gray-50 w-full"
      >
        <option value="" disabled>
          Select a team...
        </option>
        {TEAMS.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
};

const Results = ({ race }: { race: Race & { entrants: Entrant[] } }) => {
  if (!race) {
    return null;
  }

  const finishedEntrants = race.entrants
    .filter((entrant) => entrant.finishedAt)
    .sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));

  const places = new Map(
    finishedEntrants.map((entrant, index) => [entrant.id, index + 1])
  );

  return (
    <div className="p-4 bg-white rounded-xl ring-1 ring-gray-900/10 shadow-sm space-y-4">
      <div className="div grid grid-cols-[300px,1fr] gap-x-4 gap-y-1 items-center">
        {race.entrants.map((entrant) => {
          const place = places.get(entrant.id);
          const wpm =
            entrant.finishedAt && race.startedAt
              ? Math.round(
                  race.text.split(" ").length /
                    ((entrant.finishedAt - race.startedAt) / (1_000 * 60))
                )
              : null;
          return (
            <Fragment key={entrant.id}>
              <div>
                <p className="font-medium">
                  {entrant.name === "" ? "Unnamed" : entrant.name}{" "}
                  {place && <span>(#{place})</span>}{" "}
                  {wpm && <span>{wpm} words/min</span>}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  {entrant.team}
                </p>
              </div>
              <div className="bg-gray-100 outline outline-gray-200 rounded-full relative h-6 p-0.5">
                <div
                  className={`size-5 rounded-full absolute ${
                    entrant.finishedAt ? "bg-emerald-500" : "bg-cyan-500"
                  }`}
                  style={{
                    marginLeft: `calc(${
                      entrant.progress ? entrant.progress * 100 : 0
                    }% - 1.5rem)`,
                  }}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
