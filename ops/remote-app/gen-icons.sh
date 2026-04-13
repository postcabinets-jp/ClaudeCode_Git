#!/bin/bash
# Generate PWA icons using macOS sips
cd "$(dirname "$0")"

# Create SVG icon
cat > icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="100%" style="stop-color:#533483"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#g)"/>
  <text x="256" y="300" font-family="SF Mono,Menlo,monospace" font-size="240"
        font-weight="bold" fill="white" text-anchor="middle">C&gt;</text>
</svg>
SVG

# Convert using rsvg-convert if available, otherwise use a simple HTML approach
if command -v rsvg-convert &>/dev/null; then
  rsvg-convert -w 192 -h 192 icon.svg > icon-192.png
  rsvg-convert -w 512 -h 512 icon.svg > icon-512.png
else
  # Use Python with cairosvg if available
  python3 -c "
import subprocess, sys
try:
    import cairosvg
    cairosvg.svg2png(url='icon.svg', write_to='icon-512.png', output_width=512, output_height=512)
    cairosvg.svg2png(url='icon.svg', write_to='icon-192.png', output_width=192, output_height=192)
except ImportError:
    # Fallback: create simple colored PNG with sips
    subprocess.run(['sips', '-s', 'format', 'png', '--resampleWidth', '512', 'icon.svg', '--out', 'icon-512.png'], capture_output=True)
    print('cairosvg not available, using fallback')
    sys.exit(1)
"
fi

echo "Icons generated"
