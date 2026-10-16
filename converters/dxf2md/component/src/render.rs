use dxf::entities::EntityType;
use dxf::Drawing;
use std::f64::consts::PI;
use std::io::Cursor;
use tiny_skia::{Color, Paint, PathBuilder, Pixmap, Stroke, Transform};

const DEFAULT_DPI: f32 = 96.0;
const LONG_SIDE_AT_96: f32 = 1024.0;
const MAX_DIM: u32 = 4000;
const MIN_DIM: u32 = 16;
const MARGIN: f32 = 8.0;
const ARC_STEP_DEG: f64 = 4.0;
const ARC_MAX_STEPS: usize = 4096;
const CIRCLE_SEGMENTS: usize = 96;
// Cap the number of entities turned into line work so a drawing with an enormous
// entity count cannot amplify into unbounded rasterization work.
const MAX_RENDER_ENTITIES: usize = 200_000;

type Poly = Vec<(f64, f64)>;

fn circle(cx: f64, cy: f64, r: f64) -> Poly {
    (0..=CIRCLE_SEGMENTS)
        .map(|i| {
            let a = 2.0 * PI * (i as f64) / (CIRCLE_SEGMENTS as f64);
            (cx + r * a.cos(), cy + r * a.sin())
        })
        .collect()
}

fn arc(cx: f64, cy: f64, r: f64, start_deg: f64, end_deg: f64) -> Poly {
    // Normalize the sweep into (0, 360] with arithmetic (never a loop), and clamp
    // the step count, so adversarial angles cannot hang or allocate without bound.
    let mut sweep = (end_deg - start_deg).rem_euclid(360.0);
    if sweep == 0.0 {
        sweep = 360.0;
    }
    let steps = ((sweep / ARC_STEP_DEG).ceil() as usize).clamp(2, ARC_MAX_STEPS);
    (0..=steps)
        .map(|i| {
            let deg = start_deg + sweep * (i as f64) / (steps as f64);
            let a = deg.to_radians();
            (cx + r * a.cos(), cy + r * a.sin())
        })
        .collect()
}

// Collect every entity that has a planar polyline approximation. Text, inserts and
// 3D solids are ignored — a CAD raster preview is about the line work.
fn polylines(drawing: &Drawing) -> Vec<Poly> {
    let mut out: Vec<Poly> = Vec::new();
    for entity in drawing.entities() {
        if out.len() >= MAX_RENDER_ENTITIES {
            break;
        }
        match &entity.specific {
            EntityType::Line(l) => out.push(vec![(l.p1.x, l.p1.y), (l.p2.x, l.p2.y)]),
            EntityType::Circle(c) => out.push(circle(c.center.x, c.center.y, c.radius)),
            EntityType::Arc(a) => out.push(arc(
                a.center.x,
                a.center.y,
                a.radius,
                a.start_angle,
                a.end_angle,
            )),
            EntityType::LwPolyline(p) => {
                let mut pts: Poly = p.vertices.iter().map(|v| (v.x, v.y)).collect();
                if p.flags & 1 != 0 {
                    if let Some(&first) = pts.first() {
                        pts.push(first);
                    }
                }
                if pts.len() >= 2 {
                    out.push(pts);
                }
            }
            EntityType::Polyline(p) => {
                let mut pts: Poly = p.vertices().map(|v| (v.location.x, v.location.y)).collect();
                // Close the contour when the closed flag (group 70 bit 1) is set,
                // matching LwPolyline.
                if p.flags & 1 != 0 {
                    if let Some(&first) = pts.first() {
                        pts.push(first);
                    }
                }
                if pts.len() >= 2 {
                    out.push(pts);
                }
            }
            _ => {}
        }
    }
    out
}

