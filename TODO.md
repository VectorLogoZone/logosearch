# To Do

- [ ] load sources from remote
- [ ] use cdn URL for logos
- [ ] use icons to make responsive navbar
- [ ] pm2
- [ ] fill out FAQ
- [ ] fix problems with non-ASCII filenames in loadrepos.py (make sure filenames are slugified)
- [ ] cleanup paging in sources/_logos.hbs
- [ ] use window.location.replace() when paging in sources/_logos.hbs
- [ ] switch back to latest lunr (with stopwords disabled)
- [ ] alternatives/_index.hbs
- [ ] contact page (or link to VLZ's?)
- [ ] report of repos w/nothing
- [ ] descriptions of sources
- [ ] remote provider
- [ ] background select
- [ ] init script
- [ ] actual cron job
- [ ] check for moved repos
- [ ] 404: return svg if url has .svg
- [ ] way to automatically add background to white svgs (either during loadrepo or when displaying)

## Longer term

- [ ] font blast for repos with no svgs
- [ ] log storage and viewing

- [ ] hbs local variable for robots
- [ ] separate github user account
- [ ] watches all repos
- [ ] trigger reindex on email receipt
- [ ] forks all repos in case they go away
- [ ] hotlink detection/prevention

## Install on Ubuntu 18.10

```bash
apt-get update
apt-get install nodejs npm python3-pip
pip3 install sh unidecode
mkdir /app
cd /app
git clone https://github.com/AwesomeLogos/awesome-logos.git
cd awesome-logos
npm install -g yarn
yarn install
./node_modules/.bin/tsc
bin/loadrepo.py
node_modules/.bin/pm2 start dist/server.js --name awesomelogos -i max
pm2 startup --service-name awesomelogos
```

## Tips

- Github's [search by filename](https://help.github.com/articles/searching-code/#search-by-filename) is a good way to find logos (and then repos) with logos

- https://github.com/luoye-fe/sublime-icon/

https://github.com/qseksolutions/coinlistadmin/tree/9a4fd00bc16e9864837fd1b23131d8adc11aab2f/src/assets/currency-svg
https://github.com/nshanthappa/azure-pipelines/tree/ab1b8766492d184397edf634774e2496ff6ce066/templates/icons/svg