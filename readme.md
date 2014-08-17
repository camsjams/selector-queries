## Selector Queries [forked from Selector queries](https://github.com/ahume/selector-queries)

Much like the official [Selector queries](https://github.com/ahume/selector-queries), this tiny JavaScript library allows you to apply CSS media query logic to a container, allowing for an easier method to target containers of reusable modules for your styles.

The main addition is the ability to do a compound selector, allowing you to apply custom classes to containers when they are at a width that is between two points.

	min-width:600px=large - when this element's width is greater than 600px, apply class 'large'
	max-width:10em=small - when this element's width is less than 10em, apply class 'small'
	between:400px,600px=medium  - when this element's width is greater than 400px less than 600px, apply class 'medium'

## Description
This script allows you to apply different class values to an HTML element based on its width. Use it as follows:

    <div data-squery="min-width:600px=large max-width:10em=small between:400px,600px=medium">
        <p>Content here</p>
    </div>
    
This will apply a class of 'large' when the element is wider than 600 pixels and a class of 'small' when it is narrower than 10 ems. It works in all modern browsers back to and including IE6.

## Status
Production - Version 1.0.1

## Platforms / Technologies
* [JavaScript](http://en.wikipedia.org/wiki/JavaScript)