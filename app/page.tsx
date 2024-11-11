"use client";

import { db } from "@/lib/db";
import { id, tx } from "@instantdb/react";
import { useRouter } from "next/navigation";
import useLocalStorage from "use-local-storage";
import quotesJson from "./quotes.json";

const NUM_QUOTES = 3;

export default function Home() {
  const router = useRouter();
  const [ownedRaceIds, setOwnedRaceIds] = useLocalStorage<string[]>(
    "ownedRaceIds",
    []
  );

  const handleCreateRace = () => {
    const newId = id();

    const quotes = [];

    for (let i = 0; i < NUM_QUOTES; i++) {
      quotes.push(
        quotesJson[Math.floor(Math.random() * quotesJson.length)].text
      );
    }

    db.transact(
      tx.races[newId].update({
        text: quotes.join(" ").trim(),
      })
    );

    setOwnedRaceIds([...ownedRaceIds, newId]);

    router.push(`/${newId}`);
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="space-y-8">
        <div className="w-max mx-auto">
          <h1 className="text-2xl font-bold text-center">typesprinter</h1>
          <div className="-mr-2 ml-auto bg-teal-600 text-white text-sm italic font-medium w-max px-2 py-0.5 rounded-full">
            for JumboCode
          </div>
        </div>

        <button
          onClick={handleCreateRace}
          className="text-gray-700 font-medium"
        >
          Create a new typing race
        </button>
      </div>
    </div>
  );
}
