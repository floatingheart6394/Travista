import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import NewNavbar from "../components/NewNavbar";
import WorldboundMap from "../components/WorldboundMap";
import QuestPanel from "../components/QuestPanel";
import ProgressPanel from "../components/ProgressPanel";
import CollectionPanel from "../components/CollectionPanel";
import RegionModal from "../components/RegionModal";
import "../pages/gamepage.css";

const MOCK_REGIONS = [
  { id: "mediterranean", name: "Mediterranean Coast", short: "Coastal culture & slow beaches — scent of lemon and salt.", xp: 120, unlocked: true, mood: "tranquil", lat: 43.7102, lng: 7.2620, linkedQuests: ["q1"] },
  { id: "andina", name: "Andean Highlands", short: "Highland trails and local markets; woven stories.", xp: 150, unlocked: false, mood: "roaming", lat: -13.5319, lng: -71.9675, linkedQuests: ["q2"] },
  { id: "archipelago", name: "Island Archipelago", short: "Quiet coves and boatfolk recipes; tides as a clock.", xp: 100, unlocked: true, mood: "salt", lat: 37.7412, lng: -25.6756, linkedQuests: ["q3"] },
  { id: "savannah", name: "Savannah Outskirts", short: "Slow wildlife journeys and long horizons.", xp: 140, unlocked: false, mood: "wide", lat: -2.3333, lng: 34.8333, linkedQuests: ["q4"] },
  { id: "northern", name: "Northern Fjords", short: "Light that draws maps on the skin; fjord letters.", xp: 180, unlocked: false, mood: "crisp", lat: 60.39299, lng: 5.32415, linkedQuests: ["q5"] },
];

const MOCK_QUESTS = [
  { id: "q1", title: "Coastal Conversations", desc: "Sit with fishers at dawn, learn a recipe and a name.", progress: 0.6, targetRegion: "mediterranean", reward: { xp: 60, token: "Seaside Recipe" } },
  { id: "q2", title: "Market Pathways", desc: "Trace a slow market route and learn three gentle words.", progress: 0.35, targetRegion: "andina", reward: { xp: 80, token: "Market Sketch" } },
  { id: "q3", title: "Island Drift", desc: "Let a day unfold without plan; collect driftwood stories.", progress: 0.9, targetRegion: "archipelago", reward: { xp: 50, token: "Driftwood Token" } },
  { id: "q4", title: "Dawn on the Savannah", desc: "Witness a sunrise that feels like a map unfolding.", progress: 0.18, targetRegion: "savannah", reward: { xp: 70, token: "Dawn Token" } },
  { id: "q5", title: "Fjord Letters", desc: "Gather a guide's small notes about place and weather.", progress: 0.02, targetRegion: "northern", reward: { xp: 100, token: "Fjord Note" } },
];

export default function GamePage() {
  const STORAGE_KEY = "worldbound_v1";

  // load from storage or defaults
  const loadInitial = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          regions: parsed.regions || MOCK_REGIONS,
          quests: parsed.quests || MOCK_QUESTS,
          xp: typeof parsed.xp === "number" ? parsed.xp : 320,
          collections: parsed.collections || [
            { id: "seed-1", title: "Seaside Recipe", region: "mediterranean" },
            { id: "seed-2", title: "Driftwood Token", region: "archipelago" },
          ],
          level: typeof parsed.level === "number" ? parsed.level : 2,
        };
      }
    } catch (e) {
      // ignore parse errors and fall back to defaults
    }
    return {
      regions: MOCK_REGIONS,
      quests: MOCK_QUESTS,
      xp: 320,
      collections: [
        { id: "seed-1", title: "Seaside Recipe", region: "mediterranean" },
        { id: "seed-2", title: "Driftwood Token", region: "archipelago" },
      ],
      level: 2,
    };
  };

  const initial = loadInitial();

  const [regions, setRegions] = useState(initial.regions);
  const [quests, setQuests] = useState(initial.quests);
  const [xp, setXp] = useState(initial.xp);
  const [collections, setCollections] = useState(initial.collections);
  const [playerLevel, setPlayerLevel] = useState(initial.level);
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // compute derived level but keep playerLevel persisted
  const computedLevel = useMemo(() => Math.floor(xp / 200) + 1, [xp]);

  useEffect(() => {
    // update playerLevel only when computedLevel changes
    if (computedLevel !== playerLevel) {
      setPlayerLevel(computedLevel);
    }
  }, [computedLevel]);

  const title = useMemo(() => {
    if (playerLevel >= 6) return "Cartographer";
    if (playerLevel >= 4) return "Nomad";
    if (playerLevel >= 2) return "Wanderer";
    return "Explorer";
  }, [playerLevel]);

  function completeQuest(qid) {
    // use functional updates to avoid stale reads
    let questFound = null;
    setQuests(prev => prev.map(q => {
      if (q.id === qid) { questFound = { ...q, progress: 1 }; return { ...q, progress: 1 }; }
      return q;
    }));
    if (!questFound) return;
    setXp(prevXp => {
      const newXp = prevXp + questFound.reward.xp;
      return newXp;
    });
    setCollections(c => [{ id: questFound.reward.token + "-" + Date.now(), title: questFound.reward.token, region: questFound.targetRegion }, ...c]);
    setRegions(prev => prev.map(r => {
      if (r.id === questFound.targetRegion && !r.unlocked) {
        // mark recently unlocked for animation
        setRecentlyUnlocked(r.id);
        setTimeout(() => setRecentlyUnlocked(null), 1600);
        return { ...r, unlocked: true };
      }
      return r;
    }));
  }

  const exploreRegion = useCallback((regionId) => {
    // set active region id as the single source of truth for selection
    setActiveRegionId(regionId);
  }, [setActiveRegionId]);

  function claimMemory(regionId) {
    const token = `${regionId}-memory-${Date.now()}`;
    setCollections(c => [{ id: token, title: `${regionId} Memory`, region: regionId }, ...c]);
    setXp(x => x + 20);
  }

  // show level-up briefly when playerLevel increases
  const prevLevelRef = useRef(playerLevel);
  useEffect(() => {
    if (prevLevelRef.current < playerLevel) {
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 1800);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = playerLevel;
  }, [playerLevel]);

  // persist state to localStorage when key pieces change
  useEffect(() => {
    const toSave = { regions, quests, xp, collections, level: playerLevel };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      // ignore storage errors
    }
  }, [regions, quests, xp, collections, playerLevel]);

  const activeRegion = useMemo(() => regions.find(r => r.id === activeRegionId) || null, [regions, activeRegionId]);

  const [mapReady, setMapReady] = useState(false);
  useEffect(() => { setMapReady(true); }, []);

  return (
    <div className="worldbound-page">
      <NewNavbar />
      <div className="worldbound-container">
        <div className="left-col">
          {mapReady && (
            <WorldboundMap regions={regions} onRegionClick={exploreRegion} recentlyUnlocked={recentlyUnlocked} activeRegionId={activeRegionId} />
          )}
          <CollectionPanel collections={collections} />
        </div>
        <div className="right-col">
          <ProgressPanel xp={xp} level={playerLevel} title={title} showLevelUp={showLevelUp} />
          <QuestPanel quests={quests} onComplete={completeQuest} />
        </div>
      </div>
      <RegionModal region={activeRegion} onClose={() => setActiveRegionId(null)} onClaim={claimMemory} />
    </div>
  );
}
