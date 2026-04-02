import { Suspense } from "react";
import { ChallengesClient } from "./ChallengesClient";

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>}>
      <ChallengesClient />
    </Suspense>
  );
}
