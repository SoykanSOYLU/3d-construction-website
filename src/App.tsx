import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const TOTAL_FRAMES = 152;
const ZOOM_FACTOR = 1.35;

export default function App() {
  const [activeTab, setActiveTab] = useState("Ana Sayfa");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const chapter2CardRef = useRef<HTMLDivElement>(null);

  // High-performance direct DOM references
  const frameLabelRef = useRef<HTMLSpanElement>(null);
  const frameLabelMobileRef = useRef<HTMLSpanElement>(null);
  const scrollLabelRef = useRef<HTMLSpanElement>(null);
  const scrollLabelMobileRef = useRef<HTMLSpanElement>(null);

  // Pad numbers with leading zeros (e.g. 1 -> "001")
  const pad = (num: number, size: number) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const handleImageLoad = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      setLoadingProgress(progress);
      if (loadedCount === TOTAL_FRAMES) {
        imagesRef.current = images;
        setIsLoaded(true);
      }
    };

    const handleImageError = () => {
      // Still increment count so we don't get stuck if a frame fails
      loadedCount++;
      const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      setLoadingProgress(progress);
      if (loadedCount === TOTAL_FRAMES) {
        imagesRef.current = images;
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/frames/frame_${pad(i, 4)}.jpg`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      images.push(img);
    }
  }, []);

  // Set up canvas physical size based on CSS display size & Device Pixel Ratio
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  };

  // Frame drawing logic
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Clear canvas without resetting width/height/scale
    ctx.clearRect(0, 0, width, height);

    // Apply high-quality smoothing settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (canvasRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imgRatio;
    }

    const finalWidth = drawWidth * ZOOM_FACTOR;
    const finalHeight = drawHeight * ZOOM_FACTOR;

    const x = (width - finalWidth) / 2;
    const y = (height - finalHeight) / 2;

    ctx.drawImage(img, x, y, finalWidth, finalHeight);
  };

  // Scroll to frame mapping
  useEffect(() => {
    if (!isLoaded) return;

    // Resize canvas once initially to match dimensions
    resizeCanvas();

    // Draw initial frame
    drawFrame(0);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScroll <= 0 ? 0 : scrollTop / maxScroll;

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(scrollFraction * TOTAL_FRAMES))
      );

      if (currentFrameRef.current !== frameIndex) {
        currentFrameRef.current = frameIndex;
        requestAnimationFrame(() => drawFrame(frameIndex));

        // High-performance DOM updates
        if (frameLabelRef.current) {
          frameLabelRef.current.textContent = `KARE ${pad(frameIndex + 1, 4)} / ${TOTAL_FRAMES}`;
        }
        if (frameLabelMobileRef.current) {
          frameLabelMobileRef.current.textContent = `KARE ${pad(frameIndex + 1, 4)} / ${TOTAL_FRAMES}`;
        }
      }

      // Update state for opacity of sections
      const roundedPercent = Math.round(scrollFraction * 100);
      setScrollPercent(roundedPercent);
      if (scrollLabelRef.current) {
        scrollLabelRef.current.textContent = `KAYDIRMA %${roundedPercent}`;
      }
      if (scrollLabelMobileRef.current) {
        scrollLabelMobileRef.current.textContent = `KAYDIRMA %${roundedPercent}`;
      }

      // Update active tab in navbar dynamically based on scroll position
      if (roundedPercent < 20) {
        setActiveTab("Ana Sayfa");
      } else if (roundedPercent >= 20 && roundedPercent < 45) {
        setActiveTab("Projelerimiz");
      } else if (roundedPercent >= 45 && roundedPercent < 70) {
        setActiveTab("Hakkımızda");
      } else if (roundedPercent >= 70 && roundedPercent < 92) {
        setActiveTab("Günlük");
      } else {
        setActiveTab("Bize Ulaşın");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoaded]);

  // Window resize handler
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      resizeCanvas();
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded]);

  // Mouse parallax logic
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const offsetX = clientX / innerWidth - 0.5;
      const offsetY = clientY / innerHeight - 0.5;

      const movementX = offsetX * -40;
      const movementY = offsetY * -40;

      gsap.to(canvas, {
        x: movementX,
        y: movementY,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoaded]);

  // Chapter 2 card 3D tilt effect
  useEffect(() => {
    if (!isLoaded) return;

    const handleMouseMove = (e: MouseEvent) => {
      const card = chapter2CardRef.current;
      if (!card) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const offsetX = (clientX / innerWidth) - 0.5;
      const offsetY = (clientY / innerHeight) - 0.5;

      gsap.to(card, {
        rotateX: offsetY * -25,  // Subtle vertical tilt
        rotateY: offsetX * 25, // Subtle horizontal tilt
        x: offsetX * 30,        // Light horizontal translation
        y: offsetY * 30,        // Light vertical translation
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoaded]);

  // Navigation click handlers
  const handleNavLinkClick = (link: string) => {
    setActiveTab(link);
    setMobileMenuOpen(false);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (link === "Ana Sayfa") {
      gsap.to(window, { scrollTo: 0, duration: 1.5, ease: "power3.inOut" });
    } else if (link === "Bize Ulaşın") {
      gsap.to(window, { scrollTo: maxScroll, duration: 2, ease: "power3.inOut" });
    } else if (link === "Projelerimiz") {
      // Chapter 2 center is around 31% scroll
      gsap.to(window, { scrollTo: maxScroll * 0.31, duration: 1.5, ease: "power3.inOut" });
    } else if (link === "Hakkımızda") {
      // Chapter 3 center is around 58% scroll
      gsap.to(window, { scrollTo: maxScroll * 0.58, duration: 1.5, ease: "power3.inOut" });
    } else if (link === "Günlük") {
      // Chapter 4 waitlist start is around 85% scroll
      gsap.to(window, { scrollTo: maxScroll * 0.85, duration: 1.8, ease: "power3.inOut" });
    }
  };

  const handleScrollToTop = () => {
    gsap.to(window, { scrollTo: 0, duration: 2, ease: "power3.inOut" });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg("Lütfen bir e-posta adresi girin.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setIsSubmitted(true);
    setErrorMsg("");
  };

  // Helper for computing opacity in non-overlapping intervals
  const getOpacityForInterval = (
    percent: number,
    startFadeIn: number,
    endFadeIn: number,
    startFadeOut: number,
    endFadeOut: number
  ) => {
    if (percent < startFadeIn || percent > endFadeOut) return 0;
    if (percent >= endFadeIn && percent <= startFadeOut) return 1;
    if (percent < endFadeIn) {
      if (endFadeIn === startFadeIn) return 1;
      return (percent - startFadeIn) / (endFadeIn - startFadeIn);
    } else {
      if (endFadeOut === startFadeOut) return 1;
      return 1 - (percent - startFadeOut) / (endFadeOut - startFadeOut);
    }
  };

  const navLinks = ["Ana Sayfa", "Projelerimiz", "Hakkımızda", "Günlük", "Bize Ulaşın"];

  // Loading Screen
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="text-center flex flex-col items-center max-w-sm w-full animate-fade-rise">
          <h2
            className="text-4xl sm:text-5xl font-normal tracking-tight mb-8"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            nakyoS Studio
          </h2>
          <div
            className="text-6xl font-light tracking-widest mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {loadingProgress}%
          </div>
          <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-white transition-all duration-150 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
            Sinematik Sekans Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[300vh] md:min-h-[500vh] text-white selection:bg-white/20">
      {/* Fullscreen Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-[106vw] h-[106vh] left-[-3vw] top-[-3vh] pointer-events-none z-0 transform scale-[1.05]"
      />

      {/* Smooth Gradient Blur Header Background */}
      <div 
        className="fixed top-0 left-0 right-0 h-48 pointer-events-none z-30"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 100%)"
        }}
      />

      {/* Floating Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <a
            href="#"
            onClick={() => handleNavLinkClick("Ana Sayfa")}
            className="text-3xl tracking-tight text-white select-none cursor-pointer"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            nakyoS<sup className="text-xs font-sans align-super ml-0.5">®</sup>
          </a>

          <div className="hidden md:flex flex-row items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleNavLinkClick(link)}
                className={`text-sm tracking-wide transition-colors duration-200 cursor-pointer ${activeTab === link
                  ? "text-white font-medium"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                {link}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button
              onClick={() => handleNavLinkClick("Bize Ulaşın")}
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform duration-200 cursor-pointer font-medium"
            >
              Yolculuğa Başla
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors focus:outline-none z-50 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-8 backdrop-blur-md transition-all duration-500 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {/* Close Button in Top-Right */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-8 p-2 text-white/60 hover:text-white transition-colors focus:outline-none cursor-pointer"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col space-y-8 text-center">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleNavLinkClick(link)}
              className={`text-3xl tracking-tight transition-colors duration-200 cursor-pointer ${activeTab === link
                ? "text-white font-semibold"
                : "text-white/60 hover:text-white"
                }`}
              style={{ fontFamily: link === "Ana Sayfa" ? "inherit" : "'Instrument Serif', serif" }}
            >
              {link}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleNavLinkClick("Bize Ulaşın");
            }}
            className="liquid-glass rounded-full px-8 py-4 text-base text-white mt-6 hover:scale-[1.03] transition-transform duration-200 cursor-pointer font-medium"
          >
            Yolculuğa Başla
          </button>
        </div>
      </div>

      {/* Camera Viewfinder Overlay (Desktop) */}
      <div className="fixed inset-0 pointer-events-none z-30 p-8 hidden md:flex flex-col justify-between text-[10px] font-mono tracking-widest text-white/30 uppercase select-none">
        <div className="flex justify-between items-center w-full mt-16">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>NAKYOS REC_CAM v1.0.3</span>
          </div>
          <div>
            <span ref={frameLabelRef}>KARE 0001 / {TOTAL_FRAMES}</span>
          </div>
        </div>

        <div className="flex justify-between items-center w-full">
          <div>
            <span>SHUTTER 1/48 // ASPECT 2.39:1</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ZOOM x{ZOOM_FACTOR.toFixed(2)}</span>
            <span ref={scrollLabelRef}>KAYDIRMA %0</span>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Overlay (Mobile Top Row) */}
      <div className="fixed inset-0 pointer-events-none z-30 p-4 flex flex-col justify-between md:hidden text-[9px] font-mono tracking-widest text-white/30 uppercase select-none">
        <div className="flex justify-between items-center w-full mt-16">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>NAKYOS REC_CAM</span>
          </div>
          <div>
            <span ref={frameLabelMobileRef}>KARE 0001 / {TOTAL_FRAMES}</span>
          </div>
        </div>
      </div>

      {/* Mobile Left Vertical Viewfinder Stats */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex md:hidden flex-col items-center justify-center w-4 h-[400px] pointer-events-none select-none text-[8px] font-mono tracking-widest text-white/30 uppercase">
        <div className="rotate-90 whitespace-nowrap origin-center absolute translate-y-[-112px] w-48 h-4 flex items-center justify-center">
          <span>SHUTTER 1/48 // ASPECT 2.39:1</span>
        </div>
        <div className="rotate-90 whitespace-nowrap origin-center absolute translate-y-[112px] w-48 h-4 flex items-center justify-center">
          <span>
            ZOOM x{ZOOM_FACTOR.toFixed(2)} // <span ref={scrollLabelMobileRef}>KAYDIRMA %0</span>
          </span>
        </div>
      </div>

      {/* Cinematic Chapters (Overlay Text) */}
      <div className="fixed inset-0 pointer-events-none z-20 flex items-center justify-center px-6">
        {/* Chapter 1: Hero Section */}
        <div
          className="absolute bottom-20 md:bottom-24 flex flex-col items-center text-center max-w-4xl px-4"
          style={{
            opacity: getOpacityForInterval(scrollPercent, 0, 0, 12, 18),
            pointerEvents: scrollPercent <= 18 ? "auto" : "none"
          }}
        >
          <h1
            className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] font-normal text-white select-none"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Hayallerin <em className="not-italic text-white/50">sessizlikten</em> yükseldiği
            <em className="not-italic text-white/50"> yer.</em>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-normal">
            Derin düşünenler, cesur yaratıcılar ve sessiz asiler için dijital alanlar tasarlıyoruz.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs tracking-[0.25em] text-white/30 uppercase animate-pulse">
            <span>Keşfetmek için kaydırın</span>
          </div>
        </div>

        {/* Chapter 2: The Space */}
        <div
          className="absolute flex flex-col items-center text-center max-w-4xl w-full px-10 md:px-4"
          style={{
            perspective: "1000px"
          }}
        >
          <div
            ref={chapter2CardRef}
            className="liquid-glass w-full rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              opacity: getOpacityForInterval(scrollPercent, 23, 28, 38, 43),
              pointerEvents: (scrollPercent >= 23 && scrollPercent <= 43) ? "auto" : "none",
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono mb-6 text-center block">
              Projelerimiz
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight font-normal text-white text-center font-display"
            >
              Trabzon genelinde, steril betonu <em className="not-italic font-display italic text-white/60">modern yaşam alanlarına</em> ve estetik yapılara dönüştürüyoruz. Yenilikçi <em className="not-italic font-display italic text-white/60">mimari tasarımlarımızla</em> Of'tan Akçaabat'a sağlam temeller atıyor, <em className="not-italic font-display italic text-white/60">şehrin geleceğini</em> inşa ediyoruz.
            </h2>

            {/* Infinite Marquee Ticker */}
            <div className="relative w-full overflow-hidden mt-10 py-2">
              <div
                className="flex w-max gap-16 whitespace-nowrap animate-marquee"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
                }}
              >
                {/* Original Array */}
                {["Ortahisar", "Akçaabat", "Of", "Maçka", "Sürmene", "Yomra"].map((logo, idx) => (
                  <span
                    key={idx}
                    className="text-base sm:text-lg font-medium tracking-widest text-white opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer font-mono px-4"
                  >
                    {logo}
                  </span>
                ))}
                {/* Duplicated Array */}
                {["Ortahisar", "Akçaabat", "Of", "Maçka", "Sürmene", "Yomra"].map((logo, idx) => (
                  <span
                    key={`dup-${idx}`}
                    className="text-base sm:text-lg font-medium tracking-widest text-white opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer font-mono px-4"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 3: Engineering */}
        <div
          className="absolute flex flex-col items-center text-center max-w-xl w-full px-10 md:px-0"
        >
          <div
            className="liquid-glass w-full rounded-3xl p-8 sm:p-10 text-center relative"
            style={{
              opacity: getOpacityForInterval(scrollPercent, 48, 53, 63, 68),
              pointerEvents: (scrollPercent >= 48 && scrollPercent <= 68) ? "auto" : "none"
            }}
          >
            <h2
              className="text-4xl sm:text-5xl leading-[1.1] tracking-tight font-normal text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Mühendislik <em className="not-italic text-white/50">akışkan hareketle</em> buluşuyor.
            </h2>
            <p className="text-white/60 text-sm sm:text-base mt-6 leading-relaxed max-w-md mx-auto">
              Yüksek performanslı canvas matematiği ve pürüzsüz donanım hızlandırmalı animasyonlarla oluşturulmuş hafif bir görselleştirme motoru.
            </p>
          </div>
        </div>

        {/* Chapter 4 / CTA (Interactive waitlist form) */}
        <div
          className="absolute flex flex-col items-center text-center max-w-xl w-full px-10 md:px-4"
        >
          <div
            className="liquid-glass w-full rounded-3xl p-6 sm:p-10 text-center relative max-h-[85vh] overflow-y-auto"
            style={{
              opacity: getOpacityForInterval(scrollPercent, 73, 78, 100, 100),
              pointerEvents: scrollPercent >= 73 ? "auto" : "none",
            }}
          >
            {!isSubmitted ? (
              <div className="flex flex-col items-center">
                <span
                  className="text-2xl sm:text-4xl text-white font-normal tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Sessiz Çalışma Alanına Girin
                </span>
                <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-sm">
                  nakyoS Studio bekleme listesine katılın. Dijital alanlarımıza özel erişim kodlarını kademeli olarak sunuyoruz.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-8 w-full flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="E-posta adresiniz"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setErrorMsg("");
                      }}
                      className="w-full px-6 py-4 bg-white/[0.02] border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm transition-colors"
                    />
                  </div>
                  {errorMsg && (
                    <span className="text-xs font-medium text-red-400 text-left px-3 block">
                      {errorMsg}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="liquid-glass w-full rounded-full py-4 px-6 text-sm text-white font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Davetiye Talep Et</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-6 flex items-center gap-1.5 justify-center text-[11px] tracking-wider text-white/65 uppercase font-mono">
                  <span>nakyoS® Kriptografik Paketi ile Korunmaktadır</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white mb-6 animate-pulse">
                  <Check size={20} />
                </div>
                <span
                  className="text-3xl text-white font-normal tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Alanınız rezerve edildi
                </span>
                <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
                  Kayıt olduğunuz için teşekkürler. Onay e-postası <strong className="text-white">{emailInput}</strong> adresine gönderildi. Portalınız hazır olduğunda sizi bilgilendireceğiz.
                </p>
                <button
                  onClick={handleScrollToTop}
                  className="liquid-glass rounded-full px-8 py-3 text-sm text-white mt-8 hover:scale-[1.03] transition-transform duration-200 cursor-pointer font-medium"
                >
                  Sessizliğe Geri Dön
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Progress Scroll Bar */}
      <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 sm:gap-4 w-4 sm:w-auto">
        <div className="relative w-full h-12 sm:h-auto flex items-center justify-center">
          <span className="text-[9px] font-mono text-white/30 rotate-90 origin-center absolute sm:relative sm:translate-y-[-10px] w-32 sm:w-auto h-4 sm:h-auto flex items-center justify-center whitespace-nowrap">
            İLERLEME
          </span>
        </div>
        <div className="w-[2px] h-[120px] bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-white transition-all duration-100 ease-out rounded-full"
            style={{ height: `${scrollPercent}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-white/30">
          %{Math.round(scrollPercent)}
        </span>
      </div>

      {/* Ambient Footer */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest text-white/60 font-mono select-none uppercase text-center w-full max-w-[90vw] whitespace-nowrap">
        © {new Date().getFullYear()} nakyoS Studio. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
