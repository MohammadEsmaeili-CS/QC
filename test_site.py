from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image
base=Path('/mnt/data/labtrix-story-site')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,w,h in [('desktop',1440,900),('mobile',390,844)]:
        page=browser.new_page(viewport={'width':w,'height':h}, device_scale_factor=1, reduced_motion='reduce')
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto('http://127.0.0.1:8765/index.html', wait_until='domcontentloaded')
        page.wait_for_timeout(1000)
        page.screenshot(path=str(base/'preview'/f'{label}-hero.png'), animations='disabled')
        page.screenshot(path=str(base/'preview'/f'{label}-full.png'),full_page=True,animations='disabled')
        page.locator('#chapter-cost').scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        current = page.locator('.stage-photo.is-active').count()
        active_caption = page.locator('.stage-corner').inner_text()
        page.screenshot(path=str(base/'preview'/f'{label}-story.png'),animations='disabled')
        overflow = page.evaluate('({scroll:document.documentElement.scrollWidth, client:document.documentElement.clientWidth})')
        print(label,'title:',page.title(),'images:',page.locator('img').count(),'active_photos:',current,'counter:',active_caption,'overflow:',overflow,'errors:',errors)
        if label=='mobile':
            page.locator('#menu-toggle').click()
            print('mobile nav visible:',page.locator('#mobile-nav').is_visible(),'expanded:',page.locator('#menu-toggle').get_attribute('aria-expanded'))
            page.locator('#mobile-nav a[href="#solutions"]').click()
            print('mobile nav close and anchor:',not page.locator('#mobile-nav').is_visible(),page.url)
        page.close()
    browser.close()
