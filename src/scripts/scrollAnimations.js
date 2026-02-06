/**
 * ==============================================================================
 * SCROLL ANIMATIONS - VINDEX
 * ==============================================================================
 *
 * A reusable scroll animation module for hero sections and parallax effects.
 * Uses GSAP and ScrollTrigger for smooth, performant animations.
 *
 * ==============================================================================
 * INSTALLATION
 * ==============================================================================
 *
 * Import this script in your Astro component:
 *
 *   <script>
 *     import { initPageHeroAnimations, initMainHeroAnimations } from "../scripts/scrollAnimations.js";
 *     initPageHeroAnimations();
 *   </script>
 *
 * ==============================================================================
 * CSS STRUCTURE REQUIREMENTS
 * ==============================================================================
 *
 * For the parallax "slide over" effect to work, your page must follow this structure:
 *
 *   .hero-wrapper             → Parent container
 *     .hero / .page-hero      → Sticky hero section (position: sticky; top: 0; z-index: 0)
 *     .section-*              → Next section slides OVER the hero (z-index: 1+)
 *
 * Required CSS for hero sections:
 *
 *   .hero, .page-hero {
 *     position: sticky;
 *     top: 0;
 *     z-index: 0;
 *   }
 *
 *   .section-* (next section) {
 *     position: relative;
 *     z-index: 1;
 *     background-color: #ffffff; // or any solid color
 *   }
 *
 * ==============================================================================
 * AVAILABLE CLASSES & IDS
 * ==============================================================================
 *
 * HERO CONTAINER (parallax target):
 *   .hero-container          → The main content wrapper inside hero, animated with parallax
 *
 * HERO BACKGROUND (optional parallax):
 *   .hero-bg                 → Background image/element for optional background parallax
 *
 * HERO CONTENT (entrance animations):
 *   .hero-content            → Container for animated content items
 *   .hero-content > *        → All direct children get staggered entrance animation
 *
 * BREADCRUMBS (sub-page heroes):
 *   .breadcrumbs             → Breadcrumb navigation, animated separately
 *
 * LOGOS (main hero only):
 *   .client-logos            → Logo slider section, fades in after main content
 *
 * TAGLINE (main hero only):
 *   .tagline                 → Top tagline pill, part of staggered entrance
 *
 * ==============================================================================
 * FUNCTIONS
 * ==============================================================================
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Configuration options for hero animations
 * @typedef {Object} HeroAnimationConfig
 * @property {number} entranceDuration - Duration of entrance animations
 * @property {number} entranceStagger - Stagger delay between content elements
 * @property {number} entranceDelay - Initial delay before animations start
 * @property {string} entranceEase - GSAP easing function for entrance
 * @property {number} parallaxDistance - How far content moves during parallax (px)
 * @property {string} parallaxEnd - ScrollTrigger end position
 */

/**
 * Default configuration for page hero (sub-pages)
 * @type {HeroAnimationConfig}
 */
const PAGE_HERO_CONFIG = {
  entranceDuration: 1,
  entranceStagger: 0.15,
  entranceDelay: 0.2,
  entranceEase: "expo.out",
  parallaxDistance: -50,
  parallaxEnd: "bottom top",
};

/**
 * Default configuration for main hero (home page)
 * @type {HeroAnimationConfig}
 */
const MAIN_HERO_CONFIG = {
  entranceDuration: 1.2,
  entranceStagger: 0.2,
  entranceDelay: 0.2,
  entranceEase: "expo.out",
  parallaxDistance: -100,
  parallaxEnd: "640vh top",
};

/**
 * Initialize animations for sub-page hero sections (PageHero.astro)
 *
 * @param {Partial<HeroAnimationConfig>} customConfig - Optional custom configuration
 *
 * @example
 * // Basic usage
 * initPageHeroAnimations();
 *
 * @example
 * // With custom config
 * initPageHeroAnimations({
 *   parallaxDistance: -80,
 *   entranceDuration: 1.5
 * });
 */