fn bounds(polys: &[Poly]) -> Option<(f64, f64, f64, f64)> {
    let (mut min_x, mut min_y, mut max_x, mut max_y) = (
        f64::INFINITY,
        f64::INFINITY,
        f64::NEG_INFINITY,
        f64::NEG_INFINITY,
    );
    let mut any = false;
    for poly in polys {
        for &(x, y) in poly {
            if x.is_finite() && y.is_finite() {
                any = true;
                min_x = min_x.min(x);
                min_y = min_y.min(y);
                max_x = max_x.max(x);
                max_y = max_y.max(y);
            }
        }
    }
    any.then_some((min_x, min_y, max_x, max_y))
}

// Geometric bounding box of the drawing's line work, shared with the metadata path.
pub(crate) fn bounds_of(drawing: &Drawing) -> Option<(f64, f64, f64, f64)> {
    bounds(&polylines(drawing))
}

fn clamp_dim(v: f64) -> f64 {
    v.round().clamp(MIN_DIM as f64, MAX_DIM as f64)
}

// Decide the output canvas in pixels from the drawing's extent (w, h in drawing
// units) and the requested sizing. An explicit `width`/`height` (non-zero) is
// honored exactly; a single dimension derives the other from the aspect ratio;
// otherwise `dpi` sets the longer side (~1024 px at 96 dpi). Kept in f64 so a
// finite-but-huge extent never saturates to inf before clamping.
fn canvas_size(w: f64, h: f64, dpi: f32, width: u32, height: u32) -> (f64, f64) {
    let margin = MARGIN as f64;
    match (width, height) {
        (wd, ht) if wd > 0 && ht > 0 => (clamp_dim(wd as f64), clamp_dim(ht as f64)),
        (wd, 0) if wd > 0 => {
            let cw = clamp_dim(wd as f64);
            let scale = (cw - 2.0 * margin).max(1.0) / w;
            (cw, clamp_dim(h * scale + 2.0 * margin))
        }
        (0, ht) if ht > 0 => {
            let ch = clamp_dim(ht as f64);
            let scale = (ch - 2.0 * margin).max(1.0) / h;
            (clamp_dim(w * scale + 2.0 * margin), ch)
        }
        _ => {
            let dpi = if dpi.is_finite() && dpi > 0.0 {
                dpi
            } else {
                DEFAULT_DPI
            };
            let long_px =
                (LONG_SIDE_AT_96 * dpi / DEFAULT_DPI).clamp(MIN_DIM as f32, MAX_DIM as f32) as f64;
            let scale = (long_px - 2.0 * margin).max(1.0) / w.max(h);
            (
                clamp_dim(w * scale + 2.0 * margin),
                clamp_dim(h * scale + 2.0 * margin),
            )
        }
    }
}

