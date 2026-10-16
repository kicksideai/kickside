"""Render a fixture document through the installed markdown viewer."""
import json
from harness import require
from scenarios import nav


def markdown_math_mermaid(ctx):
    from playwright.sync_api import expect
    from scenarios_ai import completed_upload, fresh_ui, shot
    catalog = ctx.inst.request('GET', '/api/v1/renderers', label='markdown-renderer-catalog')
    require('wc-render-markdown' in json.dumps(catalog), 'Markdown viewer is absent from the renderer catalog')
    path = ctx.inst.root / 'temp' / 'Northwind-math-and-plan.md'
    path.write_text(r'''# Northwind NW-AI-731 analysis

Effect $\beta=0.147$ holds. Costs stay $5 and $10.

$$
x = \frac{1}{2}
$$

```mermaid
graph TD
  A[Receive Northwind order] --> B[Review Northwind dispatch]
```

```mermaid
not a diagram
```
''')
    completed_upload(ctx, path)
    for mode in ('light', 'dark'):
        ctx.browser.page.emulate_media(color_scheme=mode)
        fresh_ui(ctx)
        nav(ctx, 'Uploads')
        uploads = ctx.browser.frame.locator('kickside-uploads')
        uploads.get_by_label('Search files', exact=True).fill(path.name)
        uid = ctx.state['ai_uploads'][path.name]
        uploads.locator('[data-testid=uploads-row-preview][data-upload-id="' + uid + '"]').click()
        drawer = ctx.browser.frame.get_by_role('dialog', name='File preview')
        expect(drawer).to_be_visible(timeout=30000)
        viewer = drawer.locator('wc-render-markdown')
        expect(viewer.locator('math')).to_have_count(2, timeout=30000)
        expect(viewer.locator('math[display="block"] mfrac')).to_have_count(1)
        expect(viewer).to_contain_text('β')
        expect(viewer).to_contain_text('$5 and $10')
        diagram = viewer.locator('.md-mermaid svg')
        expect(diagram).to_have_count(1, timeout=30000)
        expect(diagram).to_contain_text('Receive Northwind order')
        expect(diagram).to_contain_text('Review Northwind dispatch')
        box = diagram.bounding_box()
        require(box and box['width'] > 100 and box['height'] > 20, 'Rendered diagram has no visible geometry')
        labels_fit = diagram.evaluate('''svg => [...svg.querySelectorAll('foreignObject, g.node > rect')].every(box => {
            const text = box.localName === 'rect' ? box.parentElement.querySelector('text') : box.querySelector('.nodeLabel');
            if (!text) return true;
            const range = document.createRange();
            range.selectNodeContents(text);
            const bounds = box.getBoundingClientRect();
            return [...range.getClientRects()].every(rect => rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1);
        })''')
        require(labels_fit, 'Diagram labels extend outside their rendered bounds')
        note = viewer.locator('.md-mermaid-error')
        expect(note).to_contain_text('Diagram could not render:')
        contrast = note.evaluate(r'''element => {
            const luminance = color => {
                const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255);
                const linear = channels.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
                return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
            };
            let ancestor = element;
            let background;
            while (ancestor) {
                const color = getComputedStyle(ancestor).backgroundColor;
                if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') { background = color; break; }
                ancestor = ancestor.parentElement || ancestor.getRootNode().host;
            }
            if (!background) throw new Error('Diagram error has no resolved background');
            const values = [luminance(getComputedStyle(element).color), luminance(background)].sort((a, b) => a - b);
            return (values[1] + .05) / (values[0] + .05);
        }''')
        require(contrast >= 4.5, f'Diagram error contrast is {contrast:.2f}, below 4.5')
        expect(viewer.locator('.md-mermaid').last).to_contain_text('not a diagram')
        shot(ctx, 'northwind-math-mermaid-' + mode)
        drawer.get_by_role('button', name='Close preview', exact=True).click()
    ctx.browser.page.emulate_media(color_scheme='light')

