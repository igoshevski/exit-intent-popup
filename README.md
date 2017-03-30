exit-intent-popup
=================

# Features

* Fully customizable via HTML and CSS.
* Can use third party forms to collect emails.
* Support for embeddable CSS fonts, including Google Fonts.
* Cookie support with optional expiry date.
* Set a timed delay before the script starts tracking exit intent.
* Display popup based on exit intent or timed delay.
* Scales to adjust to window size.

# Usage

Simply include the script and call its `init` function with any options you choose.  You must add in your own HTML otherwise the popup will be blank.

```html
<script type="text/javascript" src="bioep.min.js"></script>

<script type="text/javascript">
    bioEp.init({
        // Options
    });
</script>
```
# Options

All options must be added to the init function as an object.

Name | Type | Default | Description
-----|------|---------|------------
**html** | string | blank | **Required**. URL to the remote file that contains the HTML. The file can contain CSS as well.
**css** | string | blank | The CSS styles for the popup. CSS can be added through this function or on the page itself.
**fonts** | array | null | An array containing URLs that link to font stylesheets. Google Fonts was the main idea behind this feature.
**delay** | integer| 5 | The time, in seconds, until the popup activates and begins watching for exit intent. If showOnDelay is set to true, this will be the time until the popup shows.
**showOnDelay** | boolean | false | If true, the popup will show after the delay option time. If false, popup will show when a visitor moves their cursor above the document window, showing exit intent.
**cookieExp** | integer | 30 | The number of days to set the cookie for. A cookie is used to track if the popup has already been shown to a specific visitor. If the popup has been shown, it will not show again until the cookie expires. A value of 0 will always show the popup.
**showOncePerSession** | boolean | false | If true, the popup will only show once per browser session. If false and cookieExp is set to 0, the popup will show multiple times in a single browser session.
**onPopup** | function | null | A callback function to be called when the popup is displayed in the browser.
**uid** | string | blank | Unique identifier used to distinguish cookies for multiple instances. Cookies will not work if uid is not set.

# License

MIT license, feel free to use however you wish!

Created by [beeker.io](http://beeker.io/exit-intent-popup-script-tutorial)