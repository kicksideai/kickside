"""Screenshot privacy survives live form controls disappearing during capture."""
from browser import Browser
from harness import Scenario, require


def regression_browser_screenshot_dom_churn(ctx):
    from PIL import Image
    browser = Browser(ctx.inst, session=ctx.browser_session)
    try:
        browser.page.set_content("""<body style='margin:0'>
          <input id='stable' value='ordinary-private-value' style='width:240px;height:80px'>
          <iframe srcdoc="<input id='transient' value='changing-private-value'>"></iframe>
        </body>""")
        box = browser.page.locator('#stable').bounding_box()
        require(box, 'The privacy control is not visible')
        frame = browser.page.frames[1]
        frame.locator('input').wait_for(state='visible', timeout=30000)
        from unittest.mock import patch
        locate = frame.locator

        def locator_with_redraw(*args, **kwargs):
            locator = locate(*args, **kwargs)
            all_controls = locator.all

            def controls_with_barriers():
                controls = all_controls()
                for control in controls:
                    visible = control.is_visible

                    def visibility_then_redraw(*args, control=control, visible=visible, **kwargs):
                        result = visible(*args, **kwargs)
                        if result:
                            control.evaluate_all("""elements => {
                              for (const element of elements) {
                                if (element.matches('#transient')) {
                                  element.remove();
                                  parent.document.body.dataset.controlRemoved = 'true';
                                }
                              }
                            }""")
                        return result

                    control.is_visible = visibility_then_redraw
                return controls

            locator.all = controls_with_barriers
            return locator

        with patch.object(frame, 'locator', locator_with_redraw):
            path = browser.screenshot('screenshot-dom-churn', full_page=False)
        require(browser.page.locator('body').get_attribute('data-control-removed') == 'true',
                'The capture does not exercise a disappearing form control')
        require(frame.locator('input').count() == 0, 'The transient form control remains')
        with Image.open(path) as image:
            pixel = image.convert('RGB').getpixel((int(box['x'] + box['width'] / 2),
                                                  int(box['y'] + box['height'] / 2)))
        require(pixel == (255, 0, 255), 'Screenshot exposes the surviving private input value')
        browser.clean(0)
        ctx.inst.evidence.save('screenshot-dom-churn', {'removed_control': True,
                                                      'surviving_private_control_masked': True})
    finally:
        browser.close()


REGISTRY = [Scenario('regression_browser_screenshot_dom_churn', 'regression',
    regression_browser_screenshot_dom_churn, ('boot',),
    issues=('SMOKE-SCREENSHOT-DOM-CHURN',))]
