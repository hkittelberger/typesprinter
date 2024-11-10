"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="space-y-8">
        <div className="w-max mx-auto">
          <h1 className="text-2xl font-bold text-center">typesprinter</h1>
          <div className="-mr-2 ml-auto bg-teal-600 text-white text-sm italic font-medium w-max px-2 py-0.5 rounded-full">
            for JumboCode
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/join"
            className="px-4 py-3 rounded-full bg-white ring-1 ring-gray-950/10 font-medium"
          >
            Join an existing race
          </Link>
          <button onClick={() => {}} className="text-gray-700 font-medium">
            Create a new race
          </button>
        </div>
      </div>
    </div>
  );
}
