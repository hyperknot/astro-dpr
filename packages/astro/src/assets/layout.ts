import type { ImageLayout } from './types.js';

// Common screen widths. These will be filtered according to the image size and layout
export const DEFAULT_RESOLUTIONS = [
	640, // older and lower-end phones
	750, // iPhone 6-8
	828, // iPhone XR/11
	960, // older horizontal phones
	1080, // iPhone 6-8 Plus
	1280, // 720p
	1668, // Various iPads
	1920, // 1080p
	2048, // QXGA
	2560, // WQXGA
	3200, // QHD+
	3840, // 4K
	4480, // 4.5K
	5120, // 5K
	6016, // 6K
];

// A more limited set of screen widths, for statically generated images
export const LIMITED_RESOLUTIONS = [
	640, // older and lower-end phones
	750, // iPhone 6-8
	828, // iPhone XR/11
	1080, // iPhone 6-8 Plus
	1280, // 720p
	1668, // Various iPads
	2048, // QXGA
	2560, // WQXGA
];

const stepsFixed = [1.0, 2.0];

const _steps4 = [0.25, 0.5, 1.0, 2.0]; // Ratio: 2.0
const steps7 = [0.25, 0.35, 0.5, 0.71, 1.0, 1.41, 2.0]; // Ratio: 1.414 (√2)

/**
 * Gets the breakpoints for an image, based on the layout and width
 *
 * The rules are as follows:
 *
 * - For full-width layout we return all breakpoints smaller than the original image width
 * - For fixed layout we return 1x and 2x the requested width, unless the original image is smaller than that.
 * - For responsive layout we return all breakpoints smaller than 2x the requested width, unless the original image is smaller than that.
 */
export const getWidths = ({
	width,
	layout,
	breakpoints = DEFAULT_RESOLUTIONS,
	originalWidth,
}: {
	width?: number;
	layout: ImageLayout;
	breakpoints?: Array<number>;
	originalWidth?: number;
}): Array<number> => {
	if (layout === 'none') return [];

	const breakpointsSorted = breakpoints.sort((a, b) => a - b);

	const smallerThanOriginal = (w: number) => !originalWidth || w <= originalWidth;

	// For full-width layout we return all breakpoints smaller than the original image width
	if (layout === 'full-width') {
		return breakpointsSorted.filter(smallerThanOriginal);
	}
	// For other layouts we need a width to generate breakpoints. If no width is provided, we return an empty array
	if (!width) {
		return [];
	}

	// Pick the correct step array
	const stepsForLayout = {
		fixed: stepsFixed,
		constrained: steps7,
	};
	const steps = stepsForLayout[layout];

	// Compute and sort the candidate widths
	let candidates = steps.map((step) => Math.round(width * step)).sort((a, b) => a - b);

	// Limit sizes to originalWidth (add size and filter below)
	if (originalWidth && originalWidth < candidates.at(-1)!) {
		candidates.push(originalWidth);
	}

	// Limit sizes to biggest possible screen size x2, but absolute max. width to 6K (add size and filter below)
	const largestScreenSize = Math.min(breakpointsSorted.at(-1)! * 2, 6016);
	if (candidates.at(-1)! > largestScreenSize) {
		candidates.push(largestScreenSize);
	}

	// Filter to sizes smaller than original width and smaller then largestScreenSizeX2
	candidates = candidates.filter(smallerThanOriginal).filter((w) => w <= largestScreenSize);

	// Remove duplicates and return sorted array
	return [...new Set(candidates)].sort((a, b) => a - b);
};

/**
 * Gets the `sizes` attribute for an image, based on the layout and width
 */
export const getSizesAttribute = ({
	width,
	layout,
}: {
	width?: number;
	layout?: ImageLayout;
}): string | undefined => {
	if (!width || !layout) {
		return undefined;
	}
	switch (layout) {
		// If screen is wider than the max size then image width is the max size,
		// otherwise it's the width of the screen
		case 'constrained':
			return `(min-width: ${width}px) ${width}px, 100vw`;

		// Image is always the same width, whatever the size of the screen
		case 'fixed':
			return `${width}px`;

		// Image is always the width of the screen
		case 'full-width':
			return `100vw`;

		case 'none':
		default:
			return undefined;
	}
};
