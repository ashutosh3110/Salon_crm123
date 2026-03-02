import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

/**
 * BarcodeDisplay — Renders an SVG barcode using JsBarcode
 * Props:
 *   value   — barcode number string (EAN-13 etc.)
 *   width   — bar width (default 1.5)
 *   height  — bar height in px (default 40)
 *   fontSize — text font size (default 10)
 *   showText — show human-readable number (default true)
 *   className — extra classes on wrapper div
 */
export default function BarcodeDisplay({
    value,
    width = 1.5,
    height = 40,
    fontSize = 10,
    showText = true,
    className = '',
}) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !value) return;
        try {
            JsBarcode(svgRef.current, value, {
                format: value.length === 13 ? 'EAN13' : 'CODE128',
                width,
                height,
                fontSize,
                displayValue: showText,
                margin: 4,
                background: 'transparent',
                lineColor: '#000000',
                textColor: '#666666',
                fontOptions: 'bold',
                font: 'monospace',
            });
        } catch (e) {
            // Fallback for invalid barcode values: use CODE128
            try {
                JsBarcode(svgRef.current, value, {
                    format: 'CODE128',
                    width,
                    height,
                    fontSize,
                    displayValue: showText,
                    margin: 4,
                    background: 'transparent',
                });
            } catch (_) { /* ignore */ }
        }
    }, [value, width, height, fontSize, showText]);

    if (!value) return null;

    return (
        <div className={className}>
            <svg ref={svgRef} />
        </div>
    );
}
