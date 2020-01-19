
# Awesome Logos [<img alt="AwesomeLogos Logo" src="static/images/logo.svg" height="80" align="right" />](https://www.awesomelogos.org/)

[![# of sources](https://img.shields.io/badge/dynamic/json.svg?label=sources&url=https%3A%2F%2Fwww.awesomelogos.org%2Fstatus.json&query=%24.sourcecount)](https://www.awesomelogos.org/sources/index.html)
[![# of logos](https://img.shields.io/badge/dynamic/json.svg?label=logos&url=https%3A%2F%2Fwww.awesomelogos.org%2Fstatus.json&query=%24.imagecount)](https://www.awesomelogos.org/)
[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![30 day uptime](https://img.shields.io/nodeping/uptime/1q4eb7g7-qh9u-4q9p-8tfd-5glw1j16n57n.svg?label=30-day%20uptime&style=flat)](https://nodeping.com/reports/checks/1q4eb7g7-qh9u-4q9p-8tfd-5glw1j16n57n)

This is the source (including the data) for the [Awesome Logos](https://www.awesomelogos.org/) website.

## Criteria

In order to be truly awesome, a logo website has to:

* have SVG logos
* that look good
* that I can index
* and you are allowed to use (and for more than just “inspiration”!)
* without being bombarded with advertising

## The List

Enough reading already!  Just show me the list for crying out loud!

[Voilà](https://www.awesomelogos.org/sources/index.html) (and the [raw data](https://github.com/AwesomeLogos/awesome-logos/blob/master/data/sources.yaml)).

## Using

Go to [www.AwesomeLogos.org](https://www.awesomelogos.org/) and search for something!

Click on a logo to go to the source.  You will need to check the source's license before re-using.

No hot-linking.

## Contributing

If you want to add a repo, please submit a [github issue](https://github.com/AwesomeLogos/awesome-logos/issues/new)

Code contributions are also welcome!  Please follow the standard Github [Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962)

See the [to do list](TODO.md) for a list of things that are planned.

## API

While there is an internal API, it is not meant for public consumption.  It is running on a low-end
server and will fall down if subjected to a serious load.

But feel free to run your own copy...

## Running

There are two main parts:

 1. Various cron jobs that update the search data.  This code is in `./bin`.  Currently the only one is a git repo loader.
 2. A web server, written in TypeScript/node.js.  This code is in `./src`.

The search data is stored in the `./logos` directory.  It consists of a directory for each
logo source, with a `sourceData.json` and optionally a local copy of the logos.

The cron job gets public git repos (and stores them in the `./cache` directory) and copies the svgs to `./logos`.

Note: if you want to run this in a container, make sure the `./cache` and `./logos` directories are using persistent storage.  You do not want
to run the cron job every time a container starts.

## License

* The logos are the property of their original owners.
* The list of logo sources [CC0](LICENSE-list.txt)
* The source code for the website is [GNU Affero General Public License v3.0](LICENSE-code.txt)

## Credits

[![Bootstrap](https://www.vectorlogo.zone/logos/getbootstrap/getbootstrap-ar21.svg)](http://getbootstrap.com/ "HTML/CSS Framework")
[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "CDN")
[![Digital Ocean](https://www.vectorlogo.zone/logos/digitalocean/digitalocean-ar21.svg)](https://www.digitalocean.com/ "Hosting")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting")
[![Google Analytics](https://www.vectorlogo.zone/logos/google_analytics/google_analytics-ar21.svg)](https://www.google.com/analytics "Traffic Measurement")
[![Handlebars](https://www.vectorlogo.zone/logos/handlebarsjs/handlebarsjs-ar21.svg)](http://handlebarsjs.com/ "Templating")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![lunr.js](https://www.vectorlogo.zone/logos/lunrjs/lunrjs-ar21.svg)](https://lunrjs.com/ "Full-text search")
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![pm2](https://www.vectorlogo.zone/logos/pm2io/pm2io-ar21.svg)](https://pm2.io/ "NodeJS process management")
[![Python](https://www.vectorlogo.zone/logos/python/python-ar21.svg)](https://www.python.org/ "data load script")
[![TypeScript](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg)](https://www.typescriptlang.org/ "Programming Language")
[![Ubuntu](https://www.vectorlogo.zone/logos/ubuntu/ubuntu-ar21.svg)](https://ubuntu.com/ "Server OS")
[![yarn](https://www.vectorlogo.zone/logos/yarnpkg/yarnpkg-ar21.svg)](https://yarnpkg.com/en/ "JS Package Management")
