"""Focused checks for direct scrubbing, parallax, sticky controls and reading progress."""
from pathlib import Path
import json, os, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.verification' / 'python'))
from playwright.sync_api import sync_playwright
OUTPUT = ROOT / '.verification'

def scroll_to(page, top):
    page.evaluate('(top) => scrollTo({top,behavior:"instant"})', top)
    page.wait_for_timeout(120)

def position(page, selector, stage, progress):
    top = page.evaluate('''({selector,stage,progress}) => {
      const s=document.querySelector(selector),p=s.querySelector(stage);
      return s.getBoundingClientRect().top+scrollY-document.querySelector('header').offsetHeight+(s.offsetHeight-p.offsetHeight)*progress;
    }''', {'selector':selector,'stage':stage,'progress':progress})
    scroll_to(page, top)

def reading(page):
    expected = page.evaluate('Math.round(Math.min(1,Math.max(0,scrollY/(document.documentElement.scrollHeight-innerHeight)))*100)')
    actual = int(page.get_by_role('progressbar',name='Progresso de leitura do atlas').get_attribute('aria-valuenow'))
    assert abs(actual-expected)<=1, f'Reading progress: {actual} vs {expected}'
    return actual

def overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Horizontal overflow'

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or shutil.which('google-chrome') or shutil.which('chromium') or r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True,args=['--disable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    reports,errors=[],[]
    for name,width,height,touch,reduced in [('mobile',390,844,True,False),('desktop',1440,900,False,False),('compact',320,568,True,False),('reduced',390,844,True,True)]:
        context=browser.new_context(viewport={'width':width,'height':height},is_mobile=touch,has_touch=touch,color_scheme='dark' if name in ('mobile','reduced') else 'light',reduced_motion='reduce' if reduced else 'no-preference')
        page=context.new_page()
        page.bring_to_front()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:5173',wait_until='networkidle')
        page.locator('.loader').wait_for(state='detached',timeout=10000)
        page.wait_for_timeout(1400)
        overflow(page)
        assert reading(page)==0
        if not reduced:
            culture_top=page.locator('.culture-tabs').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-document.querySelector("header").offsetHeight+100')
            scroll_to(page,culture_top)
            assert abs(page.locator('.culture-tabs').bounding_box()['y']-page.locator('header').bounding_box()['height'])<3
        if not reduced and height>=660:
            values=[]
            for phase,fraction in [('Fios',.13),('Encontros',.51),('Memória',.92),('Fios',.13)]:
                position(page,'#trama','.weave-stage',fraction)
                actual_phase=page.locator('#trama').get_attribute('data-phase')
                if actual_phase!=phase:
                    page.screenshot(path=str(OUTPUT/f'v3-{name}-phase-failure.png'))
                assert actual_phase==phase, f'{name}: scroll {fraction}, expected {phase}, got {actual_phase}; scrollY={page.evaluate("scrollY")}'
                bounds=page.locator('.weave-stage').bounding_box()
                assert abs(bounds['y']-page.locator('header').bounding_box()['height'])<3
                assert page.locator('.weave-art').bounding_box()['height']>110
                value=page.locator('.weave-weft path').last.evaluate('(e)=>parseFloat(getComputedStyle(e).strokeDashoffset)')
                page.wait_for_timeout(250)
                later=page.locator('.weave-weft path').last.evaluate('(e)=>parseFloat(getComputedStyle(e).strokeDashoffset)')
                assert abs(value-later)<.1, 'Animation continued after scrolling stopped'
                values.append(value)
                reading(page)
                if phase=='Memória': page.screenshot(path=str(OUTPUT/f'v3-{name}-weave.png'))
            assert abs(values[0]-values[-1])<.1, 'Scrubbing was not reversible'
            page.get_by_role('button',name='Encontros',exact=True).click()
            page.wait_for_timeout(1400)
            assert page.locator('#trama').get_attribute('data-phase')=='Encontros'
            if name=='desktop':
                before=page.evaluate('scrollY')
                art=page.locator('.weave-art').bounding_box()
                page.mouse.move(art['x']+art['width']/2,art['y']+art['height']/2)
                page.mouse.wheel(0,180)
                page.wait_for_timeout(180)
                assert page.evaluate('scrollY')>before+100, 'Native wheel scroll was blocked'
            position(page,'#historia','.memory-stage',.325)
            assert page.locator('#historia').get_attribute('data-active-year')=='1999'
            position(page,'#historia','.memory-stage',.075)
            assert page.locator('#historia').get_attribute('data-active-year')=='1975'
        else:
            assert page.locator('#trama').get_attribute('data-scroll')=='false'
            assert page.locator('.weave-motif').first.evaluate('(e)=>getComputedStyle(e).opacity')=='1'
            page.locator('#trama').scroll_into_view_if_needed()
            page.screenshot(path=str(OUTPUT/f'v3-{name}-weave.png'))
        page.locator('#fontes summary').scroll_into_view_if_needed()
        page.locator('#fontes summary').click()
        page.wait_for_timeout(300)
        scroll_to(page,999999)
        page.wait_for_timeout(300)
        assert reading(page)==100
        overflow(page)
        if name=='mobile':
            assert page.locator('.motion-control').count()==0
            reading(page)
        reports.append({'viewport':name,'size':[width,height],'progress':'passed','scroll':'direct and reversible' if not reduced and height>=660 else 'reading fallback passed'})
        print(name+': passed',flush=True)
        context.close()
    browser.close()
    result={'results':reports,'javascript_errors':errors,'engine':'Chromium; mobile viewport and touch emulated'}
    (OUTPUT/'report-scroll.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    assert not errors,errors
    print(json.dumps(result,indent=2))
