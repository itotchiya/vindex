import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * =============================================================================
 * HEADER THEME LOGIC - VINDEX
 * =============================================================================
 *
 * Initializes the header theme switching logic based on scroll position and sections.
 * This script handles switching between 'light' and 'dark' themes for the header
 * as the user scrolls through different sections of the page.
 *
 * THEME RULES:
 * - Dark theme: Hero sections, Footer, and dark background sections
 * - Light theme: Content sections with white/light backgrounds
 *
 * PAGES HANDLED:
 * - Homepage (index.astro): Custom section-based triggers
 * - Contact page (contact.astro): Custom section-based triggers
 * - Sub-pages (domaines/*, actualites/*, cabinet, mentions-legales):
 *   Generic hero/content/footer pattern
 *
 * REQUIRED CLASSES FOR SUB-PAGES:
 * - .page-hero          → Dark theme (from PageHero component)
 * - .section-*          → Light theme (content sections)
 * - .footer-wrapper     → Dark theme (contains FinalCTA + Footer)
 *
 * =============================================================================
 */
export function initHeaderThemeLogic() {
  gsap.registerPlugin(ScrollTrigger);

  const header = document.querySelector("#main-header");
  const megaMenu = document.getElementById("mega-menu");

  if (!header) return;

  // Helper to set theme
  const setTheme = (theme) => {
    header.setAttribute("data-theme", theme);
    if (megaMenu) megaMenu.setAttribute("data-theme", theme);
  };

  // Calculate current theme based on scroll position
  // Returns "dark" if in hero area, "light" if in content area
  const calculateInitialTheme = () => {
    const hasHero = document.querySelector(".hero") || document.querySelector(".page-hero");
    const scrollPosition = window.scrollY;
    
    // Get the first content section position
    const contentSections = [
      ".cabinet-preview",
      ".section-contact", 
      ".section-presentation",
      ".section-domaines",
      ".section-articles",
      ".section-content",
      ".section-philosophy",
    ];
    
    let firstContentTop = Infinity;
    contentSections.forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        const rect = section.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        if (absoluteTop < firstContentTop) {
          firstContentTop = absoluteTop;
        }
      }
    });
    
    // If scroll position hasn't reached content section, stay dark
    // 100px is the header height offset for the trigger point
    if (hasHero && scrollPosition < firstContentTop - 100) {
      return "dark";
    }
    
    return "light";
  };

  // Theme switching ScrollTriggers - must be created after all content loads
  // and pinned animations are set up so positions are calculated correctly
  const initThemeTriggers = () => {
    // Kill any existing theme triggers to avoid duplicates
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.id?.startsWith("theme-")) {
        trigger.kill();
      }
    });

    ScrollTrigger.refresh();

    // Set initial theme based on actual scroll position AFTER refresh
    // This ensures correct theme even if ScrollTrigger.create fires onEnter
    const initialTheme = calculateInitialTheme();
    setTheme(initialTheme);

    // =========================================================================
    // HOMEPAGE TRIGGERS (index.astro)
    // =========================================================================

    // Switch to light theme when CabinetPreview enters (after Hero)
    ScrollTrigger.create({
      id: "theme-cabinet",
      trigger: ".cabinet-preview",
      start: "top 100px",
      refreshPriority: -1,
      onEnter: () => setTheme("light"),
      onLeaveBack: () => setTheme("dark"),
    });

    // Switch to dark theme when TargetAudience enters (dark background section)
    ScrollTrigger.create({
      id: "theme-audience",
      trigger: ".target-audience",
      start: "top 100px",
      refreshPriority: -1,
      onEnter: () => setTheme("dark"),
      onLeaveBack: () => setTheme("light"),
    });

    // Switch to light theme when FinalCTA enters (after TargetAudience)
    ScrollTrigger.create({
      id: "theme-cta",
      trigger: ".final-cta",
      start: "top 100px",
      end: "bottom 100px",
      refreshPriority: -1,
      onEnter: () => setTheme("light"),
      onLeaveBack: () => setTheme("dark"),
      onLeave: () => setTheme("dark"),
      onEnterBack: () => setTheme("light"),
    });

    // =========================================================================
    // CONTACT PAGE TRIGGERS (contact.astro)
    // =========================================================================

    // Contact Page: Switch to Light when Contact section enters
    ScrollTrigger.create({
      id: "theme-contact-section",
      trigger: ".section-contact",
      start: "top 100px",
      refreshPriority: -1,
      onEnter: () => setTheme("light"),
      onLeaveBack: () => setTheme("dark"),
    });

    // Contact Page: Keep Light for FAQ, Switch to Dark when entering Footer
    ScrollTrigger.create({
      id: "theme-faq-section",
      trigger: ".section-faq",
      start: "top 100px",
      end: "bottom 100px",
      refreshPriority: -1,
      onEnter: () => setTheme("light"),
      onLeave: () => setTheme("dark"),
      onEnterBack: () => setTheme("light"),
    });

    // =========================================================================
    // SUB-PAGES GENERIC TRIGGERS
    // (domaines/*, actualites/*, cabinet, mentions-legales)
    // =========================================================================
    // These pages follow the pattern:
    // - PageHero (dark) → Content sections (light) → Footer wrapper (dark)

    // Find all content sections that should trigger light theme
    // These are the first section after PageHero in each sub-page
    const subPageLightSections = [
      ".section-presentation",     // domaines single pages
      ".section-domaines",         // domaines/index.astro
      ".section-articles",         // actualites/index.astro
      ".section-content",          // actualites/[slug].astro, mentions-legales
      ".section-philosophy",       // cabinet.astro
    ];

    subPageLightSections.forEach((selector, index) => {
      const section = document.querySelector(selector);
      if (section) {
        ScrollTrigger.create({
          id: `theme-subpage-light-${index}`,
          trigger: selector,
          start: "top 100px",
          refreshPriority: -1,
          onEnter: () => setTheme("light"),
          onLeaveBack: () => setTheme("dark"),
        });
      }
    });

    // Footer wrapper: Switch back to dark theme when entering footer area
    // This applies to all sub-pages that have a .footer-wrapper
    const footerWrapper = document.querySelector(".footer-wrapper");
    if (footerWrapper) {
      // FinalCTA section: Switch to light theme (it has white background)
      const finalCTA = document.querySelector(".final-cta");
      if (finalCTA) {
        ScrollTrigger.create({
          id: "theme-subpage-cta",
          trigger: ".final-cta",
          start: "top 100px",
          end: "bottom 100px",
          refreshPriority: -1,
          onEnter: () => setTheme("light"),
          onLeaveBack: () => setTheme("light"), // Stay light when scrolling back to content
          onLeave: () => setTheme("dark"),      // Switch to dark when entering actual footer
          onEnterBack: () => setTheme("light"),
        });
      }
    }

    // Re-apply initial theme after a small delay to ensure it takes precedence
    // over any immediate onEnter callbacks from ScrollTrigger.create
    requestAnimationFrame(() => {
      const theme = calculateInitialTheme();
      setTheme(theme);
    });
  };

  // Wait for window load to ensure all content (including images) is ready
  if (document.readyState === "complete") {
    setTimeout(initThemeTriggers, 300);
  } else {
    window.addEventListener("load", () => {
      setTimeout(initThemeTriggers, 300);
    });
  }
}
