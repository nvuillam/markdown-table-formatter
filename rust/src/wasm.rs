//! Minimal WebAssembly interface, used by lib/engine.js (no wasm-bindgen needed).
//!
//! JS calls `mtf_alloc(len)`, writes UTF-8 input at the returned pointer, calls
//! `mtf_format(ptr, len, padding)` (which frees the input), reads
//! `mtf_result_len()` bytes at the returned pointer, then calls `mtf_free_result()`.

use std::cell::RefCell;

thread_local! {
    static RESULT: RefCell<String> = const { RefCell::new(String::new()) };
}

#[no_mangle]
pub extern "C" fn mtf_alloc(len: usize) -> *mut u8 {
    let mut buffer = Vec::<u8>::with_capacity(len);
    let ptr = buffer.as_mut_ptr();
    std::mem::forget(buffer);
    ptr
}

/// # Safety
/// `ptr` must come from `mtf_alloc(len)` and hold `len` bytes of UTF-8 text.
#[no_mangle]
pub unsafe extern "C" fn mtf_format(ptr: *mut u8, len: usize, column_padding: u32) -> *const u8 {
    let input = Vec::from_raw_parts(ptr, len, len);
    let text = String::from_utf8_lossy(&input);
    let options = crate::Options {
        column_padding: column_padding as usize,
    };
    let output = crate::format_tables(&text, &options);
    RESULT.with(|result| {
        *result.borrow_mut() = output;
        result.borrow().as_ptr()
    })
}

#[no_mangle]
pub extern "C" fn mtf_result_len() -> usize {
    RESULT.with(|result| result.borrow().len())
}

#[no_mangle]
pub extern "C" fn mtf_free_result() {
    RESULT.with(|result| *result.borrow_mut() = String::new());
}