// Rasterize the drawing's line work onto a white pixmap of the requested size. The
// drawing is fit into the canvas preserving aspect ratio and centered; CAD
// coordinates are Y-up, so the vertical axis is flipped for raster.
fn render_pixmap(blob: &[u8], dpi: f32, width: u32, height: u32) -> Result<Pixmap, String> {
    let drawing = Drawing::load(&mut Cursor::new(blob)).map_err(|e| e.to_string())?;
    let polys = polylines(&drawing);
    let (min_x, min_y, max_x, max_y) = bounds(&polys).ok_or("no renderable geometry in DXF")?;

    // Keep extent/scale math in f64: casting a finite-but-huge extent to f32 first
    // would saturate to inf and falsely reject a valid large drawing.
    let w = max_x - min_x;
    let h = max_y - min_y;
    if !w.is_finite() || !h.is_finite() || w.max(h) <= f64::EPSILON {
        return Err("DXF drawing has no measurable extent".into());
    }

    let (canvas_w, canvas_h) = canvas_size(w, h, dpi, width, height);
    let margin = MARGIN as f64;
    let avail_w = (canvas_w - 2.0 * margin).max(1.0);
    let avail_h = (canvas_h - 2.0 * margin).max(1.0);
    // Fit preserving aspect ratio. `w` or `h` may be 0 for a straight line; the
    // both-zero case is rejected above, so at most one term is `+inf` here and
    // `.min()` selects the finite axis (no `0 * inf` NaN can arise).
    let scale = (avail_w / w).min(avail_h / h);
    let off_x = (canvas_w - w * scale) / 2.0;
    let off_y = (canvas_h - h * scale) / 2.0;

    let mut pixmap =
        Pixmap::new(canvas_w as u32, canvas_h as u32).ok_or("failed to allocate raster canvas")?;
    pixmap.fill(Color::WHITE);

    let to_px = |x: f64, y: f64| -> (f32, f32) {
        let px = (off_x + (x - min_x) * scale) as f32;
        let py = (canvas_h - off_y - (y - min_y) * scale) as f32;
        (px, py)
    };

    let mut paint = Paint::default();
    paint.set_color_rgba8(0, 0, 0, 255);
    paint.anti_alias = true;
    let stroke = Stroke {
        width: 1.0,
        ..Default::default()
    };

    for poly in &polys {
        // Skip a polyline that has no points.
        let Some(&(fx, fy)) = poly.first() else {
            continue;
        };
        let mut pb = PathBuilder::new();
        let (x0, y0) = to_px(fx, fy);
        pb.move_to(x0, y0);
        for &(x, y) in &poly[1..] {
            let (px, py) = to_px(x, y);
            pb.line_to(px, py);
        }
        if let Some(path) = pb.finish() {
            pixmap.stroke_path(&path, &paint, &stroke, Transform::identity(), None);
        }
    }

    Ok(pixmap)
}

