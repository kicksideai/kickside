use dxf::entities::EntityType;
use dxf::Drawing;
use std::collections::BTreeMap;
use std::io::Cursor;

// Bound the collected text so a drawing with an enormous number of text entities
// cannot grow the Markdown without limit.
const MAX_TEXT_ENTRIES: usize = 100_000;

fn kind(entity: &EntityType) -> &'static str {
    match entity {
        EntityType::Line(_) => "Line",
        EntityType::LwPolyline(_) => "LwPolyline",
        EntityType::Polyline(_) => "Polyline",
        EntityType::Circle(_) => "Circle",
        EntityType::Arc(_) => "Arc",
        EntityType::Ellipse(_) => "Ellipse",
        EntityType::Spline(_) => "Spline",
        EntityType::Text(_) => "Text",
        EntityType::MText(_) => "MText",
        EntityType::Attribute(_) => "Attribute",
        EntityType::AttributeDefinition(_) => "AttributeDefinition",
        EntityType::Insert(_) => "Insert",
        EntityType::Solid(_) => "Solid",
        EntityType::Leader(_) => "Leader",
        EntityType::RotatedDimension(_)
        | EntityType::RadialDimension(_)
        | EntityType::DiameterDimension(_)
        | EntityType::AngularThreePointDimension(_)
        | EntityType::OrdinateDimension(_) => "Dimension",
        _ => "Other",
    }
}

fn push_text(out: &mut Vec<String>, value: &str) {
    let trimmed = value.trim();
    if !trimmed.is_empty() {
        out.push(trimmed.to_string());
    }
}

// A DXF drawing has no prose body, so the useful Markdown is structured metadata:
// drawing version, the layer table, every TEXT/MTEXT/ATTRIBUTE string (the human
// content of title blocks, notes and labels), and an entity-count summary.
pub fn to_markdown(blob: &[u8]) -> Result<String, String> {
    let drawing = Drawing::load(&mut Cursor::new(blob)).map_err(|e| e.to_string())?;

    let mut markdown = String::from("# CAD Drawing\n\n");
    markdown.push_str(&format!("- Version: {:?}\n", drawing.header.version));

    let mut layers: Vec<&str> = drawing.layers().map(|l| l.name.as_str()).collect();
    layers.sort_unstable();
    layers.dedup();
    if !layers.is_empty() {
        markdown.push_str(&format!("\n## Layers ({})\n\n", layers.len()));
        for layer in &layers {
            markdown.push_str(&format!("- {layer}\n"));
        }
    }

    let mut texts: Vec<String> = Vec::new();
    let mut counts: BTreeMap<&'static str, usize> = BTreeMap::new();
    for entity in drawing.entities() {
        *counts.entry(kind(&entity.specific)).or_default() += 1;
        if texts.len() < MAX_TEXT_ENTRIES {
            match &entity.specific {
                EntityType::Text(t) => push_text(&mut texts, &t.value),
                EntityType::MText(m) => push_text(&mut texts, &m.text),
                EntityType::Attribute(a) => push_text(&mut texts, &a.value),
                _ => {}
            }
        }
    }

    if !texts.is_empty() {
        markdown.push_str("\n## Text content\n\n");
        for text in &texts {
            // Keep one DXF text entity on one output line: embedded CR/LF would
            // otherwise split it and could inject surrounding markdown structure.
            let line = text.replace(['\r', '\n'], " ");
            markdown.push_str(line.trim());
            markdown.push('\n');
        }
    }

    if !counts.is_empty() {
        markdown.push_str("\n## Entities\n\n| Type | Count |\n| --- | --- |\n");
        for (label, count) in &counts {
            markdown.push_str(&format!("| {label} | {count} |\n"));
        }
    }

    Ok(markdown.trim_end().to_string())
}

// Structured drawing metadata: the same facts to_markdown renders, but as data the
// caller can consume directly.
pub struct Meta {
    pub version: String,
    pub layers: Vec<String>,
    pub entities: Vec<(String, u32)>,
    pub text_count: u32,
    pub extents: Option<(f64, f64, f64, f64)>,
}

pub fn metadata(blob: &[u8]) -> Result<Meta, String> {
    let drawing = Drawing::load(&mut Cursor::new(blob)).map_err(|e| e.to_string())?;

    let mut layers: Vec<String> = drawing.layers().map(|l| l.name.clone()).collect();
    layers.sort_unstable();
    layers.dedup();

    let mut counts: BTreeMap<&'static str, u32> = BTreeMap::new();
    let mut text_count = 0u32;
    for entity in drawing.entities() {
        *counts.entry(kind(&entity.specific)).or_default() += 1;
        if matches!(
            entity.specific,
            EntityType::Text(_) | EntityType::MText(_) | EntityType::Attribute(_)
        ) {
            text_count += 1;
        }
    }

    Ok(Meta {
        version: format!("{:?}", drawing.header.version),
        layers,
        entities: counts
            .into_iter()
            .map(|(k, c)| (k.to_string(), c))
            .collect(),
        text_count,
        extents: crate::render::bounds_of(&drawing),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &[u8] = include_bytes!("../tests/assets/sample.dxf");

    #[test]
    fn markdown_has_metadata_layers_text_and_entities() {
        let md = to_markdown(SAMPLE).unwrap();
        assert!(md.contains("# CAD Drawing"));
        assert!(md.contains("## Layers"));
        assert!(md.contains("## Text content"));
        assert!(md.contains("DRAWING NO 12345")); // TEXT value
        assert!(md.contains("Tolerance plus minus 0.5mm")); // MTEXT value
        assert!(md.contains("| Line | 1 |"));
        assert!(md.contains("| Circle | 1 |"));
        assert!(md.contains("| Arc | 1 |"));
        assert!(md.contains("| LwPolyline | 1 |"));
        assert!(md.contains("| MText | 1 |"));
    }

    #[test]
    fn rejects_non_dxf() {
        assert!(to_markdown(b"not a dxf at all").is_err());
        assert!(metadata(b"not a dxf at all").is_err());
    }

    #[test]
    fn metadata_reports_structure_and_extents() {
        let m = metadata(SAMPLE).unwrap();
        assert!(!m.version.is_empty());
        assert!(m.layers.contains(&"Geometry".to_string()));
        assert!(m.entities.iter().any(|(k, c)| k == "Line" && *c == 1));
        assert!(m.text_count >= 2); // TEXT + MTEXT
        let (min_x, _min_y, max_x, _max_y) = m.extents.expect("sample has geometry");
        assert!(min_x <= 0.0 && max_x >= 100.0); // sample LINE spans x 0..100
    }
}
