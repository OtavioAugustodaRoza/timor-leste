import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import { history } from './data'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const scenes = [
  { image: 'dili.webp', alt: 'Costa de Díli vista do alto', caption: 'O território de um povo' },
  { image: 'history-resistance.webp', alt: 'Museu da Resistência Timorense, em Díli', caption: 'A memória da resistência' },
  { image: 'history-dili.jpg', alt: 'Orla da capital timorense, Díli', caption: 'Uma capital, um novo amanhecer' },
  { image: 'history-palace.webp', alt: 'Palácio do Governo, em Díli', caption: 'Uma voz que alcança a região' },
]

// Timeline units: entry → four reading chapters → exit.
const ENTRY = .4
const CHAPTER = 1
const EXIT = .4
const TOTAL = ENTRY + history.length * CHAPTER + EXIT
const MOTION = {
  desktop: { shift: 28, scale: 1.16, drift: 4 },
  mobile: { shift: 14, scale: 1.08, drift: 2 },
}

type Props = { ready: boolean, reduced: boolean, scrollTo: (position: number) => void }

export default function HistoryJourney({ ready, reduced, scrollTo }: Props) {
  const section = useRef<HTMLElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 800px)').matches)
  const [shortViewport, setShortViewport] = useState(() => matchMedia('(max-height: 659px)').matches)
  const enhanced = ready && !reduced && !shortViewport

  useEffect(() => {
    const query = matchMedia('(max-height: 659px)')
    const update = () => setShortViewport(query.matches)
    const widthQuery = matchMedia('(max-width: 800px)')
    const updateWidth = () => setMobile(widthQuery.matches)
    query.addEventListener('change', update)
    widthQuery.addEventListener('change', updateWidth)
    return () => {
      query.removeEventListener('change', update)
      widthQuery.removeEventListener('change', updateWidth)
    }
  }, [])

  useGSAP(() => {
    const container = section.current
    if (!container || !ready) return
    const panels = gsap.utils.toArray<HTMLElement>('.memory-scene', container)
    const updateActive = (index: number) => {
      if (activeRef.current !== index) { activeRef.current = index; setActive(index) }
    }
    const updateFromProgress = (progress: number) => {
      const chapter = Math.floor((progress * TOTAL - ENTRY) / CHAPTER)
      updateActive(Math.max(0, Math.min(history.length - 1, chapter)))
    }
    if (!enhanced) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) updateActive(Number((entry.target as HTMLElement).dataset.index)) })
      }, { rootMargin: '-20% 0px -45% 0px' })
      panels.forEach(panel => observer.observe(panel))
      return () => observer.disconnect()
    }

    gsap.set(panels.slice(1), { autoAlpha: 0 })
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'history-journey', trigger: container,
        start: () => `top ${document.querySelector('header')?.getBoundingClientRect().height ?? 72}`,
        end: () => {
          const stage = container.querySelector<HTMLElement>('.memory-stage')!
          return `bottom ${(document.querySelector('header')?.getBoundingClientRect().height ?? 72) + stage.offsetHeight}`
        },
        scrub: true, invalidateOnRefresh: true,
        onUpdate: self => updateFromProgress(self.progress),
        onRefresh: self => updateFromProgress(self.progress),
      },
    })
    trigger.current = timeline.scrollTrigger ?? null

    const motion = mobile ? MOTION.mobile : MOTION.desktop
    const sceneLayer = container.querySelector('.memory-scenes')
    // Entry is scrubbed too; no time-based playback or one-shot reveals.
    timeline.addLabel('entry', 0)
      .fromTo(sceneLayer, { y: motion.shift * .5, scale: .98, opacity: .35 },
        { y: 0, scale: 1, opacity: 1, duration: ENTRY }, 0)
      .addLabel('transformation', ENTRY)

    panels.forEach((panel, index) => {
      const at = ENTRY + index * CHAPTER
      const photo = panel.querySelector('img')
      const copy = panel.querySelectorAll('.memory-date, h3, .memory-description, .memory-source')
      timeline.addLabel(`chapter-${index}`, at)
      timeline.fromTo(photo, { scale: motion.scale, yPercent: motion.drift },
        { scale: 1.02, yPercent: -motion.drift, duration: CHAPTER }, at)
      if (index > 0) {
        timeline.to(panels[index - 1], { autoAlpha: 0, duration: .25 }, at - .2)
        timeline.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, at - .2)
        timeline.fromTo(copy, { y: motion.shift, opacity: 0 },
          { y: 0, opacity: 1, duration: .3, stagger: .035 }, at - .15)
        timeline.fromTo(panel.querySelector('.memory-year'), { yPercent: mobile ? 6 : 12, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: .35 }, at - .1)
      }
    })
    timeline.addLabel('exit', TOTAL - EXIT)
      .to(sceneLayer, { y: -motion.shift, scale: 1.015, opacity: .35, duration: EXIT }, 'exit')
      .to(container.querySelector('.memory-progress-fill'), { scaleX: 1, duration: TOTAL }, 0)
    const refresh = () => ScrollTrigger.refresh()
    container.querySelectorAll('img').forEach(img => img.addEventListener('load', refresh, { once: true }))
    const timer = window.setTimeout(refresh, 100)
    return () => {
      window.clearTimeout(timer)
      container.querySelectorAll('img').forEach(img => img.removeEventListener('load', refresh))
      trigger.current = null
    }
  }, { scope: section, dependencies: [ready, enhanced, mobile], revertOnUpdate: true })

  const goTo = (index: number) => {
    const currentTrigger = trigger.current
    if (enhanced && currentTrigger) {
      scrollTo(currentTrigger.start + ((ENTRY + index * CHAPTER + .35) / TOTAL) * (currentTrigger.end - currentTrigger.start))
    } else {
      const panel = document.getElementById(`memory-${history[index].year}`)
      if (panel) scrollTo(panel.getBoundingClientRect().top + window.scrollY - 90)
    }
  }

  return <section ref={section} className="history-journey" id="historia" aria-labelledby="memory-title" data-scroll={enhanced} data-active-year={history[active].year} data-lenis-prevent-wheel>
    <div className="memory-stage">
      <div className="memory-heading"><h2 id="memory-title">A liberdade tem<br/><i>memória.</i></h2><span className="memory-instruction"><ArrowDown size={16}/>{enhanced ? 'Role para avançar · imagens atuais' : 'Uma história para atravessar com calma'}</span></div>
      <div className="memory-scenes">
        {history.map((period, index) => <article id={`memory-${period.year}`} key={period.year} className="memory-scene" data-index={index} aria-labelledby={`memory-title-${index}`} aria-hidden={enhanced ? active !== index : undefined} inert={enhanced && active !== index}>
          <div className="memory-photo"><img src={`/images/${scenes[index].image}`} alt={scenes[index].alt} loading="lazy" width="1400" height="1000"/><div className="memory-photo-shade"/></div>
          <span className="memory-year" aria-hidden="true">{period.year}</span>
          <div className="memory-story"><span className="memory-date">{period.date} de {period.year}</span><h3 id={`memory-title-${index}`}>{period.title}</h3><p className="memory-description">{period.text}</p><a className="memory-source" href={index === 3 ? 'https://theaseanmagazine.asean.org/article/forging-a-new-era-timor-leste-admitted-into-asean/' : 'https://timorleste.tl/about#history'} target="_blank" rel="noopener noreferrer">Ler esse capítulo <ArrowUpRight size={15}/><span className="sr-only"> (abre em nova aba)</span></a></div>
          <span className="memory-photo-caption">{scenes[index].caption}<small>Fotografia contemporânea</small></span>
        </article>)}
      </div>
      <div className="memory-navigation"><div className="memory-navigation-top"><span aria-live="polite" aria-atomic="true">{history[active].label} <span aria-hidden="true">· {String(active + 1).padStart(2, '0')} / 04</span></span><a href="#economia">Pular história <ArrowRight size={13}/></a></div><nav aria-label="Marcos da história do Timor-Leste" className="memory-years">{history.map((period, index) => <button key={period.year} aria-label={`Ir para ${period.year}: ${period.label}`} aria-current={active === index ? 'step' : undefined} onClick={() => goTo(index)}>{period.year}<span/></button>)}</nav><div className="memory-progress"><div className="memory-progress-fill"/></div></div>
    </div>
  </section>
}
