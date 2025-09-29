import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  initIntroAnimations();
  initSpotlightAnimations();
  initOutroAnimations();
  window.addEventListener("resize", initSpotlightAnimations);

  function initIntroAnimations() {
    const introSection = document.querySelector('.intro');
    
    // Progressive Swiss poster reveal sequence
    const timeline = gsap.timeline();
    
    timeline
      // Phase 1: Initial state (typography only) - 2 seconds
      .set(introSection, { className: "intro" })
      .to({}, { duration: 2 })
      
      // Phase 2: Grid and registration marks - 1.5 seconds
      .add(() => {
        introSection.classList.add('phase-2');
      })
      .to({}, { duration: 1.5 })
      
      // Phase 3: Edge markers - 1 second
      .add(() => {
        introSection.classList.add('phase-3');
      })
      .to({}, { duration: 1 })
      
      // Phase 4: Metadata elements - final state
      .add(() => {
        introSection.classList.add('phase-4');
      });
  }

  function initSpotlightAnimations() {
    const images = document.querySelectorAll(".img");
    const coverImg = document.querySelector(".spotlight-cover-img");
    const introHeader = document.querySelector(".spotlight-intro-header h1");
    const outroHeader = document.querySelector(".spotlight-outro-header h1");

    let introHeaderSplit = null;
    let outroHeaderSplit = null;

    introHeaderSplit = SplitText.create(introHeader, { type: "words" });
    gsap.set(introHeaderSplit.words, { opacity: 1 });

    outroHeaderSplit = SplitText.create(outroHeader, { type: "words" });
    gsap.set(outroHeaderSplit.words, { opacity: 0 });
    gsap.set(outroHeader, { opacity: 1 });

    const scatterDirections = [
      { x: 1.3, y: 0.7 },
      { x: -1.5, y: 1.0 },
      { x: 1.1, y: -1.3 },
      { x: -1.7, y: -0.8 },
      { x: 0.8, y: 1.5 },
      { x: -1.0, y: -1.4 },
      { x: 1.6, y: 0.3 },
      { x: -0.7, y: 1.7 },
      { x: 1.2, y: -1.6 },
      { x: -1.4, y: 0.9 },
      { x: 1.8, y: -0.5 },
      { x: -1.1, y: -1.8 },
      { x: 0.9, y: 1.8 },
      { x: -1.9, y: 0.4 },
      { x: 1.0, y: -1.9 },
      { x: -0.8, y: 1.9 },
      { x: 1.7, y: -1.0 },
      { x: -1.3, y: -1.2 },
      { x: 0.7, y: 2.0 },
      { x: 1.25, y: -0.2 },
    ];

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = window.innerWidth < 1000;
    const scatterMultiplier = isMobile ? 2.5 : 0.5;

    const startPositions = Array.from(images).map(() => ({
      x: 0,
      y: 0,
      z: -1000,
      scale: 0,
    }));

    const endPositions = scatterDirections.map((dir) => ({
      x: dir.x * screenWidth * scatterMultiplier,
      y: dir.y * screenHeight * scatterMultiplier,
      z: 2000,
      scale: 1,
    }));

    images.forEach((img, index) => {
      gsap.set(img, startPositions[index]);
    });

    gsap.set(coverImg, {
      z: -1000,
      scale: 0,
      x: 0,
      y: 0,
    });

    ScrollTrigger.create({
      trigger: ".spotlight",
      start: "top top",
      end: `+=${window.innerHeight * 6}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        images.forEach((img, index) => {
          const staggerDelay = index * 0.03;
          const scaleMultiplier = isMobile ? 4 : 2;

          let imageProgress = Math.max(0, (progress - staggerDelay) * 4);

          const start = startPositions[index];
          const end = endPositions[index];

          const zValue = gsap.utils.interpolate(start.z, end.z, imageProgress);
          const scaleValue = gsap.utils.interpolate(
            start.scale,
            end.scale,
            imageProgress * scaleMultiplier
          );
          const xValue = gsap.utils.interpolate(start.x, end.x, imageProgress);
          const yValue = gsap.utils.interpolate(start.y, end.y, imageProgress);

          gsap.set(img, {
            z: zValue,
            scale: scaleValue,
            x: xValue,
            y: yValue,
          });
        });

        const coverProgress = Math.max(0, (progress - 0.7) * 4);
        const coverZValue = -1000 + 1000 * coverProgress;
        const coverScaleValue = Math.min(1, coverProgress * 2);

        gsap.set(coverImg, {
          z: coverZValue,
          scale: coverScaleValue,
          x: 0,
          y: 0,
        });

        // Animate Swiss cross lines and corner dots
        const horizontalLine = document.querySelector('.swiss-cross-horizontal');
        const verticalLine = document.querySelector('.swiss-cross-vertical');
        const cornerDots = document.querySelectorAll('.corner-dot');
        
        if (horizontalLine && verticalLine && cornerDots.length > 0) {
          const animationStart = 0.72;
          const totalProgress = Math.max(0, (progress - animationStart) * 8);
          
          // Sequential corner dots (clockwise: tl, tr, br, bl)
          const dotTimings = [0, 0.15, 0.3, 0.45]; // Staggered timing
          cornerDots.forEach((dot, index) => {
            const dotProgress = Math.max(0, Math.min(1, (totalProgress - dotTimings[index]) * 4));
            gsap.set(dot, { 
              opacity: dotProgress,
              scale: dotProgress 
            });
          });
          
          // Lines start after first two dots
          const lineProgress = Math.max(0, totalProgress - 0.2);
          const horizontalWidth = Math.min(100, lineProgress * 100);
          const verticalHeight = Math.min(100, Math.max(0, (lineProgress - 0.2) * 100));
          
          gsap.set(horizontalLine, { width: `${horizontalWidth}%` });
          gsap.set(verticalLine, { height: `${verticalHeight}%` });
        }

        if (introHeaderSplit && introHeaderSplit.words.length > 0) {
          if (progress >= 0.68 && progress <= 0.78) {
            const introFadeProgress = (progress - 0.68) / 0.1;
            const totalWords = introHeaderSplit.words.length;

            introHeaderSplit.words.forEach((word, index) => {
              const wordFadeProgress = index / totalWords;
              const fadeRange = 0.1;

              if (introFadeProgress >= wordFadeProgress + fadeRange) {
                gsap.set(word, { opacity: 0 });
              } else if (introFadeProgress <= wordFadeProgress) {
                gsap.set(word, { opacity: 1 });
              } else {
                const wordOpacity =
                  1 - (introFadeProgress - wordFadeProgress) / fadeRange;
                gsap.set(word, { opacity: wordOpacity });
              }
            });
          } else if (progress < 0.68) {
            gsap.set(introHeaderSplit.words, { opacity: 1 });
          } else if (progress > 0.78) {
            gsap.set(introHeaderSplit.words, { opacity: 0 });
          }
        }

        if (outroHeaderSplit && outroHeaderSplit.words.length > 0) {
          if (progress >= 0.8 && progress <= 0.95) {
            const outroRevealProgress = (progress - 0.8) / 0.15;
            const totalWords = outroHeaderSplit.words.length;

            outroHeaderSplit.words.forEach((word, index) => {
              const wordRevealProgress = index / totalWords;
              const fadeRange = 0.1;

              if (outroRevealProgress >= wordRevealProgress + fadeRange) {
                gsap.set(word, { opacity: 1 });
              } else if (outroRevealProgress <= wordRevealProgress) {
                gsap.set(word, { opacity: 0 });
              } else {
                const wordOpacity =
                  (outroRevealProgress - wordRevealProgress) / fadeRange;
                gsap.set(word, { opacity: wordOpacity });
              }
            });
          } else if (progress < 0.8) {
            gsap.set(outroHeaderSplit.words, { opacity: 0 });
          } else if (progress > 0.95) {
            gsap.set(outroHeaderSplit.words, { opacity: 1 });
          }
        }
      },
    });
  }

  function initOutroAnimations() {
    const outroSection = document.querySelector('.outro');
    
    ScrollTrigger.create({
      trigger: outroSection,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        // Progressive reveal sequence (text stays static)
        gsap.timeline()
          .to('.grid-contact-options', { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: "power2.out" 
          })
          .to('.grid-contact-form', { 
            opacity: 1, 
            x: 0, 
            duration: 0.8, 
            ease: "power2.out" 
          }, "-=0.4");
      },
      onLeave: () => {
        // Reset animation when scrolling past
        gsap.set(['.grid-contact-options'], { opacity: 0, y: 32 });
        gsap.set(['.grid-contact-form'], { opacity: 0, x: 32 });
      },
      onEnterBack: () => {
        // Re-trigger animation when scrolling back up
        gsap.timeline()
          .to('.grid-contact-options', { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: "power2.out" 
          })
          .to('.grid-contact-form', { 
            opacity: 1, 
            x: 0, 
            duration: 0.8, 
            ease: "power2.out" 
          }, "-=0.4");
      }
    });
  }
});
