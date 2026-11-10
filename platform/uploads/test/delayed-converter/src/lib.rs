// SPDX-License-Identifier: MIT
#![no_std]
extern crate alloc;
use alloc::{vec, vec::Vec};
#[global_allocator]
static ALLOCATOR: dlmalloc::GlobalDlmalloc = dlmalloc::GlobalDlmalloc;
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}
wit_bindgen::generate!({ world: "converter", with: { "wasi:clocks/monotonic-clock@0.2.8": generate } });

struct Converter;
impl Guest for Converter {
    fn convert(_: ConversionRequest) -> Result<ConvertedDocument, ConversionError> {
        let start = wasi::clocks::monotonic_clock::now();
        while wasi::clocks::monotonic_clock::now() - start < 95_000_000_000 {
            let mut value = 1_u64;
            for _ in 0..100_000 {
                value =
                    core::hint::black_box(value.wrapping_mul(6364136223846793005).wrapping_add(1));
            }
            core::hint::black_box(value);
        }
        Ok(ConvertedDocument {
            markdown: "Budget conversion completes.".into(),
            images: vec![],
        })
    }
    fn page_resources(_: Vec<u8>) -> Result<Vec<PageInfo>, ConversionError> {
        Ok(vec![PageInfo {
            page: 1,
            text_len: 28,
            image_count: 0,
        }])
    }
}
export!(Converter);

#[no_mangle]
pub unsafe extern "C" fn cabi_realloc(
    ptr: *mut u8,
    old_size: usize,
    align: usize,
    new_size: usize,
) -> *mut u8 {
    if old_size == 0 && new_size == 0 {
        return align as *mut u8;
    }
    let result = if old_size == 0 {
        alloc::alloc::alloc(alloc::alloc::Layout::from_size_align_unchecked(
            new_size, align,
        ))
    } else {
        alloc::alloc::realloc(
            ptr,
            alloc::alloc::Layout::from_size_align_unchecked(old_size, align),
            new_size,
        )
    };
    if result.is_null() {
        core::arch::wasm32::unreachable();
    }
    result
}
