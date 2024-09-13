# utm-tracking

I've consolidated everything regarding UTM in a single file. At this point all you have to do is import it whenever needed.
In the above HTML file (test.html) I have created a short example of how it's used: Essentially, the JS file is imported, the page immediately navigates to a URL containing some UTM params. collectUTMParams triggers, collects the UTM params and stores them in a cookie.

The list of parameters that are going to be collected is present inside utm-tracking/consolidated-utm.js on "collectUTMParams". Edit it as needed.
