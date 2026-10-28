import { useEffect, useRef, useState } from 'react'

/** Reading progress follows the actual document position, including layout changes. */
export default function ReadingProgress({ ready }: { ready: boolean }) {
  const bar = useRef<HTMLDivElement>(null)
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (!ready) return
    let frame = 0
    let mounted = true
    const update = () => {
      frame = 0
      if (!mounted) return
      const distance = document.documentElement.scrollHeight - window.innerHeight
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`
      setPercentage(previous => previous === Math.round(progress * 100) ? previous : Math.round(progress * 100))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    document.fonts.ready.then(schedule)
    update()
    return () => {
      mounted = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ready])

  return <>
    <span className="reading-percentage" aria-hidden="true">{percentage}% percorrido</span>
    <div ref={bar} className="reading-progress" role="progressbar" aria-label="Progresso de leitura do atlas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={`${percentage}% do atlas percorrido`}/>
  </>
}
