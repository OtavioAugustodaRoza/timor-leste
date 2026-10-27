"""Run against a local Vite server. Uses an existing Chrome installation."""
from pathlib import Path
import json
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.verification' / 'python'))
from playwright.sync_api import sync_playwright

OUTPUT = ROOT / '.verification'
OUTPUT.mkdir(exist_ok=True)
BASE = os.environ.get('ATLAS_TEST_URL', 'http://127.0.0.1:5173')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def check_page(page):
    assert page.locator('h1').count() == 1
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    broken = page.locator('img').evaluate_all('(images) => images.filter(i => i.complete && !i.naturalWidth).map(i => i.src)')
    assert not broken, f'Broken images: {broken}'

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True)
    errors = []
    report = []
    for label, width, height in [('desktop', 1440, 1000), ('mobile', 390, 844), ('tablet', 768, 1024)]:
        page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(BASE, wait_until='networkidle')
        assert response.status == 200
        page.locator('.loader').wait_for(state='detached', timeout=10000)
        page.wait_for_timeout(1600)
        page.screenshot(path=str(OUTPUT / f'{label}-hero.png'))
        check_page(page)
        if width < 801:
            page.get_by_role('button', name='Abrir menu').click()
            page.locator('.main-nav').get_by_role('link', name='Cultura', exact=True).click()
            assert page.get_by_role('button', name='Abrir menu').get_attribute('aria-expanded') == 'false'
            page.wait_for_timeout(1500)
        else:
            page.locator('.main-nav').get_by_role('link', name='Cultura', exact=True).click()
            page.wait_for_timeout(1500)
        page.get_by_role('tab', name='Uma lulik', exact=True).click()
        assert page.get_by_role('tabpanel', name='Uma lulik').get_by_role('heading', name='Uma casa para a memória.').is_visible()
        page.get_by_role('tab', name='Cultura do café', exact=True).click()
        assert page.get_by_role('tabpanel', name='Cultura do café').get_by_role('heading', name='Da montanha para o mundo.').is_visible()
        page.get_by_role('tab', name='Cultura do café', exact=True).press('Home')
        assert page.get_by_role('tab', name='Tais', exact=True).get_attribute('aria-selected') == 'true'
        page.locator('#territorio').scroll_into_view_if_needed()
        page.get_by_role('tab', name='Ataúro', exact=False).click()
        assert page.locator('.destination-image img').get_attribute('src') == '/images/atauro.webp'
        page.get_by_role('tab', name='Ataúro', exact=False).press('End')
        assert page.locator('.destination-image img').get_attribute('src') == '/images/jaco.webp'
        page.locator('#historia').scroll_into_view_if_needed()
        page.get_by_role('tab', name='1999', exact=False).click()
        assert page.locator('.history-copy h3').inner_text() == 'Um povo escolhe seu caminho.'
        page.locator('#economia').scroll_into_view_if_needed()
        page.get_by_role('button', name='2021', exact=True).click()
        assert '3,63' in page.locator('.chart-top').inner_text()
        page.get_by_role('button', name='2025', exact=True).click()
        assert '1,90' in page.locator('.chart-top').inner_text()
        page.locator('#solidariedade').scroll_into_view_if_needed()
        page.wait_for_timeout(1200)
        assert page.get_by_role('heading', name='Entenda as tensões diplomáticas').is_visible()
        page.screenshot(path=str(OUTPUT / f'{label}-solidarity.png'))
        page.locator('#fontes summary').click()
        assert page.locator('#fontes details').get_attribute('open') is not None
        assert page.locator('.sources-list a').count() >= 8
        page.get_by_role('button', name='Reduzir animações').click()
        assert page.locator('.atlas').evaluate('(element) => element.classList.contains("motion-reduced")')
        for section in page.locator('main > section').all():
            section.scroll_into_view_if_needed()
            page.wait_for_timeout(100)
        check_page(page)
        page.evaluate('window.scrollTo(0, 0)')
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUTPUT / f'{label}-full.png'), full_page=True)
        report.append({'viewport': label, 'width': width, 'checks': 'passed'})
        page.close()
    page = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/#cultura', wait_until='networkidle')
    page.locator('.loader').wait_for(state='detached', timeout=10000)
    assert page.locator('.atlas').evaluate('(element) => element.classList.contains("motion-reduced")')
    check_page(page)
    page.get_by_role('button', name='Abrir menu').click()
    page.keyboard.press('Escape')
    assert page.get_by_role('button', name='Abrir menu').get_attribute('aria-expanded') == 'false'
    assert page.get_by_role('button', name='Abrir menu').evaluate('(element) => document.activeElement === element')
    report.append({'viewport': 'mobile-reduced-motion', 'checks': 'passed'})
    browser.close()
    assert not errors, f'Browser errors: {errors}'
    result = {'results': report, 'javascript_errors': errors}
    (OUTPUT / 'report.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
