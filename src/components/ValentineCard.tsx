import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function dist(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function ValentineCard() {
  // Tune these to change how "annoyingly close" it lets you get.
  const DODGE_RADIUS_PX = 55; // lower = you can get closer before it dodges
  const MIN_RESPAWN_DISTANCE_PX = 80; // keep it from respawning under your cursor

  // IMPORTANT: Use Vite's base URL so media works on GitHub Pages
  // (where the site is served from /be-my-valentine/).
  const BASE_URL = import.meta.env.BASE_URL;

  // Put the audio file in: public/audio/spring-snow-10cm.mp3
  const MUSIC_SRC_MP3 = `${BASE_URL}audio/spring-snow-10cm.mp3`;
  const MUSIC_SRC_OGG = `${BASE_URL}audio/spring-snow-10cm.ogg`; // optional fallback
  const MUSIC_VOLUME = 0.35;

  // Put the video file in: public/video/accepted.mp4
  const ACCEPTED_VIDEO_SRC_MP4 = `${BASE_URL}video/accepted.mp4`;

  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState<Point | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMoveAtRef = useRef<number>(0);
  const noArmedRef = useRef(false);

  // Arm the "No" movement shortly after initial paint so it starts aligned,
  // and doesn't jump immediately if the cursor is already hovering that area.
  useEffect(() => {
    const t = window.setTimeout(() => {
      noArmedRef.current = true;
    }, 450);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = MUSIC_VOLUME;
    a.loop = true;
  }, [MUSIC_VOLUME]);

  const moveNo = useCallback((pointerClient?: Point) => {
    if (!noArmedRef.current) return;

    const arena = arenaRef.current;
    const noBtn = noRef.current;
    if (!arena || !noBtn) return;

    const arenaRect = arena.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesRef.current?.getBoundingClientRect() ?? null;

    const padding = 10;
    const maxX = Math.max(padding, arenaRect.width - noRect.width - padding);
    const maxY = Math.max(padding, arenaRect.height - noRect.height - padding);

    const pointer: Point = pointerClient
      ? { x: pointerClient.x - arenaRect.left, y: pointerClient.y - arenaRect.top }
      : { x: arenaRect.width / 2, y: arenaRect.height / 2 };

    const minDistance = MIN_RESPAWN_DISTANCE_PX;
    const tries = 30;

    const yesLocal =
      yesRect && yesRect.width > 0 && yesRect.height > 0
        ? {
            left: yesRect.left - arenaRect.left,
            top: yesRect.top - arenaRect.top,
            right: yesRect.right - arenaRect.left,
            bottom: yesRect.bottom - arenaRect.top
          }
        : null;

    for (let i = 0; i < tries; i++) {
      const x = Math.random() * (maxX - padding) + padding;
      const y = Math.random() * (maxY - padding) + padding;

      const candidateCenter = { x: x + noRect.width / 2, y: y + noRect.height / 2 };
      if (dist(candidateCenter, pointer) < minDistance) continue;

      if (yesLocal) {
        const overlap =
          x < yesLocal.right &&
          x + noRect.width > yesLocal.left &&
          y < yesLocal.bottom &&
          y + noRect.height > yesLocal.top;
        if (overlap) continue;
      }

      setNoPos({ x: clamp(x, padding, maxX), y: clamp(y, padding, maxY) });
      return;
    }

    // Fallback: move anyway, even if it's close.
    const x = Math.random() * (maxX - padding) + padding;
    const y = Math.random() * (maxY - padding) + padding;
    setNoPos({ x: clamp(x, padding, maxX), y: clamp(y, padding, maxY) });
  }, [MIN_RESPAWN_DISTANCE_PX]);

  const moveNoIfPointerClose = useCallback(
    (pointerClient: Point) => {
      if (!noArmedRef.current) return;

      const arena = arenaRef.current;
      const noBtn = noRef.current;
      if (!arena || !noBtn) return;

      const now = performance.now();
      if (now - lastMoveAtRef.current < 120) return;

      const arenaRect = arena.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();

      const pointerInArena = {
        x: pointerClient.x - arenaRect.left,
        y: pointerClient.y - arenaRect.top
      };

      const noCenterInArena = {
        x: noRect.left - arenaRect.left + noRect.width / 2,
        y: noRect.top - arenaRect.top + noRect.height / 2
      };

      // If the cursor gets close, dodge (not just on hover enter).
      if (dist(pointerInArena, noCenterInArena) < DODGE_RADIUS_PX) {
        lastMoveAtRef.current = now;
        moveNo(pointerClient);
      }
    },
    [DODGE_RADIUS_PX, moveNo]
  );

  // Set an initial position for the No button after measuring.
  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const noBtn = noRef.current;
    if (!arena || !noBtn) return;

    const arenaRect = arena.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const padding = 10;

    // Start aligned: centered in the right half of the arena, vertically centered.
    const startXRaw = arenaRect.width * 0.75 - noRect.width / 2;
    const startYRaw = arenaRect.height * 0.5 - noRect.height / 2;
    const startX = clamp(startXRaw, padding, arenaRect.width - noRect.width - padding);
    const startY = clamp(startYRaw, padding, arenaRect.height - noRect.height - padding);
    setNoPos({ x: startX, y: startY });
  }, []);

  // Keep No button clamped on resize.
  useEffect(() => {
    const onResize = () => {
      const arena = arenaRef.current;
      const noBtn = noRef.current;
      if (!arena || !noBtn || !noPos) return;

      const arenaRect = arena.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();
      const padding = 10;
      const maxX = Math.max(padding, arenaRect.width - noRect.width - padding);
      const maxY = Math.max(padding, arenaRect.height - noRect.height - padding);

      setNoPos((p) => (p ? { x: clamp(p.x, padding, maxX), y: clamp(p.y, padding, maxY) } : p));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [noPos]);

  const playMusic = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      // Start from the beginning when accepted.
      a.currentTime = 0;
      await a.play();
    } catch {
      // If the file is missing or playback is blocked, fail silently.
    }
  }, []);

  return (
    <section className={accepted ? "card card--accepted" : "card"} aria-live="polite">
      {!accepted ? (
        <>
          <p className="card__eyebrow">Hey Anjali, quick question…</p>
          <h1 className="card__title">Will you be my Valentine?</h1>
          <p className="card__subtitle">Choose wisely. (Or… try to.)</p>

          <div
            className="arena"
            ref={arenaRef}
            onPointerMove={(e) => moveNoIfPointerClose({ x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => moveNoIfPointerClose({ x: e.clientX, y: e.clientY })}
          >
            <div className="arena__yesSlot">
              <button
                ref={yesRef}
                className="btn btn--yes"
                type="button"
                onClick={() => {
                  setAccepted(true);
                  setCelebrateKey((k) => k + 1);
                  void playMusic();
                }}
              >
                Yes
              </button>
            </div>

            <button
              ref={noRef}
              className="btn btn--no"
              type="button"
              tabIndex={-1}
              style={
                noPos
                  ? {
                      position: "absolute",
                      left: `${noPos.x}px`,
                      top: `${noPos.y}px`
                    }
                  : {
                      position: "absolute",
                      left: "75%",
                      top: "50%",
                      transform: "translate(-50%, -50%)"
                    }
              }
              aria-label="No (this button will move)"
              onPointerEnter={(e) => moveNo({ x: e.clientX, y: e.clientY })}
              onMouseEnter={(e) => moveNo({ x: e.clientX, y: e.clientY })}
              onPointerMove={(e) => moveNoIfPointerClose({ x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => moveNoIfPointerClose({ x: e.clientX, y: e.clientY })}
              onMouseDown={(e) => {
                // Prevent the button from taking focus on click.
                e.preventDefault();
              }}
              onPointerDown={(e) => {
                // Extra safety so it can't be clicked even if timing is perfect.
                e.preventDefault();
                // Move immediately on click attempt even during the initial unarmed period.
                noArmedRef.current = true;
                moveNo({ x: e.clientX, y: e.clientY });
              }}
            >
              No
            </button>
          </div>
        </>
      ) : (
        <>
          <div key={celebrateKey} className="celebrate" aria-hidden="true">
            <span className="sparkle sparkle--1" />
            <span className="sparkle sparkle--2" />
            <span className="sparkle sparkle--3" />
            <span className="sparkle sparkle--4" />
            <span className="sparkle sparkle--5" />
          </div>

          <div className="acceptedLayout">
            <div className="acceptedText">
              <p className="card__eyebrow">Yayyyyy!</p>
              <h1 className="card__title card__title--accepted">You just made my day.</h1>
              <p className="card__subtitle card__subtitle--accepted">
                Happy Valentine’s Day, my favorite person. <br />
                My apologies for not being there but I will make it up to you. <br />
                I love you so much.
              </p>

              <div className="acceptedActions">
                <span className="acceptedActions__badge" aria-hidden="true">
                  💗 Officially Valentines 💗
                </span>
              </div>
            </div>

            <div className="acceptedVideoWrap" aria-label="Valentine video">
              <video
                className="acceptedVideo"
                src={ACCEPTED_VIDEO_SRC_MP4}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </div>
          </div>
        </>
      )}

      <audio ref={audioRef} className="audioEl" preload="auto">
        <source src={MUSIC_SRC_MP3} type="audio/mpeg" />
        <source src={MUSIC_SRC_OGG} type="audio/ogg" />
      </audio>

      <p className="card__footer" aria-hidden="true">
        Made with love. ❤️
      </p>
    </section>
  );
}
