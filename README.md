
# Github Logo Search [<img alt="VectorLogoZone Logo" src="https://metamaker.vectorlogo.zone/favicon.svg" height="90" align="right" />](https://www.vectorlogo.zone/search-github.html)

This is the backend for [VectorLogoZone's Github Logo Search](https://www.vectorlogo.zone/search-github.html).

## Running

There are two main parts: 

 1. A cron job, written in Python.  This code is in `/bin`.
 2. An API web server, written in TypeScript/node.js.  This code is in `/src`.

The repositories are stored locally in the `/cache` directory.

The logos are extracted and stored in the `/logos` directory.

The cron job is responsible for updating these two directories.

## Contributing

If you want to add a repo, please submit a [github issue](https://github.com/VectorLogoZone/github-logo-search/issues/new)

Code contributions are also welcome!  Please follow the standard Github [Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962)

See the [to do list](TODO.md) for a list of things that are planned.

## License

[GNU Affero General Public License v3.0](LICENSE.txt)

## Credits

[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "CDN")
[![Digital Ocean](https://www.vectorlogo.zone/logos/digitalocean/digitalocean-ar21.svg)](https://www.digitalocean.com/ "Hosting")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting")
[![Google Analytics](https://www.vectorlogo.zone/logos/google_analytics/google_analytics-ar21.svg)](https://www.google.com/analytics "Traffic Measurement")
[![Handlebars](https://www.vectorlogo.zone/logos/handlebarsjs/handlebarsjs-ar21.svg)](http://handlebarsjs.com/ "Templating")
[![JavaScript](https://www.vectorlogo.zone/logos/javascript/javascript-ar21.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript "Programming Language")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![lunr.js](https://www.vectorlogo.zone/logos/lunrjs/lunrjs-ar21.svg)](https://lunrjs.com/ "Full-text search")
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![npm](https://www.vectorlogo.zone/logos/npmjs/npmjs-ar21.svg)](https://www.npmjs.com/ "JS Package Management")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![Shoelace CSS](https://www.vectorlogo.zone/logos/shoelacestyle/shoelacestyle-ar21.svg)](https://shoelace.style/ "CSS")

