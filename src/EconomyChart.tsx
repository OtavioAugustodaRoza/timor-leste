import { useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { ArrowDownRight, ArrowUpRight, MoveHorizontal } from 'lucide-react'
import { gdp } from './data'
import './economy-chart.css'

type Metric = 'gdp' | 'change'
const number = (value: number, digits = 2) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const changes = gdp.map((item, index) => index ? (item.value / gdp[index - 1].value - 1) * 100 : null)
const xAt = (index: number) => 50 + index * 105

export default function EconomyChart() {
  const [active, setActive] = useState(gdp.length - 1)
  const [metric, setMetric] = useState<Metric>('gdp')
  const isGdp = metric === 'gdp'
  const minimum = isGdp ? 0 : 1
  const year = gdp[active].year
  const change = changes[active]
  const valueLabel = (index: number) => isGdp ? `US$ ${number(gdp[index].value)} bi` : `${(changes[index] ?? 0) > 0 ? '+' : ''}${number(changes[index] ?? 0, 1)}%`
  const ticks = isGdp ? [0, 1, 2, 3, 4] : [-40, -20, 0, 10]
  const yAt = (value: number) => isGdp ? 220 - value * 43 : 220 - (value + 40) * 3.44
  const points = gdp.map((item, index) => ({ x: xAt(index), y: yAt(isGdp ? item.value : changes[index] ?? 0) })).slice(minimum)
  const line = points.map(point => `${point.x},${point.y}`).join(' ')
  const selected = points[active - minimum]
  const tooltipX = Math.max(88, Math.min(432, selected.x))

  const selectMetric = (next: Metric) => {
    setMetric(next)
    if (next === 'change' && active === 0) setActive(1)
  }
  const selectAtPointer = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = event.currentTarget.getScreenCTM()
    if (!matrix) return
    const position = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    setActive(Math.max(minimum, Math.min(gdp.length - 1, Math.round((position.x - 50) / 105))))
  }
  const selectWithKeys = (event: KeyboardEvent<SVGSVGElement | HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? minimum : event.key === 'End' ? gdp.length - 1 : Math.max(minimum, Math.min(gdp.length - 1, active + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1)))
    setActive(next)
    if (event.currentTarget instanceof HTMLButtonElement) document.getElementById(`chart-year-${gdp[next].year}`)?.focus()
  }

  return <div className="economy-chart">
    <div className="chart-heading"><span>A economia em perspectiva</span><span>2021—2025</span></div>
    <div className="chart-metrics" role="group" aria-label="Indicador econômico">
      <button type="button" aria-pressed={isGdp} onClick={() => selectMetric('gdp')}>PIB nominal</button>
      <button type="button" aria-pressed={!isGdp} onClick={() => selectMetric('change')}>Variação anual</button>
    </div>
    <div className="chart-top"><span>{isGdp ? 'PIB' : 'VARIAÇÃO NOMINAL'} · {year}</span><strong>{isGdp ? <>US$ {number(gdp[active].value)} <small>bi</small></> : <>{change !== null && change > 0 ? '+' : ''}{number(change ?? 0, 1)}<small>%</small></>}</strong></div>
    <p className="chart-unit">{isGdp ? 'PIB nominal em dólares correntes' : 'Variação do PIB nominal em relação ao ano anterior'}</p>
    <div className="chart-comparison" aria-live="polite" aria-atomic="true">
      {change !== null ? <><span className={`chart-delta ${change >= 0 ? 'is-positive' : 'is-negative'}`}>{change >= 0 ? <ArrowUpRight size={15}/> : <ArrowDownRight size={15}/>}{change > 0 ? '+' : ''}{number(change, 1)}%</span><span>{year} em relação a {gdp[active - 1].year}</span></> : <span>2021 · primeiro ano da série, sem comparação anterior.</span>}
    </div>
    <svg className="gdp-chart" viewBox="0 0 520 260" tabIndex={0} role="slider" aria-label={isGdp ? 'Explorar PIB nominal por ano' : 'Explorar variação nominal por ano'} aria-valuemin={gdp[minimum].year} aria-valuemax={gdp[gdp.length - 1].year} aria-valuenow={year} aria-valuetext={`${year}: ${valueLabel(active)}`} onKeyDown={selectWithKeys} onPointerDown={event => { selectAtPointer(event); event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={event => { if (event.pointerType !== 'touch' || event.buttons) selectAtPointer(event) }}>
      <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".2"/><stop offset="100%" stopColor="currentColor" stopOpacity=".02"/></linearGradient></defs>
      <g aria-hidden="true">
        {ticks.map(value => <g key={value}><line className={value === 0 ? 'chart-grid chart-zero' : 'chart-grid'} x1="50" x2="470" y1={yAt(value)} y2={yAt(value)}/><text className="chart-axis" x="37" y={yAt(value) + 4} textAnchor="end">{value}{isGdp ? '' : '%'}</text></g>)}
        <polygon points={`${points[0].x},${isGdp ? 220 : yAt(0)} ${line} 470,${isGdp ? 220 : yAt(0)}`} fill="url(#chart-fill)"/>
        <polyline className="chart-line" points={line} fill="none" strokeWidth="2.5" strokeLinejoin="round"/>
        <line className="chart-crosshair" x1={selected.x} x2={selected.x} y1="40" y2="220"/>
        {points.map((point, index) => <circle className={`chart-point ${active === index + minimum ? 'is-active' : ''}`} key={index + minimum} cx={point.x} cy={point.y} r={active === index + minimum ? 7 : 4} strokeWidth="2"/>)}
        <g className="chart-tooltip" transform={`translate(${tooltipX}, 1)`}><rect x="-84" y="0" width="168" height="29" rx="4"/><text textAnchor="middle" y="19">{year} · {valueLabel(active)}</text></g>
        {gdp.map((item, index) => <text className={`chart-axis ${active === index ? 'is-active' : ''}`} key={item.year} x={xAt(index)} y="247" textAnchor="middle">{item.year}</text>)}
      </g>
    </svg>
    <p className="chart-hint"><MoveHorizontal size={15} aria-hidden="true"/>Deslize no gráfico ou selecione um ano.<span className="sr-only"> Com o gráfico em foco, use as setas para mudar o ano, Home para o primeiro e End para o último.</span></p>
    <div className="chart-years" role="group" aria-label="Selecionar ano do PIB">{gdp.map((item, index) => <button type="button" id={`chart-year-${item.year}`} key={item.year} aria-pressed={active === index} disabled={index < minimum} onClick={() => setActive(index)} onKeyDown={selectWithKeys}>{item.year}</button>)}</div>
    <p className="chart-value sr-only" aria-live="polite" aria-atomic="true">{year}: {valueLabel(active)}.</p>
    <a href="https://fred.stlouisfed.org/series/MKTGDPTLA646NWDB" className="chart-source" target="_blank" rel="noopener noreferrer">Banco Mundial, via FRED · série 2021–2025<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> (abre em nova aba)</span></a>
    <p className="chart-caveat">Valores nominais incluem o setor petrolífero. A variação é calculada sobre os valores da série e não equivale à taxa de crescimento real.</p>
  </div>
}
