import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const phases = [
  { name: 'Fios', description: 'Tudo começa com um fio. E uma história para contar.' },
  { name: 'Encontros', description: 'Os fios se encontram. A memória ganha novos caminhos.' },
  { name: 'Memória', description: 'Uma trama inteira, feita de histórias que se cruzam.' },
]
const warp = Array.from({ length: 29 }, (_, index) => 50 + index * 15)
const weft = Array.from({ length: 35 }, (_, index) => 44 + index * 12)
const diamonds = Array.from({ length: 20 }, (_, index) => ({ x: 110 + (index % 4) * 100, y: 100 + Math.floor(index / 4) * 78 }))

type Props = { ready: boolean, reduced: boolean, scrollTo: (position: number) => void }

export default function WeaveJourney({ ready, reduced, scrollTo }: Props) {
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const [short, setShort] = useState(() => matchMedia('(max-height: 659px)').matches)
  const [active, setActive] = useState(0)
  const previous = useRef(0)
  const enabled = ready && !reduced && !short

  useEffect(() => {
    const query = matchMedia('(max-height: 659px)')
    const update = () => setShort(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useGSAP(() => {
    if (!enabled || !root.current) return
    const paths = root.current.querySelectorAll<SVGPathElement>('.weave-warp path,.weave-weft path')
    paths.forEach(path => {
      const length = path.getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    })
    gsap.set('.weave-motif', { opacity: 0 })
    const updatePhase = (progress: number) => {
      const next = Math.min(2, Math.floor(progress * 3))
      if (previous.current !== next) { previous.current = next; setActive(next) }
    }
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      id: 'weave-journey', trigger: root.current,
      start: () => `top ${document.querySelector('header')?.offsetHeight ?? 72}`,
      end: () => `bottom ${(document.querySelector('header')?.offsetHeight ?? 72) + (root.current?.querySelector<HTMLElement>('.weave-stage')?.offsetHeight ?? 0)}`,
      scrub: true, invalidateOnRefresh: true,
      onUpdate: self => updatePhase(self.progress),
      onRefresh: self => updatePhase(self.progress),
    } })
    trigger.current = timeline.scrollTrigger ?? null
    timeline.to('.weave-warp path', { strokeDashoffset: 0, duration: .2, stagger: { amount: .15 } }, 0)
      .to('.weave-weft path', { strokeDashoffset: 0, duration: .2, stagger: { amount: .3 } }, .3)
      .to('.weave-motif', { opacity: 1, duration: .12, stagger: { amount: .15 } }, .73)
      .fromTo('.weave-frame', { rotationX: 7, rotationY: -5, scale: .91 }, { rotationX: -2, rotationY: 3, scale: 1, duration: 1 }, 0)
      .to('.weave-progress-fill', { scaleX: 1, duration: 1 }, 0)
    return () => { trigger.current = null }
  }, { scope: root, dependencies: [enabled], revertOnUpdate: true })

  const goTo = (index: number) => {
    if (!enabled || !trigger.current) return
    scrollTo(trigger.current.start + ((index + .55) / 3) * (trigger.current.end - trigger.current.start))
  }

  return <section ref={root} className="weave-journey" id="trama" data-scroll={enabled} data-phase={phases[active].name} data-lenis-prevent-wheel aria-labelledby="weave-title">
    <div className="weave-stage">
      <div className="weave-copy"><h2 id="weave-title">Fio a fio,<br/><i>a memória ganha forma.</i></h2><p>Um fio encontra outro. E, desse encontro, nasce uma trama de memórias.</p><span className="weave-instruction"><ArrowDown size={15}/>{enabled ? 'Role para tecer. Volte para desfazer.' : 'Histórias que se encontram.'}</span></div>
      <div className="weave-art"><svg className="weave-frame" viewBox="0 0 520 500" role="img" aria-label="Composição geométrica autoral de fios verticais e horizontais que formam um tecido com losangos" aria-describedby="weave-caption"><rect className="weave-base" x="20" y="12" width="480" height="476" rx="2"/><path className="weave-border" d="M35 28H485V472H35Z" fill="none"/><g className="weave-warp">{warp.map((x,index) => <path key={x} d={`M${x} 38V462`} fill="none" strokeWidth={index % 3 === 0 ? 3 : 1.2}/>)}</g><g className="weave-weft">{weft.map((y,index) => <path key={y} d={index % 2 === 0 ? `M44 ${y}H476` : `M476 ${y}H44`} fill="none" strokeWidth={index % 5 === 0 ? 6 : 3}/>)}</g><g className="weave-motifs">{diamonds.map(({x,y},index) => <g className="weave-motif" key={index}><path d={`M${x} ${y-26}l26 26-26 26-26-26Z`} fill="none" strokeWidth="4"/><path d={`M${x} ${y-9}l9 9-9 9-9-9Z`} stroke="none"/></g>)}</g><path className="weave-edge" d="M44 52H476M44 64H476M44 440H476M44 452H476" fill="none" strokeWidth="3"/></svg></div>
      <div className="weave-footer">{enabled ? <><div className="weave-phase-controls" role="group" aria-label="Etapas da trama">{phases.map((phase,index) => <button key={phase.name} onClick={() => goTo(index)} aria-current={active === index ? 'step' : undefined}>{phase.name}</button>)}</div><div className="weave-progress"><div className="weave-progress-fill"/></div><p className="weave-phase-copy" aria-live="polite">{phases[active].description}</p></> : <p className="weave-phase-copy">Uma trama inteira, feita de histórias que se cruzam.</p>}<p id="weave-caption" className="weave-caption">Composição visual autoral inspirada no tais, sem reproduzir uma técnica ou um motivo tradicional específico.</p></div>
    </div>
  </section>
}
