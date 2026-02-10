import { HeartsBackground } from "./components/HeartsBackground";
import { ValentineCard } from "./components/ValentineCard";

export default function App() {
  return (
    <div className="page">
      <HeartsBackground />
      <main className="content" aria-label="Valentine page content">
        <ValentineCard />
      </main>
    </div>
  );
}

