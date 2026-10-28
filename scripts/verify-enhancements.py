"""Chromium checks for themes, mobile touch, scroll history and reading fallback."""
from pathlib import Path
import json
import os
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.verification' / 'python'))
from playwright.sync_api import sync_playwright

OUTPUT = ROOT / '.verification'
OUTPUT.mkdir(exist_ok=True)
BASE = os.environ.get('ATLAS_TEST_URL', 'http://127.0.0.1:5173')
CHROME = os.environ.get('CHROME_PATH') or shutil.which('google-chrome') or shutil.which('chromium') or r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def check_page(page):
    assert page.locator('h1').count() == 1
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    broken = page.locator('img').evaluate_all('(items) => items.filter(i => i.complete && !i.naturalWidth).map(i => i.src)')
    assert not broken, f'Broken images: {broken}'

def story_position(page, progress):
    page.evaluate('''(progress) => {
      const section = document.querySelector('#historia');
      const stage = section.querySelector('.memory-stage');
      const header = document.querySelector('header').offsetHeight;
      const start = section.getBoundingClientRect().top + scrollY - header;
      window.scrollTo({top: start + (section.offsetHeight - stage.offsetHeight) * progress, behavior: 'instant'});
    }''', progress)
    page.wait_for_timeout(900)

def swipe(page, x, start_y, end_y):
    client = page.context.new_cdp_session(page)
    client.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': start_y}]})
    for step in range(1, 13):
        client.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': start_y + (end_y - start_y) * step / 12}]})
        page.wait_for_timeout(18)
    client.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    client.detach()
    page.wait_for_timeout(800)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True, args=['--disable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    errors, report = [], []
    viewports = [('mobile',390,844,True), ('small-mobile',360,740,True), ('desktop',1440,1000,False), ('tablet',768,1024,True), ('compact',320,568,True)]
    for label, width, height, touch in viewports:
        context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1, is_mobile=touch, has_touch=touch, color_scheme='light')
        page = context.new_page()
        page.bring_to_front()
        page.on('pageerror', lambda error: errors.append(str(error)))
        assert page.goto(BASE, wait_until='networkidle').status == 200
        page.locator('.loader').wait_for(state='detached', timeout=10000)
        page.wait_for_timeout(1300)
        check_page(page)
        page.screenshot(path=str(OUTPUT / f'v2-{label}-light.png'))
        if width <= 600:
            assert page.locator('.hero-visual').bounding_box()['y'] < height * .85, 'Hero image too low'
            assert page.locator('.mobile-dock').is_visible()
            assert page.locator('.menu-toggle').count() == 0
            for selector in ['.theme-toggle']:
                assert page.locator(selector).bounding_box()['width'] >= 44
        page.get_by_role('button', name='Ativar modo escuro', exact=True).click()
        assert page.locator('html').get_attribute('data-theme') == 'dark'
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUTPUT / f'v2-{label}-dark.png'))
        page.reload(wait_until='networkidle')
        page.locator('.loader').wait_for(state='detached', timeout=10000)
        assert page.locator('html').get_attribute('data-theme') == 'dark', 'Theme did not persist'
        page.wait_for_timeout(1100)
        if width <= 800:
            page.locator('.mobile-dock').get_by_role('link', name='Cultura', exact=True).click()
        else:
            page.locator('.main-nav').get_by_role('link', name='Cultura', exact=True).click()
        page.wait_for_timeout(1400)
        page.get_by_role('tab', name='Uma lulik', exact=True).click()
        assert page.get_by_role('tabpanel', name='Uma lulik').get_by_role('heading').is_visible()
        page.get_by_role('tab', name='Uma lulik', exact=True).press('End')
        assert page.get_by_role('tab', name='Cultura do café', exact=True).get_attribute('aria-selected') == 'true'
        assert page.locator('.culture-copy>p').first.evaluate('(e) => parseFloat(getComputedStyle(e).fontSize)') >= (15 if touch else 11)
        page.get_by_role('tab', name='Cultura do café', exact=True).press('Home')
        page.screenshot(path=str(OUTPUT / f'v2-{label}-culture.png'))
        if height >= 660:
            assert page.locator('#historia').get_attribute('data-scroll') == 'true'
            for year, progress in [('1975',.075),('1999',.325),('2002',.575),('2025',.85),('1999',.325)]:
                story_position(page, progress)
                actual = page.locator('#historia').get_attribute('data-active-year')
                assert actual == year, f'{label}: expected {year}, got {actual}'
                stage = page.locator('.memory-stage').bounding_box()
                header_height = page.locator('header').bounding_box()['height']
                assert abs(stage['y'] - header_height) < 3, f'Stage did not stick: {stage}'
                panel = page.locator(f'#memory-{year}')
                assert panel.get_attribute('aria-hidden') == 'false'
                story = panel.locator('.memory-story').bounding_box()
                nav = page.locator('.memory-navigation').bounding_box()
                heading = page.locator('.memory-heading').bounding_box()
                assert story['y'] + story['height'] < nav['y'] + 5, f'Navigation overlap on {label}'
                assert story['y'] >= heading['y'] + heading['height'] - 8, f'Heading overlap on {label}'
                if year in ('1999','2025'):
                    page.screenshot(path=str(OUTPUT / f'v2-{label}-memory-{year}.png'))
            page.get_by_role('button', name='Ir para 2002: Restauração', exact=True).click()
            page.wait_for_timeout(1500)
            assert page.locator('#historia').get_attribute('data-active-year') == '2002'
            if label == 'mobile':
                before = page.evaluate('scrollY')
                swipe(page, width/2, height*.68, height*.28)
                assert page.evaluate('scrollY') > before + 80, 'Touch scroll blocked'
            page.locator('.memory-navigation').get_by_role('link', name='Pular história', exact=True).click()
            page.wait_for_timeout(1600)
            assert page.locator('#economia').bounding_box()['y'] < height
        else:
            assert page.locator('#historia').get_attribute('data-scroll') == 'false'
            assert page.locator('.memory-scene').count() == 4
            assert page.locator('.memory-scene[aria-hidden="true"]').count() == 0
        page.locator('#economia').scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        page.get_by_role('button', name='2021', exact=True).click()
        assert '3,63' in page.locator('.chart-top').inner_text()
        page.get_by_role('button', name='2025', exact=True).click()
        page.locator('#solidariedade').scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path=str(OUTPUT / f'v2-{label}-solidarity.png'))
        page.locator('#fontes summary').click()
        assert page.locator('.sources-list a').count() >= 8
        assert page.locator('.motion-control').count() == 0
        check_page(page)
        report.append({'viewport':label,'size':[width,height],'themes':'passed','history':'scroll and controls passed' if height >= 660 else 'reading fallback passed','input':'emulated touch' if touch else 'mouse and keyboard'})
        print(f'{label}: passed', flush=True)
        context.close()
    context = browser.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, reduced_motion='reduce', color_scheme='dark')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/#historia', wait_until='networkidle')
    page.locator('.loader').wait_for(state='detached', timeout=10000)
    assert page.locator('html').get_attribute('data-theme') == 'dark'
    assert page.locator('#historia').get_attribute('data-scroll') == 'false'
    assert page.locator('.memory-scene[aria-hidden="true"]').count() == 0
    page.get_by_role('button', name='Ativar modo claro', exact=True).click()
    assert page.locator('html').get_attribute('data-theme') == 'light'
    check_page(page)
    report.append({'viewport':'mobile-reduced-motion','checks':'system theme and reading mode passed'})
    browser.close()
    result = {'results':report,'javascript_errors':errors,'engine':'Chromium; mobile devices and touch emulated; physical devices and Safari not tested'}
    (OUTPUT / 'report-v2.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    assert not errors, f'Browser errors: {errors}'
    print(json.dumps(result,indent=2))
