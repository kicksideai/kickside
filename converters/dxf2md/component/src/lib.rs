mod cad;
mod render;

wit_bindgen::generate!({
    world: "dxf2md",
});

struct Component;

const ERR_PARSE: u8 = 2;
const ERR_RENDER: u8 = 3;

fn fail(code: u8, message: impl Into<String>) -> ConvertError {
    ConvertError {
        code,
        message: message.into(),
    }
}

fn to_wit_metadata(m: cad::Meta) -> DrawingMetadata {
    let (has_extents, min_x, min_y, max_x, max_y) = match m.extents {
        Some((min_x, min_y, max_x, max_y)) => (true, min_x, min_y, max_x, max_y),
        None => (false, 0.0, 0.0, 0.0, 0.0),
    };
    DrawingMetadata {
        version: m.version,
        layers: m.layers,
        entities: m
            .entities
            .into_iter()
            .map(|(kind, count)| EntityCount { kind, count })
            .collect(),
        text_count: m.text_count,
        has_extents,
        min_x,
        min_y,
        max_x,
        max_y,
    }
}

impl Guest for Component {
    fn to_markdown(blob: Vec<u8>) -> Result<String, ConvertError> {
        cad::to_markdown(&blob).map_err(|e| fail(ERR_PARSE, e))
    }

    fn metadata(blob: Vec<u8>) -> Result<DrawingMetadata, ConvertError> {
        cad::metadata(&blob)
            .map(to_wit_metadata)
            .map_err(|e| fail(ERR_PARSE, e))
    }

    fn to_image(blob: Vec<u8>, options: RenderOptions) -> Result<Vec<u8>, ConvertError> {
        render::to_png(&blob, options.dpi, options.width, options.height)
            .map_err(|e| fail(ERR_RENDER, e))
    }
}

export!(Component);

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Vec<u8> {
        include_bytes!("../tests/assets/sample.dxf").to_vec()
    }

    #[test]
    fn to_markdown_converts() {
        let md = <Component as Guest>::to_markdown(sample()).unwrap();
        assert!(md.contains("# CAD Drawing"));
        assert!(md.contains("DRAWING NO 12345"));
    }

    #[test]
    fn to_image_renders_png() {
        let opts = RenderOptions {
            dpi: 96.0,
            width: 0,
            height: 0,
        };
        let png = <Component as Guest>::to_image(sample(), opts).unwrap();
        assert_eq!(&png[0..8], b"\x89PNG\r\n\x1a\n");
    }

    #[test]
    fn metadata_returns_structured_data() {
        let m = <Component as Guest>::metadata(sample()).unwrap();
        assert!(!m.version.is_empty());
        assert!(m.layers.contains(&"Geometry".to_string()));
        assert!(m.entities.iter().any(|e| e.kind == "Line" && e.count == 1));
        assert!(m.has_extents);
        assert!(m.min_x <= 0.0 && m.max_x >= 100.0);
    }

    #[test]
    fn rejects_non_dxf_bytes() {
        let err = <Component as Guest>::to_markdown(b"not a dxf at all".to_vec()).unwrap_err();
        assert_eq!(err.code, ERR_PARSE);
    }
}
