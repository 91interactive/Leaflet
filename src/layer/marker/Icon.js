import {Class} from '../../core/Class';
import {setOptions} from '../../core/Util';
import {toPoint as point} from '../../geometry/Point';
import Browser from '../../core/Browser';

/*
 * @class Icon
 * @aka L.Icon
 *
 * Represents an icon to provide when creating a marker.
 *
 * @example
 *
 * ```js
 * var myIcon = L.icon({
 *     iconUrl: 'my-icon.png',
 *     iconRetinaUrl: 'my-icon@2x.png',
 *     iconSize: [38, 95],
 *     iconAnchor: [22, 94],
 *     popupAnchor: [-3, -76],
 *     shadowUrl: 'my-icon-shadow.png',
 *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
 *     shadowSize: [68, 95],
 *     shadowAnchor: [22, 94]
 * });
 *
 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
 * ```
 *
 * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
 *
 */

export const Icon = Class.extend({

	/* @section
	 * @aka Icon options
	 *
	 * @option iconUrl: String = null
	 * **(required)** The URL to the icon image (absolute or relative to your script path).
	 *
	 * @option iconRetinaUrl: String = null
	 * The URL to a retina sized version of the icon image (absolute or relative to your
	 * script path). Used for Retina screen devices.
	 *
	 * @option iconSize: Point = null
	 * Size of the icon image in pixels.
	 *
	 * @option iconAnchor: Point = null
	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
	 * will be aligned so that this point is at the marker's geographical location. Centered
	 * by default if size is specified, also can be set in CSS with negative margins.
	 *
	 * @option popupAnchor: Point = [0, 0]
	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
	 *
	 * @option tooltipAnchor: Point = [0, 0]
	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
	 *
	 * @option shadowUrl: String = null
	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
	 *
	 * @option shadowRetinaUrl: String = null
	 *
	 * @option shadowSize: Point = null
	 * Size of the shadow image in pixels.
	 *
	 * @option shadowAnchor: Point = null
	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
	 * as iconAnchor if not specified).
	 *
	 * @option className: String = ''
	 * A custom class name to assign to both icon and shadow images. Empty by default.
	 */

	options: {
		popupAnchor: [0, 0],
		tooltipAnchor: [0, 0],

		// @option crossOrigin: Boolean|String = false
		// Whether the crossOrigin attribute will be added to the tiles.
		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
		crossOrigin: false
	},

	initialize(options) {
		setOptions(this, options);
	},

	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
	// Called internally when the icon has to be shown, returns a `<img>` HTML element
	// styled according to the options.
	createIcon(oldIcon) {
		return this._createIcon(oldIcon);
	},

	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
	// As `createIcon`, but for the shadow beneath it.
	createShadow(oldIcon) {
		const src = this._getIconUrl('shadow');

		if (!src) {
			return null;
		}

		const img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
		this._setIconStyles(img, 'shadow');

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		return img;
	},

	_createIcon(oldIcon) {
		const iconSrc = this._getIconUrl('icon');
		const markerSrc = this._getIconUrl('marker');

		if (!markerSrc || !iconSrc) {
			throw new Error('iconUrl or markerUrl not set in Icon options (see the docs).');
		}

		const img = this._createWrapper(markerSrc, iconSrc, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
		this._setIconStyles(img, 'icon');

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		return img;
	},

	_setIconStyles(img, name) {
		const options = this.options;
		let sizeOption = options[`${name}Size`];

		if (typeof sizeOption === 'number') {
			sizeOption = [sizeOption, sizeOption];
		}

		const size = point(sizeOption),
		    anchor = point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
		            size && size.divideBy(2, true));

		img.className = `leaflet-marker-${name} ${options.className || ''}`;

		if (anchor) {
			img.style.marginLeft = `${-anchor.x}px`;
			img.style.marginTop  = `${-anchor.y}px`;
		}

		if (size) {
			img.style.width  = `${size.x}px`;
			img.style.height = `${size.y}px`;
		}
	},

	_createWrapper(src, src2, el) {
		if (!el) {
			el = document.createElement('div');
			const c1 = document.createElement('img');
			const c2 = document.createElement('img');
			c1.style.position = 'absolute';
			c2.style.position = 'absolute';

			c1.style.transform = `translate(${this.options.markerOffset[0]}px, ${this.options.markerOffset[1]}px)`;
			c1.style.width = `${this.options.markerSize[0]}px`;
			c1.style.height = `${this.options.markerSize[1]}px`;

			c2.style.objectFit = 'cover';
			c2.style.transform = `translate(${this.options.iconOffset[0]}px, ${this.options.iconOffset[1]}px)`;
			c2.style.width = `${this.options.iconSize[0]}px`;
			c2.style.height = `${this.options.iconSize[1]}px`;

			el.appendChild(c1);
			el.appendChild(c2);
		}

		el.children[0].src = src;
		el.children[1].src = src2;
		el.children[0].title = this.options.tooltip;
		el.children[1].title = this.options.tooltip;
		return el;
	},

	_createImg(src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl(name) {
		return Browser.retina && this.options[`${name}RetinaUrl`] || this.options[`${name}Url`];
	}
});


// @factory L.icon(options: Icon options)
// Creates an icon instance with the given options.
export function icon(options) {
	return new Icon(options);
}