pub fn to_png(blob: &[u8], dpi: f32, width: u32, height: u32) -> Result<Vec<u8>, String> {
    let pixmap = render_pixmap(blob, dpi, width, height)?;

    pixmap.encode_png().map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &[u8] = include_bytes!("../tests/assets/sample.dxf");

    #[test]
    fn renders_dxf_to_a_valid_png() {
        let png = to_png(SAMPLE, 96.0, 0, 0).unwrap();
        assert_eq!(&png[0..8], b"\x89PNG\r\n\x1a\n");
        assert!(png.len() > 100);
    }

    #[test]
    fn dpi_scales_resolution() {
        let small = to_png(SAMPLE, 48.0, 0, 0).unwrap();
        let large = to_png(SAMPLE, 192.0, 0, 0).unwrap();
        // Higher dpi -> larger raster -> larger PNG payload.
        assert!(
            large.len() > small.len(),
            "expected dpi to scale output size"
        );
    }

    #[test]
    fn explicit_width_and_height_set_the_exact_canvas() {
        let pm = render_pixmap(SAMPLE, 0.0, 800, 600).unwrap();
        assert_eq!((pm.width(), pm.height()), (800, 600));
    }

    #[test]
    fn a_single_dimension_derives_the_other_from_aspect() {
        let pm = render_pixmap(SAMPLE, 0.0, 1000, 0).unwrap();
        assert_eq!(pm.width(), 1000);
        assert!(pm.height() >= MIN_DIM && pm.height() <= MAX_DIM);
        let pm2 = render_pixmap(SAMPLE, 0.0, 0, 1000).unwrap();
        assert_eq!(pm2.height(), 1000);
    }

    #[test]
    fn requested_dimensions_are_clamped_to_the_safe_range() {
        let big = render_pixmap(SAMPLE, 0.0, 99_999, 99_999).unwrap();
        assert_eq!((big.width(), big.height()), (MAX_DIM, MAX_DIM));
        let tiny = render_pixmap(SAMPLE, 0.0, 1, 1).unwrap();
        assert_eq!((tiny.width(), tiny.height()), (MIN_DIM, MIN_DIM));
    }

    fn span(poly: &[(f64, f64)]) -> (f64, f64, f64, f64) {
        poly.iter().fold(
            (
                f64::INFINITY,
                f64::INFINITY,
                f64::NEG_INFINITY,
                f64::NEG_INFINITY,
            ),
            |(nx, ny, xx, xy), &(x, y)| (nx.min(x), ny.min(y), xx.max(x), xy.max(y)),
        )
    }

    #[test]
    fn bounds_spans_all_points() {
        let polys = vec![vec![(1.0, 2.0), (5.0, 3.0)], vec![(-2.0, 9.0)]];
        assert_eq!(bounds(&polys), Some((-2.0, 2.0, 5.0, 9.0)));
        assert_eq!(bounds(&[]), None);
    }

    #[test]
    fn closed_polyline_contour_wraps_to_first_point() {
        use dxf::entities::{Entity, Polyline, Vertex};
        use dxf::{Drawing, Point};
        let mut d = Drawing::new();
        let mut poly = Polyline::default();
        poly.flags = 1; // closed (group 70 bit 1)
        for (x, y) in [(0.0, 0.0), (10.0, 0.0), (10.0, 10.0)] {
            poly.add_vertex(&mut d, Vertex::new(Point::new(x, y, 0.0)));
        }
        d.add_entity(Entity::new(EntityType::Polyline(poly)));
        let polys = polylines(&d);
        assert_eq!(polys.len(), 1, "expected one polyline");
        let p = &polys[0];
        assert_eq!(p.len(), 4, "3 vertices + closing wrap-around point");
        assert_eq!(p.first(), p.last(), "closed contour returns to its start");
    }

    #[test]
    fn circle_is_centred_with_correct_radius() {
        let c = circle(3.0, 4.0, 2.0);
        // closes back to the start
        let (fx, fy) = *c.first().unwrap();
        let (lx, ly) = *c.last().unwrap();
        assert!((fx - lx).abs() < 1e-9 && (fy - ly).abs() < 1e-9);
        // spans exactly [cx-r, cx+r] x [cy-r, cy+r]
        let (nx, ny, xx, xy) = span(&c);
        assert!((nx - 1.0).abs() < 1e-6 && (xx - 5.0).abs() < 1e-6);
        assert!((ny - 2.0).abs() < 1e-6 && (xy - 6.0).abs() < 1e-6);
    }

    #[test]
    fn arc_starts_and_ends_on_its_endpoints() {
        // quarter circle, radius 1, 0 -> 90 degrees: (1,0) -> (0,1)
        let a = arc(0.0, 0.0, 1.0, 0.0, 90.0);
        let (sx, sy) = *a.first().unwrap();
        let (ex, ey) = *a.last().unwrap();
        assert!((sx - 1.0).abs() < 1e-6 && sy.abs() < 1e-6);
        assert!(ex.abs() < 1e-6 && (ey - 1.0).abs() < 1e-6);
        // wraparound: 350 -> 10 sweeps 20 degrees, not -340
        let w = arc(0.0, 0.0, 1.0, 350.0, 10.0);
        assert!(w.len() >= 5);
    }

    #[test]
    fn arc_with_adversarial_angles_stays_bounded() {
        // Huge/degenerate angles must neither hang nor allocate without bound.
        for (s, e) in [(1e300, 0.0), (0.0, 1e308), (-1e308, 1e308), (1e9, -1e9)] {
            let a = arc(0.0, 0.0, 1.0, s, e);
            assert!(
                a.len() <= ARC_MAX_STEPS + 1,
                "arc({s},{e}) -> {} points",
                a.len()
            );
        }
    }

    // Minimal DXF with a single diagonal line from (0,0) to (10,10).
    const DIAGONAL: &[u8] =
        b"0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n10\n21\n10\n0\nENDSEC\n0\nEOF\n";

    fn dark_count(pixmap: &Pixmap, x0: u32, y0: u32, x1: u32, y1: u32) -> u32 {
        let mut n = 0;
        for y in y0..y1 {
            for x in x0..x1 {
                if let Some(p) = pixmap.pixel(x, y) {
                    if p.red() < 128 {
                        n += 1;
                    }
                }
            }
        }
        n
    }

    fn entities_dxf(body: &str) -> Vec<u8> {
        format!("0\nSECTION\n2\nENTITIES\n{body}0\nENDSEC\n0\nEOF\n").into_bytes()
    }

    #[test]
    fn each_geometry_type_contributes_to_the_render() {
        // Every supported entity, on its own, must produce visible line work — this
        // pins each match arm in `polylines`.
        let cases = [
            "0\nCIRCLE\n8\n0\n10\n0\n20\n0\n40\n10\n",
            "0\nARC\n8\n0\n10\n0\n20\n0\n40\n10\n50\n0\n51\n90\n",
            "0\nLWPOLYLINE\n8\n0\n90\n3\n70\n0\n10\n0\n20\n0\n10\n10\n20\n0\n10\n10\n20\n10\n",
        ];
        for body in cases {
            let pixmap = render_pixmap(&entities_dxf(body), 96.0, 0, 0).unwrap();
            let (w, h) = (pixmap.width(), pixmap.height());
            assert!(
                dark_count(&pixmap, 0, 0, w, h) > 0,
                "expected visible geometry for: {body}"
            );
        }
    }

    #[test]
    fn render_places_geometry_with_y_flip() {
        // CAD is Y-up: the line rises left-to-right, so after the raster Y-flip the
        // stroke must occupy the TOP-RIGHT, not the top-left. A missing or inverted
        // flip would move the dark pixels to the other quadrant.
        let pixmap = render_pixmap(DIAGONAL, 96.0, 0, 0).unwrap();
        let (w, h) = (pixmap.width(), pixmap.height());
        let top_left = dark_count(&pixmap, 0, 0, w / 2, h / 2);
        let top_right = dark_count(&pixmap, w / 2, 0, w, h / 2);
        assert!(
            top_right > top_left,
            "expected the rising line in the top-right (tr={top_right}, tl={top_left})"
        );
        // and there is genuinely some line work (not a blank canvas)
        assert!(top_right > 0);
    }

    fn rng(s: &mut u64) -> u64 {
        *s = s.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = *s;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    fn mutate(seed: &[u8], r: &mut u64) -> Vec<u8> {
        let mut v = seed.to_vec();
        for _ in 0..1 + (rng(r) % 24) {
            if v.is_empty() {
                v.push((rng(r) & 0xff) as u8);
            }
            let x = rng(r);
            let len = v.len();
            match x % 6 {
                0 => v[(x >> 8) as usize % len] ^= 1 << ((x >> 4) & 7),
                1 => v[(x >> 8) as usize % len] = (x >> 16) as u8,
                2 => v.insert((x >> 8) as usize % len, (x >> 16) as u8),
                3 => {
                    let i = (x >> 8) as usize % len;
                    v.remove(i);
                }
                4 => v.truncate((x >> 8) as usize % len),
                _ => v.extend(std::iter::repeat_n((x >> 16) as u8, (x >> 8) as usize % 64)),
            }
        }
        v
    }

    // Run:
    //   cargo test --release fuzz_render_never_panics -- --ignored --nocapture
    #[test]
    #[ignore]
    fn fuzz_render_never_panics() {
        const ITERS: u64 = 30_000;
        let prev = std::panic::take_hook();
        std::panic::set_hook(Box::new(|_| {}));
        let mut crashes = 0u32;
        for iter in 0..ITERS {
            let mut r = 0x51ED_2701_ABCD_1234u64 ^ iter.wrapping_mul(0x9E37_79B9_7F4A_7C15);
            let input = mutate(SAMPLE, &mut r);
            let res = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                let _ = crate::cad::to_markdown(&input);
                let _ = to_png(&input, 96.0, 0, 0);
            }));
            if res.is_err() {
                crashes += 1;
                if crashes >= 5 {
                    break;
                }
            }
        }
        std::panic::set_hook(prev);
        assert_eq!(crashes, 0, "{crashes} dxf fuzz crash(es)");
        eprintln!("dxf fuzz: {ITERS} iters, 0 panics");
    }
}
