import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

function App() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const eventsSectionRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const aboutDestinationRef = useRef<HTMLDivElement>(null);
  const eventsDestinationRef = useRef<HTMLDivElement>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  const [placeholderSize, setPlaceholderSize] = useState(150);

  const getNavbarHeight = () => {
    return 80;
  };

  const getViewportPos = (target: HTMLElement | null) => {
    if (!target) return { x: 0, y: 0 };
    const targetBounds = target.getBoundingClientRect();

    if (target === circleRef.current) {
      const parentContainer = target.parentElement;
      if (parentContainer) {
        const parentBounds = parentContainer.getBoundingClientRect();
        return {
          x: parentBounds.left + parentBounds.width / 2,
          y: parentBounds.top + parentBounds.height / 2,
        };
      }
    }

    return {
      x: targetBounds.left + targetBounds.width / 2,
      y: targetBounds.top + targetBounds.height / 2,
    };
  };

  const constrainToViewport = (
    x: number,
    y: number,
    baseSize: number,
    currentScale: number
  ) => {
    const scaledSize = baseSize * currentScale;
    const halfScaledSize = scaledSize / 2;

    const navbarHeight = getNavbarHeight();
    const topSafeMargin = navbarHeight + 25;
    const sideSafeMargin = 25;
    const bottomSafeMargin = 25;

    const viewportWidth = window.visualViewport
      ? window.visualViewport.width
      : window.innerWidth;
    const viewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    const minX = halfScaledSize + sideSafeMargin;
    const maxX = viewportWidth - halfScaledSize - sideSafeMargin;
    const minY = halfScaledSize + topSafeMargin;
    const maxY = viewportHeight - halfScaledSize - bottomSafeMargin;

    let constrainedX = x;
    let constrainedY = y;

    if (x - halfScaledSize < sideSafeMargin) constrainedX = minX;
    else if (x + halfScaledSize > viewportWidth - sideSafeMargin)
      constrainedX = maxX;

    if (y - halfScaledSize < topSafeMargin) constrainedY = minY;
    else if (y + halfScaledSize > viewportHeight - bottomSafeMargin)
      constrainedY = maxY;

    return { x: constrainedX, y: constrainedY };
  };

  const initializePlaceholder = () => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    const isMobile = window.innerWidth < 640;
    const newSize = isMobile ? 120 : 150;
    setPlaceholderSize(newSize);

    const heroPos = getViewportPos(circleRef.current);
    const halfSize = newSize / 2;
    const translateX = Math.round(heroPos.x - halfSize);
    const translateY = Math.round(heroPos.y - halfSize);

    placeholder.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
    placeholder.style.opacity = '1';
    placeholder.style.visibility = 'visible';
  };

  const updateAnimation = () => {
    tickingRef.current = false;

    const placeholder = placeholderRef.current;
    const heroSection = heroSectionRef.current;
    const aboutSection = aboutSectionRef.current;
    const eventsSection = eventsSectionRef.current;

    if (!placeholder || !heroSection || !aboutSection || !eventsSection) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;

    const heroPos = getViewportPos(circleRef.current);
    const aboutPos = getViewportPos(aboutDestinationRef.current);
    const eventsPos = getViewportPos(eventsDestinationRef.current);

    const aboutBounds = aboutSection.getBoundingClientRect();
    const aboutTop = scrollY + aboutBounds.top;
    const aboutHeight = aboutBounds.height;

    const eventsBounds = eventsSection.getBoundingClientRect();
    const eventsTop = scrollY + eventsBounds.top;
    const eventsHeight = eventsBounds.height;

    const heroToAboutStart = aboutTop - viewportHeight * 0.7;
    const heroToAboutEnd = aboutTop + aboutHeight * 0.3;

    const aboutToEventsStart = eventsTop - viewportHeight * 0.7;
    const aboutToEventsEnd = eventsTop + eventsHeight * 0.3;

    const fadeOutStart = aboutToEventsEnd + viewportHeight * 0.1;
    const fadeOutEnd = fadeOutStart + viewportHeight * 0.2;

    let x = heroPos.x;
    let y = heroPos.y;
    let scale = 1.0;
    let opacity = 1.0;
    let visibility = 'visible';

    if (scrollY < heroToAboutStart) {
      x = heroPos.x;
      y = heroPos.y;
      scale = 1.0;
      opacity = 1.0;
    } else if (scrollY >= heroToAboutStart && scrollY < heroToAboutEnd) {
      const progress = Math.min(
        1,
        Math.max(0, (scrollY - heroToAboutStart) / (heroToAboutEnd - heroToAboutStart))
      );
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      x = heroPos.x + (aboutPos.x - heroPos.x) * easedProgress;
      y = heroPos.y + (aboutPos.y - heroPos.y) * easedProgress;
      scale = 1.0 + (2.5 - 1.0) * easedProgress;
      opacity = 1.0;
    } else if (scrollY >= heroToAboutEnd && scrollY < aboutToEventsStart) {
      x = aboutPos.x;
      y = aboutPos.y;
      scale = 2.5;
      opacity = 1.0;
    } else if (scrollY >= aboutToEventsStart && scrollY < aboutToEventsEnd) {
      const progress = Math.min(
        1,
        Math.max(
          0,
          (scrollY - aboutToEventsStart) / (aboutToEventsEnd - aboutToEventsStart)
        )
      );
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      x = aboutPos.x + (eventsPos.x - aboutPos.x) * easedProgress;
      y = aboutPos.y + (eventsPos.y - aboutPos.y) * easedProgress;
      scale = 2.5 + (1.5 - 2.5) * easedProgress;
      opacity = 1.0;
    } else if (scrollY >= aboutToEventsEnd && scrollY < fadeOutStart) {
      x = eventsPos.x;
      y = eventsPos.y;
      scale = 1.5;
      opacity = 1.0;
    } else if (scrollY >= fadeOutStart && scrollY < fadeOutEnd) {
      const progress = Math.min(
        1,
        Math.max(0, (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart))
      );
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      x = eventsPos.x;
      y = eventsPos.y;
      scale = 1.5;
      opacity = 1.0 - easedProgress;
    } else {
      x = eventsPos.x;
      y = eventsPos.y;
      scale = 1.5;
      opacity = 0;
      visibility = 'hidden';
    }

    const constrainedPos = constrainToViewport(x, y, placeholderSize, scale);

    const finalOpacity = isMobile ? opacity * 0.4 : opacity;

    const halfSize = placeholderSize / 2;
    const translateX = Math.round(constrainedPos.x - halfSize);
    const translateY = Math.round(constrainedPos.y - halfSize);

    placeholder.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    placeholder.style.opacity = finalOpacity.toString();
    placeholder.style.visibility = visibility;
    placeholder.style.zIndex = isMobile ? '10' : '50';
  };

  const onScroll = () => {
    if (!tickingRef.current) {
      requestAnimationFrame(updateAnimation);
      tickingRef.current = true;
    }
  };

  const handleResize = () => {
    initializePlaceholder();
    if (!tickingRef.current) {
      requestAnimationFrame(updateAnimation);
      tickingRef.current = true;
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.6 : 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    setTimeout(() => {
      initializePlaceholder();
      updateAnimation();
    }, 100);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      lenis.destroy();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={placeholderRef}
        className="fixed top-0 left-0 w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] z-50 pointer-events-none animated-logo"
      >
        <img
          src="https://blocks.mvp-subha.me/assets/robo.svg"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">Brand</div>
          <div className="hidden md:flex space-x-8">
            <a href="#hero" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="#events" className="text-gray-600 hover:text-gray-900 transition-colors">
              Events
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      <section
        id="hero"
        ref={heroSectionRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 pt-20"
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Experience Smooth Parallax
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
                Watch the logo gracefully transition between sections as you scroll down the page.
              </p>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div
                ref={circleRef}
                className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl"
              >
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl font-bold mb-2">Logo</div>
                    <div className="text-sm opacity-90">Animation Area</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        ref={aboutSectionRef}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div
              ref={aboutDestinationRef}
              className="w-full md:w-2/6 flex items-center justify-center"
            >
              <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl">
                <div className="text-white text-center">
                  <div className="text-3xl font-bold mb-2">About</div>
                  <div className="text-sm opacity-90">Logo grows here</div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                About Our Vision
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We create stunning visual experiences that captivate and engage. Our parallax scroll
                effect demonstrates the power of smooth animations and thoughtful design.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Notice how the logo smoothly transitions from the hero section and grows as it
                arrives here. This creates a sense of continuity and polish that elevates the user
                experience.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                The animation uses cubic easing functions for natural movement, viewport
                constraints to prevent clipping, and responsive behavior for mobile devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="events"
        ref={eventsSectionRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join us for amazing events and watch the logo complete its journey as it transitions
              here before fading away.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div
              ref={eventsDestinationRef}
              className="w-full flex items-center justify-center"
            >
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-xl">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-2">Events</div>
                  <div className="text-xs opacity-90">Final stop</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-4">Dec 15</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Design Workshop</h3>
              <p className="text-gray-600">
                Learn advanced animation techniques and create stunning visual effects for your
                projects.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-4">Jan 20</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Developer Conference</h3>
              <p className="text-gray-600">
                Connect with fellow developers and explore the latest web technologies and trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Get In Touch</h2>
          <p className="text-xl text-gray-300 mb-12">
            Ready to create something amazing together? Let's talk about your next project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              Start a Project
            </button>
            <button className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20">
              View Portfolio
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">2025 Parallax Experience. Smooth scrolling powered by Lenis.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
