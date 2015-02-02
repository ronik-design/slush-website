### Stylus
For more detailed documentation on Stylus, check out
http://learnboost.github.io/stylus/

### BEM
Name all elements using BEM notation when possible, as shown here.
For more information about BEM notation, visit
http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/


```stylus
/**************************************
Example of a fully fleshed-out Stylus rule using Ronik writing style
**************************************/

/**
 * For clarity, consistency and for some CSS inheritance issues, avoid defining
 * the element type (e.g. p, h1, span) in the CSS selector when possible
 */
.example-selector__element--modifier
    /**
     * Define all extends first, and separate them from regular styles
     * with a carriage return
     */
    @extend $cf
    @extend $copy

    /**
     * Braces and semicolons are no longer necessary, but colons still
     * provide needed structure to prevent some small errors with Stylus
     *
     * Group style declarations in chunks of related properties, rather than
     * alphabetically
     */
    color: gray['base']
    /**
     * For greater ease of responsive development, avoid defining pixel units
     * whenever possible. Instead, use REMs to define static sizes, widths, etc.
     *
     * As currently set up, 1rem = 10px at desktop size
     *
     * Additionally, do not use shorthand properties (e.g. font, background, etc.)
     * whenever possible. They're easier to overwrite, harder to edit, and harder
     * to parse visually at a glance
     */
    font-size: 1.4rem
    font-weight: weights['medium']
    /**
     * Only personal preference for its neatness, but I use decimals for
     * line-heights (1.2 == 120%)
     *
     * For greater ease of responsive development, do not define static
     * line-heights (i.e. 2rem, 30px) unless for a specialized reason
     */
    line-height: 1.2
    text-decoration: none
    display: block
    position: relative
    /**
     * For greater clarity, always provide a leading 0 for <1 decimals
     */
    top: 0.2rem
    /* Group fallbacks together in order from most compatible to most desirable */
    width: 80%
    width: 80vw
    max-width: 80rem
    /**
     * For every element with an applied transition or animation, give a
     * will-change declaration with the relevant properties
     */
    will-change: color, top
    /**
     * More pre-built easing functions can be found at http://easings.net.
     * The one shown here for top is easeInOutSine.
     */
    transition: color 0.15s ease-in, top 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95)
    cursor: pointer
    z-index: z(layers, content)

    /**
     * After all base styles for the element have been defined, add declarations for
     * for :before and :after pseudo-elements, if applicable
     */
    &:before
        content: ''
        display: block
        position: absolute
        top: 0
        left: -2rem
        background-color: gray['xlight']

        /**
         *  After optional pseudo-elements, add state pseudo-classes for the element
         */
        &:hover
            color: gray['xxdark']
            top: 0

        /**
         * Define any modification classes if necessary
         */
        &.is-selected
            /* Borders are one place I'll often keep regular pixel values - especially at 1px -
             * valuing sharpness above true responsiveness
             */
            border: 1px solid rgba(255,0,0, 0.6);
            /* Use margin/padding shorthand when applicable */
            padding: 1rem 2rem

        /**
         * Finally, define styles for any relevant nested elements. Try and avoid this
         * for regular use, and try to never nest more than one layer deep if possible.
         *
         * This can be very useful/clear for situations such as ul/lis, spans inside
         * paragraph elements, specifying changes to child elements of modified parents, etc.
         */
        .example-selector__child-element
            color: rgb(0,255,0)
            font-size: 1rem
            display: inline
            position: relative
            top: -0.2rem
```