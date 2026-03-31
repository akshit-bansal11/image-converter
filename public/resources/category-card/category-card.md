# Design System Specification: The Nocturnal Editorial

## 1. Overview & Creative North Star

**Creative North Star: "The Obsidian Monolith"**

This design system is built on the philosophy of tactile depth and editorial authority. It moves away from the "flat" web by treating the screen as a physical space carved from dark, premium materials. We reject the generic "card-on-background" template in favor of an integrated, multi-tonal architectural approach.

The system utilizes a **"Split-Layer" structural logic**. Instead of floating components, we use nested surfaces and tonal shifts to guide the eye. By combining bold, high-contrast typography with soft, neumorphic depth, we create an experience that feels both technologically advanced and classically premium.

---

## 2. Colors & Surface Logic

The palette is rooted in deep charcoals and muted silvers, using the Material Design convention to manage functional hierarchy.

### The "No-Line" Rule

Traditional 1px solid borders are strictly prohibited for sectioning. Structural separation must be achieved through:

1. **Tonal Shifts:** Placing a `surface-container-low` (#131313) component against a `background` (#0e0e0e) floor.
2. **Inner Shadows:** Using subtle `0.5` or `1` spacing scale offsets with low-opacity `on-surface` tints to "etch" areas into the interface.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. 

* **Base Floor:** `background` (#0e0e0e).
* **Primary Containers:** `surface-container` (#191a1a).
* **Elevated Elements:** `surface-bright` (#2c2c2c) for high-interaction areas.

### The "Glass & Gradient" Rule

To add "soul" to the dark theme, main CTAs and Hero sections should utilize a subtle linear gradient from `primary` (#c6c6c6) to `primary-container` (#454747) at a 135-degree angle. Floating overlays (Tooltips/Modals) must use `surface-container-high` at 80% opacity with a `20px` backdrop blur to create a premium "frosted obsidian" effect.

---

## 3. Typography

Our typography pairing balances the technical precision of **Manrope** with the editorial character of **Plus Jakarta Sans**.

* **Display & Headlines (Plus Jakarta Sans):** These are the "anchors." Use `display-lg` for category entries (e.g., "AUDIO"). Set with a `-2%` letter spacing and `bold` weight to create a high-contrast, high-end magazine feel.
* **Titles & Body (Manrope):** Manrope provides exceptional legibility in dark environments. Use `body-lg` (1rem) for primary descriptions to ensure the light text doesn't "bloom" or vibrate against the dark background.
* **Labeling:** Use `label-md` in `on-surface-variant` (#acabaa) for metadata, ensuring a clear distinction between content and secondary information.

---

## 4. Elevation & Depth

### The Layering Principle

Depth is achieved by stacking. A "Split Card" follows this logic:

* **Top Layer (Header):** `surface-container-high` (#1f2020).
* **Bottom Layer (Content):** `surface-container` (#191a1a).
* **The Seamless Join:** The two layers meet with `none` (0px) border-radius at the junction, while the outer corners use `lg` (2rem). This creates a single, monolithic unit with two distinct functional zones.

### Ambient Shadows & Neumorphism

For floating elements, avoid pure black shadows.

* **Shadow Color:** Use a 6% opacity of `on-surface` (#e7e5e4).
* **Shadow Specs:** `0px 20px 40px` blur.
* **Inner Glow:** To achieve the "Neumorphic" look, apply a 1px inner shadow on the top-left edge of cards using `outline-variant` (#484848) at 15% opacity.

### The "Ghost Border" Fallback

If a boundary is required for accessibility, use a "Ghost Border": `outline-variant` (#484848) at 20% opacity. Never use 100% opacity.

---

## 5. Components

### Split Cards

* **Structure:** Two vertically stacked divs. 
* **Top Half:** Darker tone, `xl` (3rem) padding, holds the category `headline-sm`.
* **Bottom Half:** Slightly lighter tone, `xl` padding, holds `body-md` content.
* **Radii:** Top div (`lg`, `lg`, `none`, `none`); Bottom div (`none`, `none`, `lg`, `lg`).

### Pill Buttons

* **Shape:** `full` (9999px) roundedness.
* **Primary:** Background `primary` (#c6c6c6), text `on-primary` (#3f4041). 
* **Interaction:** On hover, apply a `primary_dim` glow (8px blur) and scale to 102%.
* **Secondary:** Ghost style. Transparent background, `outline-variant` border at 30% opacity.

### Selection Chips

* **Style:** Minimalist. Background `surface-container-highest` (#252626). 
* **Padding:** `2` (0.7rem) vertical, `4` (1.4rem) horizontal.
* **Shape:** `full`.
* **Visuals:** Include a small 16px icon/avatar leading the text.

### Input Fields

* **Surface:** `surface-container-lowest` (#000000) to create an "etched" look.
* **Focus State:** Shift border from `outline-variant` to `primary` at 40% opacity with a soft `primary_container` inner glow.

---

## 6. Do's and Don'ts

### Do:

* **Use Asymmetry:** Place high-contrast headlines off-center to create editorial tension.
* **Embrace Negative Space:** Use spacing scale `12` (4rem) and `16` (5.5rem) between major sections to let the premium materials "breathe."
* **Leverage Tonal Contrast:** Ensure "Audio" headers are significantly bolder than the body copy to maintain the editorial hierarchy.

### Don't:

* **No Divider Lines:** Never use a horizontal rule `<hr>` to separate list items. Use spacing (`3` or `4`) or a background shift to `surface-container-low`.
* **No Pure White:** Never use `#ffffff` for text. Use `on-surface` (#e7e5e4) to prevent eye strain and maintain the "charcoal" aesthetic.
* **No Sharp Corners:** Avoid `none` or `sm` radii on primary containers. The system should feel smooth and machined, not jagged.