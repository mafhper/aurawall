import { DEFAULT_VIGNETTE } from '../../../src/constants';
import { getBlobPath } from '../../../src/utils/blobUtils';

export const generateWallpaperSVG = (presetConfig: any, width: number, height: number): SVGSVGElement => {
    const config = { ...presetConfig, width, height };
    const { shapes, baseColor, noise, noiseScale, vignette } = config;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('xmlns', svgNS);

    // --- DEFS ---
    const defs = document.createElementNS(svgNS, 'defs');

    // 1. Noise Filter
    const noiseFilter = document.createElementNS(svgNS, 'filter');
    noiseFilter.setAttribute('id', 'noiseFilter');
    noiseFilter.innerHTML = `
      <feTurbulence type="fractalNoise" baseFrequency="${(noiseScale || 2) / 1000}" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="${(noise || 50) / 100}"/></feComponentTransfer>
    `;
    defs.appendChild(noiseFilter);

    // 2. Gradients (Base Color)
    if (typeof baseColor !== 'string') {
        const bgGrad = baseColor.type === 'linear'
            ? document.createElementNS(svgNS, 'linearGradient')
            : document.createElementNS(svgNS, 'radialGradient');

        bgGrad.setAttribute('id', 'bgGradient');
        if (baseColor.type === 'linear') {
            bgGrad.setAttribute('x1', '0%'); bgGrad.setAttribute('y1', '0%');
            bgGrad.setAttribute('x2', '100%'); bgGrad.setAttribute('y2', '0%');
            bgGrad.setAttribute('gradientTransform', `rotate(${baseColor.angle || 0}, 0.5, 0.5)`);
        } else {
            bgGrad.setAttribute('cx', '50%'); bgGrad.setAttribute('cy', '50%'); bgGrad.setAttribute('r', '50%');
        }

        const stop1 = document.createElementNS(svgNS, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', baseColor.color1);
        bgGrad.appendChild(stop1);

        const stop2 = document.createElementNS(svgNS, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', baseColor.color2);
        bgGrad.appendChild(stop2);

        defs.appendChild(bgGrad);
    }

    // 3. Vignette Gradient
    const vig = vignette ? { ...DEFAULT_VIGNETTE, ...vignette } : DEFAULT_VIGNETTE;
    if (vig.enabled) {
        const vigGrad = document.createElementNS(svgNS, 'radialGradient');
        vigGrad.setAttribute('id', 'vignette-grad');
        vigGrad.setAttribute('cx', '0.5'); vigGrad.setAttribute('cy', '0.5'); vigGrad.setAttribute('r', '0.5');
        vigGrad.setAttribute('gradientTransform', `translate(${0.5 + vig.offsetX / 100} ${0.5 + vig.offsetY / 100}) scale(${vig.shapeX / 50} ${vig.shapeY / 50}) translate(-0.5 -0.5)`);

        vigGrad.innerHTML = `
            <stop offset="${vig.size}%" stop-color="${vig.color}" stop-opacity="${vig.inverted ? vig.intensity : "0"}" />
            <stop offset="100%" stop-color="${vig.color}" stop-opacity="${vig.inverted ? "0" : vig.intensity}" />
        `;
        defs.appendChild(vigGrad);
    }

    // 4. Shape Blurs
    shapes.forEach((shape: any) => {
        const blur = document.createElementNS(svgNS, 'filter');
        blur.setAttribute('id', `blur-${shape.id}`);
        blur.setAttribute('x', '-100%'); blur.setAttribute('y', '-100%');
        blur.setAttribute('width', '300%'); blur.setAttribute('height', '300%');
        blur.innerHTML = `<feGaussianBlur stdDeviation="${shape.blur}" result="coloredBlur" />`;
        defs.appendChild(blur);
    });

    svg.appendChild(defs);

    // --- LAYERS ---

    // 1. Background Rect
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', typeof baseColor === 'string' ? baseColor : 'url(#bgGradient)');
    svg.appendChild(bgRect);

    // 2. Shapes
    const shapesGroup = document.createElementNS(svgNS, 'g');
    shapes.forEach((shape: any) => {
        let el;
        if (shape.type === 'blob') {
            el = document.createElementNS(svgNS, 'path');
            const pixelSize = (shape.size / 100) * width;
            const pathData = getBlobPath(pixelSize, pixelSize, shape.id, shape.complexity || 6, 0.4);
            el.setAttribute('d', pathData);

            // Transform for blob to center it at x/y
            const xPos = (shape.x / 100) * width - pixelSize / 2;
            const yPos = (shape.y / 100) * height - pixelSize / 2;
            el.setAttribute('transform', `translate(${xPos}, ${yPos})`);
        } else {
            el = document.createElementNS(svgNS, 'circle');
            el.setAttribute('cx', `${shape.x}%`);
            el.setAttribute('cy', `${shape.y}%`);
            el.setAttribute('r', `${shape.size / 2}%`);
        }

        el.setAttribute('fill', shape.color);
        el.setAttribute('opacity', String(shape.opacity));
        el.setAttribute('filter', `url(#blur-${shape.id})`);
        el.style.mixBlendMode = shape.blendMode;

        shapesGroup.appendChild(el);
    });
    svg.appendChild(shapesGroup);

    // 3. Vignette
    if (vig.enabled) {
        const vigRect = document.createElementNS(svgNS, 'rect');
        vigRect.setAttribute('width', '100%'); vigRect.setAttribute('height', '100%');
        vigRect.setAttribute('fill', 'url(#vignette-grad)');
        vigRect.style.mixBlendMode = 'normal';
        svg.appendChild(vigRect);
    }

    // 4. Noise
    const noiseRect = document.createElementNS(svgNS, 'rect');
    noiseRect.setAttribute('width', '100%'); noiseRect.setAttribute('height', '100%');
    noiseRect.setAttribute('filter', 'url(#noiseFilter)');
    noiseRect.style.mixBlendMode = 'overlay';
    svg.appendChild(noiseRect);

    return svg;
};