export function initPageHeroAnimations(customConfig = {}) {
  const config = { ...PAGE_HERO_CONFIG, ...customConfig };

  // Entrance animations for hero content
  gsap.from(".hero-content > *", {
    y: 30,
    opacity: 0,
    duration: config.entranceDuration,
    stagger: config.entranceStagger,
    ease: config.entranceEase,
    delay: config.entranceDelay,
  });

  // Breadcrumbs entrance (slides down)
  gsap.from(".breadcrumbs", {
    y: -20,
    opacity: 0,
    duration: config.entranceDuration,
    ease: "power2.out",
    delay: 0.1,
  });

  // Parallax scroll effect
  initParallax(config);
}

/**
 * Initialize animations for main hero section (Hero.astro on home page)
 *
 * @param {Partial<HeroAnimationConfig>} customConfig - Optional custom configuration
 *
 * @example
 * // Basic usage
 * initMainHeroAnimations();
 */
export function initMainHeroAnimations(customConfig = {}) {
  const config = { ...MAIN_HERO_CONFIG, ...customConfig };

  // Entrance animations for hero content
  gsap.from(".hero-content > *", {
    y: 30,
    opacity: 0,
    duration: config.entranceDuration,
    stagger: config.entranceStagger,
    ease: config.entranceEase,
    delay: config.entranceDelay,
  });

  // Client logos fade in
  gsap.from(".client-logos", {
    opacity: 0,
    duration: 1.5,
    delay: 1,
    ease: "power2.out",
  });

  // Parallax scroll effect
  initParallax(config);
}

/**
 * Initialize parallax scroll effect for hero sections
 * The hero is sticky, so we animate internal elements to create the "slow scroll" feel.
 *
 * @param {HeroAnimationConfig} config - Animation configuration
 * @private
 */
function initParallax(config) {
  const heroContent = document.querySelector(".hero-container");
  const heroBg = document.querySelector(".hero-bg");

  if (heroContent && heroBg) {
    gsap.to(heroContent, {
      y: config.parallaxDistance,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: config.parallaxEnd,
        scrub: true,
      },
    });
  }
}

/**
 * Initialize generic section entrance animations
 * Use this for sections that need staggered entrance when scrolling into view
 *
 * @param {string} sectionSelector - CSS selector for the section
 * @param {Object} options - Animation options
 * @param {string} options.childSelector - Selector for children to animate (default: "> *")
 * @param {number} options.duration - Animation duration (default: 0.8)
 * @param {number} options.stagger - Stagger between elements (default: 0.1)
 * @param {string} options.ease - GSAP easing (default: "power3.out")
 * @param {string} options.start - ScrollTrigger start (default: "top 80%")
 *
 * @example
 * // Animate all children of .my-section when scrolling into view
 * initSectionEntrance(".my-section", {
 *   childSelector: ".card",
 *   stagger: 0.15
 * });
 */
export function initSectionEntrance(sectionSelector, options = {}) {
  const {
    childSelector = "> *",
    duration = 0.8,
    stagger = 0.1,
    ease = "power3.out",
    start = "top 80%",
  } = options;

  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const children = section.querySelectorAll(childSelector);
  if (children.length === 0) return;

  gsap.from(children, {
    y: 40,
    opacity: 0,
    duration,
    stagger,
    ease,
    scrollTrigger: {
      trigger: section,
      start,
      toggleActions: "play none none reverse",
    },
  });
}

/**
 * Cleanup function to kill all ScrollTriggers
 * Call this when navigating away or before re-initializing
 *
 * @example
 * // Before re-initializing animations
 * cleanupAnimations();
 * initPageHeroAnimations();
 */
export function cleanupAnimations() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/**
 * Refresh ScrollTrigger calculations
 * Call this after dynamic content changes that affect layout
 *
 * @example
 * // After loading dynamic content
 * refreshAnimations();
 */
export function refreshAnimations() {
  ScrollTrigger.refresh();
}
