import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, ChartNoAxesCombined, Check, Globe2, Heart, History as HistoryIcon, Menu, Moon, MoveUpRight, Palette, Pause, Play, Plus, Sun, X } from 'lucide-react'
import { cultures, destinations, gdp, navigation, sources } from './data'
import HistoryJourney from './HistoryJourney'
import { useTheme } from './useTheme'
import { animateParallax } from './motion'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="m50 3 11.2 34.5H98L68.3 59l11.3 35L50 72.4 20.4 94l11.3-35L2 37.5h36.8Z" /></svg>
}

function Pattern({ className = '' }: { className?: string }) {
  return <div className={`tais-pattern ${className}`} aria-hidden="true"><svg width="100%" height="100%"><defs><pattern id={`weave-${className || 'default'}`} x="0" y="0" width="68" height="48" patternUnits="userSpaceOnUse"><path d="M0 24 17 7 34 24 51 7 68 24 51 41 34 24 17 41Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m12 24 5-5 5 5-5 5Zm34 0 5-5 5 5-5 5Z" fill="currentColor"/><path d="M0 1h68M0 47h68" stroke="currentColor" strokeWidth="2"/></pattern></defs><rect width="100%" height="100%" fill={`url(#weave-${className || 'default'})`} /></svg></div>
}

function ExternalLink({ href, children, className = '' }: { href: string, children: ReactNode, className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></a>
}

function Loader({ onComplete, reduced }: { onComplete: () => void, reduced: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const completed = useRef(false)
  useEffect(() => {
    let alive = true
    const failSafe = window.setTimeout(() => {
      if (alive) { completed.current = true; onComplete() }
    }, 4500)
    const meter = { value: 0 }
    const tween = gsap.to(meter, { value: 90, duration: 1.15, ease: 'power2.out', onUpdate: () => alive && setProgress(Math.round(meter.value)) })
    const hero = new Image()
    hero.src = '/images/coast.webp'
    const assets = Promise.allSettled([document.fonts.ready, hero.decode()])
    const deadline = new Promise<void>(resolve => window.setTimeout(resolve, 2500))
    let finish: gsap.core.Tween | undefined
    Promise.race([assets, deadline]).then(() => {
      if (!alive || completed.current) return
      tween.kill()
      finish = gsap.to(meter, { value: 100, duration: reduced ? 0 : .35, onUpdate: () => alive && setProgress(Math.round(meter.value)), onComplete: () => {
        if (!alive || completed.current) return
        completed.current = true
        gsap.to(container.current, { yPercent: -100, duration: reduced ? 0 : .85, ease: 'power4.inOut', onComplete })
      } })
    })
    return () => { alive = false; window.clearTimeout(failSafe); tween.kill(); finish?.kill(); gsap.killTweensOf(container.current) }
  }, [onComplete, reduced])
  return <div className="loader" ref={container} role="status" aria-label="Preparando a viagem pelo Timor-Leste">
    <div className="loader-top"><span>TIMOR-LESTE</span><span>Um atlas vivo</span></div>
    <div className="loader-center"><Star /><span className="loader-title">Cada fio,<br/><i>uma história.</i></span></div>
    <div className="loader-bottom"><div className="loader-label"><span>Preparando sua viagem</span><span aria-hidden="true">{String(progress).padStart(2, '0')}%</span></div><div className="loader-track"><div style={{ width: `${progress}%` }} /></div><button onClick={() => { completed.current = true; onComplete() }}>Pular abertura <ArrowRight size={14}/></button></div>
    <Pattern className="loader-weave" />
  </div>
}

function DestinationExplorer({ motionEnabled }: { motionEnabled: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const place = destinations[active]
  useGSAP(() => {
    if (!motionEnabled) return
    gsap.fromTo('.destination-image img', { yPercent: -5, scale: 1.13 }, { yPercent: 5, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '.destination-image', start: 'top bottom', end: 'bottom top', scrub: .55 } })
  }, { scope: container, dependencies: [active, motionEnabled], revertOnUpdate: true })
  return <div className="destination-explorer" ref={container}>
    <div className="destination-list" role="tablist" aria-label="Escolha um destino" aria-orientation="vertical">
      {destinations.map((destination, index) => <button key={destination.name} role="tab" id={`destination-tab-${index}`} aria-controls="destination-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} className={`destination-tab ${active === index ? 'active' : ''}`} onClick={() => setActive(index)} onKeyDown={event => tabKey(event, index, destinations.length, setActive, 'destination-tab', true)}>
        <span><span className="destination-name">{destination.name}</span><span className="destination-subtitle">{destination.subtitle}</span></span><ArrowUpRight size={24} />
      </button>)}
      <p className="destination-note"><Globe2 size={16} /> Sudeste Asiático, entre a Indonésia e a Austrália.</p>
    </div>
    <div id="destination-panel" role="tabpanel" aria-labelledby={`destination-tab-${active}`} tabIndex={0} className="destination-panel">
      <div className="destination-image" key={place.image}><img src={`/images/${place.image}`} alt={place.alt} loading="lazy" width="1100" height="800" /><span className="coordinates">{place.coordinates}</span><span className="image-count">{String(active + 1).padStart(2, '0')} / 04</span></div>
      <div className="destination-caption"><p>{place.description}</p><ExternalLink href={place.url} className="text-link">Explorar {place.name}</ExternalLink></div>
    </div>
  </div>
}

function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number, length: number, select: (index: number) => void, prefix: string, vertical = false) {
  const nextKey = vertical ? 'ArrowDown' : 'ArrowRight'
  const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft'
  if (![nextKey, prevKey, 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : (index + (event.key === nextKey ? 1 : -1) + length) % length
  select(next)
  document.getElementById(`${prefix}-${next}`)?.focus()
}

function CultureExplorer({ motionEnabled }: { motionEnabled: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const culture = cultures[active]
  useGSAP(() => {
    if (!motionEnabled) return
    gsap.fromTo('.culture-image img', { yPercent: -5, scale: 1.13 }, { yPercent: 5, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '.culture-image', start: 'top bottom', end: 'bottom top', scrub: .55 } })
  }, { scope: container, dependencies: [active, motionEnabled], revertOnUpdate: true })
  return <div ref={container}>
    <div className="culture-tabs" role="tablist" aria-label="Explore a cultura timorense">
      {cultures.map((item, index) => <button key={item.id} role="tab" id={`culture-tab-${index}`} aria-controls="culture-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => tabKey(event, index, cultures.length, setActive, 'culture-tab')}><span>{item.title}</span><Plus size={16}/></button>)}
    </div>
    <div className="culture-panel" id="culture-panel" role="tabpanel" aria-labelledby={`culture-tab-${active}`} tabIndex={0}>
      <div className="culture-image" key={culture.image}><img src={`/images/${culture.image}`} alt={culture.alt} loading="lazy" width="1000" height="900"/><span className="culture-photo-label">Saberes que atravessam gerações</span></div>
      <div className="culture-copy" key={culture.id}><div className="small-star"><Star/></div><h3>{culture.subtitle}</h3><p>{culture.text}</p><p className="culture-note">{culture.note}</p><ExternalLink href={culture.source} className="text-link">{culture.sourceLabel}</ExternalLink></div>
    </div>
  </div>
}

function EconomyChart() {
  const [active, setActive] = useState(4)
  const points = gdp.map((item, index) => ({ x: 45 + index * 108, y: 220 - (item.value - 1) * 60 }))
  const line = points.map(point => `${point.x},${point.y}`).join(' ')
  return <div className="economy-chart">
    <div className="chart-top"><span>PIB · {gdp[active].year}</span><strong>US$ {gdp[active].value.toFixed(2).replace('.', ',')} <small>bi</small></strong></div>
    <p className="chart-unit">PIB nominal em dólares correntes</p>
    <svg className="gdp-chart" viewBox="0 0 520 255" role="img" aria-label="PIB nominal: 3,63 bilhões de dólares em 2021; 3,21 em 2022; 2,08 em 2023; 1,87 em 2024; 1,90 em 2025.">
      <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b74632" stopOpacity=".16"/><stop offset="100%" stopColor="#b74632" stopOpacity="0"/></linearGradient></defs>
      {[1, 2, 3, 4].map(value => <g key={value}><line x1="40" x2="490" y1={220 - (value - 1) * 60} y2={220 - (value - 1) * 60} stroke="currentColor" opacity=".1"/><text x="7" y={225 - (value - 1) * 60} fontSize="11" fill="currentColor" opacity=".7">{value}</text></g>)}
      <polygon points={`45,220 ${line} 477,220`} fill="url(#chart-fill)"/>
      <polyline points={line} fill="none" stroke="#b74632" strokeWidth="2.5" strokeLinejoin="round"/>
      {points.map((point, index) => <g key={index}><circle cx={point.x} cy={point.y} r={active === index ? 8 : 4} fill={active === index ? '#b74632' : '#f5f1e8'} stroke="#b74632" strokeWidth="2"/><text x={point.x} y="249" textAnchor="middle" fill="currentColor" fontSize="11">{gdp[index].year}</text></g>)}
    </svg>
    <div className="chart-years" role="group" aria-label="Selecionar ano do PIB">{gdp.map((item, index) => <button key={item.year} aria-pressed={active === index} onClick={() => setActive(index)}>{item.year}</button>)}</div>
    <p className="chart-value sr-only" aria-live="polite">{gdp[active].year}: {gdp[active].value.toFixed(2).replace('.', ',')} bilhões de dólares.</p>
    <ExternalLink href="https://fred.stlouisfed.org/series/MKTGDPTLA646NWDB" className="chart-source">Banco Mundial, via FRED · série 2021–2025</ExternalLink>
    <p className="chart-caveat">Valores nominais incluem o setor petrolífero. A variação desta série não equivale à taxa de crescimento real.</p>
  </div>
}

function Solidarity() {
  return <section className="solidarity section" id="solidariedade" aria-labelledby="solidarity-title">
    <div className="solidarity-symbol" aria-hidden="true"><Star/><span>TIMOR-LESTE<br/>PELA DEMOCRACIA</span></div>
    <div className="solidarity-main"><div className="solidarity-heading"><h2 id="solidarity-title" className="reveal">A liberdade não termina<br/><i>nas nossas fronteiras.</i></h2><p className="solidarity-position reveal">Ao lado do Timor-Leste.<br/>Pela democracia em Myanmar.</p></div>
      <div className="solidarity-content"><div className="solidarity-editorial reveal"><span className="editorial-label"><Heart size={16}/> Nosso posicionamento</span><h3>Coragem para defender<br/>o que é justo.</h3><p>Apoiamos a defesa timorense da democracia e dos direitos humanos. Condenamos o golpe militar em Myanmar, a repressão contra civis e a intimidação diplomática praticada pela junta.</p><p>Essa posição caminha junto com a solidariedade ao povo de Myanmar, que também merece liberdade, segurança e o direito de escolher seu futuro.</p><div className="solidarity-principles"><span><Check size={14}/> Democracia</span><span><Check size={14}/> Direitos humanos</span><span><Check size={14}/> Solução pacífica</span></div></div>
        <div className="conflict-facts"><h3>Entenda as tensões diplomáticas</h3><p className="conflict-context">O conflito entre os governos tem caráter diplomático. Os episódios abaixo não representam uma guerra entre os dois países.</p><div className="conflict-event"><span>2021</span><p>O golpe militar em Myanmar desencadeia uma crise política e humanitária. Timor-Leste defende a restauração democrática. <a href="https://timor-leste.gov.tl/?lang=en&p=47361" target="_blank" rel="noopener noreferrer" aria-label="Fonte: Governo de Timor-Leste, contexto do golpe de 2021">[1]</a></p></div><div className="conflict-event"><span>2023</span><p>A junta expulsa o representante timorense após contatos de Díli com a oposição pró-democracia. <a href="https://apnews.com/article/de79d58bf30ed102720722084907ab52" target="_blank" rel="noopener noreferrer" aria-label="Fonte: Associated Press, expulsão de 2023">[2]</a></p></div><div className="conflict-event"><span>FEV 2026</span><p>Uma nova expulsão ocorre após uma denúncia contra militares ser acolhida em Timor-Leste. As acusações de crimes internacionais são objeto de apuração, não uma condenação judicial. <a href="https://apnews.com/article/de79d58bf30ed102720722084907ab52" target="_blank" rel="noopener noreferrer" aria-label="Fonte: Associated Press, expulsão de fevereiro de 2026">[2]</a></p></div><div className="conflict-event"><span>JUL 2026</span><p>Timor-Leste participa do diálogo da ASEAN sobre fim da violência, assistência humanitária e uma saída negociada. <a href="https://timor-leste.gov.tl/?lang=en&p=50588" target="_blank" rel="noopener noreferrer" aria-label="Fonte: Governo de Timor-Leste, reunião de julho de 2026">[3]</a></p></div><ExternalLink href="https://timor-leste.gov.tl/?lang=en&p=47361" className="text-link">Ler a posição oficial do Timor-Leste</ExternalLink></div></div>
    </div><Pattern className="solidarity-weave"/>
  </section>
}

const completeLoader = () => window.dispatchEvent(new Event('atlas-ready'))

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const menuButton = useRef<HTMLButtonElement>(null)
  const smoothScroll = useRef<Lenis | null>(null)
  const { theme, toggleTheme } = useTheme()
  const dockIcons = [Globe2, Palette, HistoryIcon, ChartNoAxesCombined, Heart]
  const scrollTo = (position: number) => {
    if (smoothScroll.current) smoothScroll.current.scrollTo(position, { duration: .8 })
    else window.scrollTo({ top: position, behavior: reduced ? 'instant' : 'smooth' })
  }

  useEffect(() => {
    const markReady = () => setReady(true)
    window.addEventListener('atlas-ready', markReady)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => { window.removeEventListener('atlas-ready', markReady); media.removeEventListener('change', onChange) }
  }, [])

  useEffect(() => {
    if (!ready || reduced || matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({ duration: .9, smoothWheel: true, anchors: { offset: -90 } })
    smoothScroll.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const update = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(update); lenis.destroy(); smoothScroll.current = null }
  }, [ready, reduced])

  useEffect(() => { if (menuOpen) smoothScroll.current?.stop(); else smoothScroll.current?.start() }, [menuOpen])

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])

  useEffect(() => {
    if (!ready || !window.location.hash) return
    const timer = window.setTimeout(() => {
      try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView() } catch { /* Ignore malformed fragments. */ }
    }, 100)
    return () => window.clearTimeout(timer)
  }, [ready])

  useEffect(() => {
    document.body.style.overflow = !ready || menuOpen ? 'hidden' : ''
    if (menuOpen) requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('.main-nav a')?.focus())
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() }
      if (event.key === 'Tab' && menuOpen) {
        const links = Array.from(document.querySelectorAll<HTMLElement>('.main-nav a, .menu-toggle'))
        const first = links[0], last = links[links.length - 1]
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      }
    }
    document.addEventListener('keydown', close)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', close) }
  }, [ready, menuOpen])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) }) }, { rootMargin: '-20% 0px -55% 0px' })
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useGSAP(() => {
    if (!ready) return
    gsap.to('.reading-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } })
    if (reduced) return
    gsap.from('.hero-line > span', { yPercent: 110, rotate: 2, duration: 1.15, stagger: .12, ease: 'power4.out' })
    gsap.from('.hero-description, .hero-actions, .hero-note', { y: 20, opacity: 0, duration: .8, stagger: .12, delay: .3, ease: 'power3.out' })
    gsap.from('.hero-visual', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power4.inOut' })
    gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => gsap.from(element, { y: 34, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }))
    if (root.current) animateParallax(root.current)
    gsap.from('.manifesto-word', { opacity: .3, stagger: .12, scrollTrigger: { trigger: '.manifesto', start: 'top 82%', end: 'bottom 42%', scrub: .6 } })
    gsap.from('.culture-tabs', { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.culture-tabs', start: 'top 90%', once: true } })
    const refresh = () => ScrollTrigger.refresh()
    document.fonts.ready.then(refresh)
  }, { scope: root, dependencies: [ready, reduced], revertOnUpdate: true })

  return <div ref={root} className={`atlas ${reduced ? 'motion-reduced' : ''}`}>
    {!ready && <Loader onComplete={completeLoader} reduced={reduced}/>}
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header" inert={!ready}><a className="brand" href="#inicio" aria-label="Timor-Leste, início"><span className="brand-icon"><Star/></span><span>TIMOR<span className="brand-dash">—</span>LESTE<small>um atlas vivo</small></span></a><nav id="main-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">{navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav><a className="header-explore" href="#territorio">Descobrir <ArrowUpRight size={16}/></a><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>{theme === 'dark' ? <Sun size={19}/> : <Moon size={19}/>}</button><button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button><div className="reading-progress"/></header>
    <main id="conteudo" inert={!ready || menuOpen}>
      <section className="hero" id="inicio" aria-labelledby="hero-title"><div className="hero-copy"><div className="hero-location"><span className="location-dot"/> Um encontro com o Timor-Leste <span className="hero-location-line"/></div><h1 id="hero-title"><span className="sr-only">Timor-Leste: </span><span className="hero-line"><span>A força de</span></span><span className="hero-line"><span>ser <i>livre.</i></span></span></h1><p className="hero-description">Entre montanhas e o mar, um povo tece<br className="desktop-break"/> sua história. Conheça a terra onde a coragem<br className="desktop-break"/> encontra um novo amanhecer.</p><div className="hero-actions"><a className="button button-red" href="#territorio">Começar a viagem <ArrowUpRight size={19}/></a><a className="hero-scroll" href="#cultura"><span>Sentir a cultura</span><ArrowDown size={17}/></a></div><div className="hero-note"><span className="tiny-flag" aria-label="Cores da bandeira do Timor-Leste"><Star/></span><span>Uma terra pequena.<br/><strong>Uma história que atravessa o mundo.</strong></span></div></div>
        <div className="hero-visual"><img className="hero-image parallax-photo" src="/images/coast.webp" alt="Águas turquesa, uma praia e um barco no litoral do Timor-Leste" width="1086" height="1448" fetchPriority="high"/><div className="hero-image-top"><span>O outro lado do mundo.<br/>Um novo jeito de olhar.</span><MoveUpRight size={25}/></div><div className="hero-photo-bottom"><span><span className="photo-dot"/> Timor-Leste, Sudeste Asiático</span><span>08° S · 125° E</span></div><div className="hero-seal"><Star/><span>TERRA DE<br/>RESISTÊNCIA<br/>& BELEZA</span></div></div>
        <div className="hero-bottom"><span>DESCUBRA COM CALMA. SINTA CADA HISTÓRIA.</span><a href="#territorio" aria-label="Rolar para conhecer o país"><ArrowDown size={19}/></a><span>TAIS, MAR, MEMÓRIA E FUTURO.</span></div>
      </section>
      <Pattern className="hero-weave"/>
      <section className="territory section" id="territorio" aria-labelledby="territory-title"><div className="section-heading"><h2 id="territory-title" className="reveal">Pequeno no mapa.<br/><i>Imenso na alma.</i></h2><div className="section-intro reveal"><p>Na metade oriental da ilha de Timor, em Ataúro, Jaco e no enclave de Oecusse, um país reúne muitas formas de viver, lembrar e pertencer.</p><span className="inline-note">Díli, a capital · Tétum e português, línguas oficiais</span></div></div><DestinationExplorer motionEnabled={ready && !reduced}/></section>
      <section className="manifesto section" aria-label="Identidade timorense"><span className="manifesto-mark" aria-hidden="true"><Star/></span><p>{'Um país não se mede apenas pelo seu território. Mas pelas histórias que guarda, pelos saberes que partilha e pela liberdade que escolhe defender.'.split(' ').map((word, index) => <span key={index} className="manifesto-word">{word} </span>)}</p><span className="manifesto-signature">Timor-Leste. Uma identidade em movimento.</span></section>
      <section className="culture section" id="cultura" aria-labelledby="culture-title"><div className="section-heading"><h2 id="culture-title" className="reveal">A memória vive<br/><i>em cada fio.</i></h2><div className="section-intro reveal"><p>Tecer, celebrar, cultivar. A cultura timorense não ficou no passado: ela se renova nos gestos de todos os dias.</p><span className="inline-note">Toque em uma tradição e descubra suas histórias.</span></div></div><CultureExplorer motionEnabled={ready && !reduced}/></section>
      <section className="landscape-break" aria-label="Paisagem das terras altas"><img className="parallax-photo" src="/images/mountains.webp" alt="Paisagem costeira montanhosa do Timor-Leste" loading="lazy" width="1600" height="900"/><div className="landscape-overlay"/><div className="landscape-title"><span>Há lugares que a gente visita.</span><p>Outros ficam <i>em nós.</i></p></div><span className="landscape-caption">Pelas paisagens do Timor-Leste</span></section>
      <HistoryJourney ready={ready} reduced={reduced} scrollTo={scrollTo}/>
      <section className="economy section" id="economia" aria-labelledby="economy-title"><div className="section-heading"><h2 id="economy-title" className="reveal">Cultivar o presente.<br/><i>Diversificar o futuro.</i></h2><div className="section-intro reveal"><p>Transformar a riqueza do petróleo em oportunidades duradouras é um dos grandes desafios do país. O futuro também passa pela terra, pelas pessoas e pelo conhecimento.</p></div></div><div className="economy-grid"><div className="economy-paths"><div className="economy-path reveal"><span className="path-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 35V17m0 8C8 27 7 16 7 13c10-1 13 4 13 8m0-2C18 8 28 5 34 6c0 9-4 15-14 13" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></span><div><h3>Uma economia com raízes</h3><p>Agricultura e café conectam renda, território e o trabalho de pequenos produtores.</p></div></div><div className="economy-path reveal"><span className="path-mark"><Globe2/></span><div><h3>Natureza que cria possibilidades</h3><p>Turismo comunitário e conservação podem ampliar oportunidades, com respeito aos ecossistemas.</p></div></div><div className="economy-path reveal"><span className="path-mark"><ArrowUpRight/></span><div><h3>Mais caminhos, menos dependência</h3><p>Diversificação, educação e um setor privado mais forte são prioridades para além das receitas petrolíferas.</p></div></div><ExternalLink href="https://www.imf.org/en/news/articles/2025/06/10/cf-timor-lestes-opportunity-to-turn-its-wealth-into-economic-development" className="text-link">Aprofundar a análise econômica</ExternalLink></div><EconomyChart/></div><div className="coffee-footnote"><img src="/images/coffee.webp" alt="Trabalho de colheita do café timorense" loading="lazy" width="200" height="180"/><p>O futuro também tem<br/><i>aroma de café.</i></p><ExternalLink href="https://timorleste.tl/experiences/coffee" className="text-link">Conheça quem cultiva</ExternalLink></div></section>
      <Solidarity/>
      <section className="closing section"><div className="closing-star"><Star/></div><p className="reveal">Conhecer é o primeiro passo.<br/><i>Continuar olhando é uma escolha.</i></p><a className="button button-dark" href="#fontes">Continue a descoberta <ArrowDown size={18}/></a></section>
      <section className="sources section" id="fontes" aria-labelledby="sources-title"><details><summary><span><h2 id="sources-title">Histórias com fontes.</h2><span>Referências, dados e créditos das imagens</span></span><Plus size={25}/></summary><div className="sources-content"><p>Atlas editorial independente, sem vínculo com o governo. Pesquisa revisada em 27 de outubro de 2026. O posicionamento em defesa da democracia está identificado como opinião editorial.</p><div className="sources-list">{sources.map(source => <ExternalLink key={source.name} href={source.url}><span><strong>{source.name}</strong><small>{source.description}</small></span></ExternalLink>)}</div><p className="image-credits">Fotografias: portal oficial de Turismo de Timor-Leste, Ministério do Turismo e Ambiente. Tipografia: Cormorant Garamond e DM Sans. Padrões geométricos originais inspirados no ritmo da tecelagem; não são reproduções de motivos tradicionais específicos.</p><p>O gráfico usa valores arredondados para bilhões de US$. Período de referência: 2021–2025. Dados históricos estão sujeitos a revisões pelas instituições responsáveis.</p></div></details></section>
    </main>
    <footer className="site-footer" inert={!ready || menuOpen}><div className="footer-top"><a className="footer-brand" href="#inicio">Timor<i>—</i>Leste<Star/></a><span>O mundo é maior<br/>quando a gente conhece.</span><a className="back-top" href="#inicio">Voltar ao início <ArrowUp size={18}/></a></div><div className="footer-bottom"><span>© 2026 · Um atlas vivo. Um olhar independente.</span><button className="motion-control" onClick={() => setReduced(!reduced)} aria-pressed={reduced}>{reduced ? <Play size={13}/> : <Pause size={13}/>} {reduced ? 'Ativar animações' : 'Reduzir animações'}</button><a href="#fontes">Feito para conhecer. E respeitar. <Heart size={12}/></a></div></footer>
    <nav className="mobile-dock" aria-label="Atalhos de navegação" inert={!ready || menuOpen}>{navigation.map((item, index) => {
      const Icon = dockIcons[index]
      return <a key={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? 'location' : undefined}><Icon size={19} strokeWidth={1.5}/><span>{index === 4 ? 'Uma voz' : item.label}</span></a>
    })}</nav>
    </div>
}
