# LogoSear.ch & IconSear.ch [<img alt="IconSearch Logo" src="static/iconsearch/favicon.svg" height="80" align="right" />](https://iconsear.ch/) [<img alt="LogoSearch Logo" src="static/logosearch/favicon.svg" height="80" align="right" />](https://logosear.ch/)

[![# of logos](https://img.shields.io/badge/dynamic/json.svg?label=logos&url=https%3A%2F%2Flogosear.ch%2Fstatus.json&query=%24.imagecount)](https://logosear.ch/)
[![# of logo sources](https://img.shields.io/badge/dynamic/json.svg?label=logo%20sources&url=https%3A%2F%2Flogosear.ch%2Fstatus.json&query=%24.sourcecount)](https://logosear.ch/sources/index.html)
[![LogoSear.ch 30 day uptime](https://img.shields.io/nodeping/uptime/1q4eb7g7-qh9u-4q9p-8tfd-5glw1j16n57n.svg?label=LogoSearch%2030-day%20uptime&style=flat)](https://nodeping.com/reports/checks/1q4eb7g7-qh9u-4q9p-8tfd-5glw1j16n57n)

[![# of icons](https://img.shields.io/badge/dynamic/json.svg?label=icons&url=https%3A%2F%2Ficonsear.ch%2Fstatus.json&query=%24.imagecount)](https://iconsear.ch/)
[![# of icon sources](https://img.shields.io/badge/dynamic/json.svg?label=icon%20sources&url=https%3A%2F%2Ficonsear.ch%2Fstatus.json&query=%24.sourcecount)](https://iconsear.ch/sources/index.html)
[![IconSear.ch 30 day uptime](https://img.shields.io/nodeping/uptime/nfbzxwky-g24l-48wr-842z-kk7ldz1iv881.svg?label=IconSearch%2030-day%20uptime&style=flat)](https://nodeping.com/reports/checks/nfbzxwky-g24l-48wr-842z-kk7ldz1iv881)

This is the source for the [LogoSear.ch](https://logosear.ch/) and [IconSear.ch](https://iconsear.ch/) websites.

## Using

Go to [LogoSear.ch](https://logosear.ch/search.html) or [IconSear.ch](https://iconsear.ch/search.html) and search for something!

Click on an image to go to the original source.  You will need to check the source's license before re-using.

## Contributing

If you want to add another git repository with SVG logos, please submit a github issue on [git-svg-logos](https://github.com/VectorLogoZone/git-svg-logos/issues/new) or [git-svg-icons](https://github.com/VectorLogoZone/git-svg-icons/issues/new) repo.

Code contributions are welcome!  Please follow the standard Github [Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

See the [to do list](TODO.md) for a list of things that are already being planned.

## API

While there is an internal API, it is not meant for public consumption.  It is running on a low-end
server and will fall down if subjected to a serious load.

But feel free to run your own copy...

## Running

It is a fairly standard node.js web app:

```bash
yarn install
yarn start
```

See [config.ts](https://github.com/VectorLogoZone/logosearch/blob/main/src/config.ts) for details about configuring the environment variables.

## License

[GNU Affero General Public License v3.0](LICENSE.txt)

The images are the property of their original owners.

## Credits

[![Bootstrap](https://www.vectorlogo.zone/logos/getbootstrap/getbootstrap-ar21.svg)](https://getbootstrap.com/ "HTML/CSS Framework")
[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "CDN")
[![Font Awesome](https://www.vectorlogo.zone/logos/font-awesome/font-awesome-ar21.svg)](https://fontawesome.com/ "Navbar icons")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting and CI")
[![GoatCounter](https://www.vectorlogo.zone/logos/goatcounter/goatcounter-ar21.svg)](https://www.goatcounter.com/ "Traffic Measurement")
[![Google Cloud Run](https://www.vectorlogo.zone/logos/google_cloud_run/google_cloud_run-ar21.svg)](https://cloud.google.com/run/ "Hosting")
[![Google Noto Emoji](https://www.vectorlogo.zone/logos/google/google-ar21.svg)](https://github.com/googlefonts/noto-emoji/blob/master/svg/emoji_u1f99a.svg "Logo/Favicon")
[![Handlebars](https://www.vectorlogo.zone/logos/handlebarsjs/handlebarsjs-ar21.svg)](https://handlebarsjs.com/ "Templating")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![lunr.js](https://www.vectorlogo.zone/logos/lunrjs/lunrjs-ar21.svg)](https://lunrjs.com/ "Full-text search")
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![Nodemon](https://www.vectorlogo.zone/logos/nodemonio/nodemonio-ar21.svg)](https://nodemon.io/ "Development tool")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![TypeScript](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg)](https://www.typescriptlang.org/ "Programming Language")
[![yarn](https://www.vectorlogo.zone/logos/yarnpkg/yarnpkg-ar21.svg)](https://yarnpkg.com/en/ "JS Package Management")

- [axios](https://github.com/axios/axios)
- [José Solé](https://jmsole.cl/) - Noticia Text font for IconSear.ch
- [Omnibus Type](https://www.omnibus-type.com/fonts/sansita/) - Sansita font for LogoSear.ch
- [jQuery throttle/debounce](http://benalman.com/projects/jquery-throttle-debounce-plugin/)
- [transliteration](https://github.com/dzcpy/transliteration)
