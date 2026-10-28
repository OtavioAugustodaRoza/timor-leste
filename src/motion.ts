import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Separate depth planes; all transforms stay within an overscanned image. */
export function animateParallax(root: HTMLElement) {
  const mobile = matchMedia('(max-width: 800px)').matches
  const hero = gsap.timeline({ scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true } })
  hero.to('.hero-image', { yPercent: mobile ? 9 : 13, scale: 1.12, ease: 'none' }, 0)
    .to('.hero-seal', { y: mobile ? -35 : -75, rotation: -12, ease: 'none' }, 0)
    .to('.hero-image-top', { y: -26, ease: 'none' }, 0)
    .to('.hero-photo-bottom', { y: -14, ease: 'none' }, 0)
  if (!mobile) hero.to('.hero-copy', { y: -55, ease: 'none' }, 0)

  const landscape = gsap.timeline({ scrollTrigger: { trigger: '.landscape-break', start: 'top bottom', end: 'bottom top', scrub: true } })
  landscape.fromTo('.landscape-break img', { yPercent: -10, scale: 1.18 }, { yPercent: 10, scale: 1.02, ease: 'none' }, 0)
    .fromTo('.landscape-title', { y: mobile ? 48 : 80 }, { y: mobile ? -48 : -80, ease: 'none' }, 0)
    .fromTo('.landscape-caption', { y: 12 }, { y: -18, ease: 'none' }, 0)
  gsap.fromTo('.landscape-break', { clipPath: mobile ? 'inset(0 0% 0 0%)' : 'inset(0 4% 0 4%)' }, { clipPath: 'inset(0 0% 0 0%)', ease: 'none', scrollTrigger: { trigger: '.landscape-break', start: 'top 90%', end: 'top 20%', scrub: true } })
  gsap.fromTo('.hero-weave svg', { x: -34 }, { x: 34, ease: 'none', scrollTrigger: { trigger: '.hero-weave', start: 'top bottom', end: 'bottom top', scrub: true } })
}
