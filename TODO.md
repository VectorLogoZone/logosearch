# To Do

 - [ ] fill out FAQ
 - [ ] cleanup paging in sources/_logos.hbs
 - [ ] sitemap.xml
 - [ ] use window.location.replace() in sources/_logos.hbs
 - [ ] alternatives/index.hbs - input box for preloading search links
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

 - [ ] separate github user account
 - [ ] watches all repos
 - [ ] trigger reindex on email receipt
 - [ ] forks all repos in case they go away
 - [ ] hotlink detection/prevention
 
 
## Install on Ubuntu 18.10

 * apt-get update
 * apt-get install nodejs npm python3-pip
 * pip3 install sh unidecode
 * mkdir /app
 * cd /app
 * git clone https://github.com/VectorLogoZone/awesome-logos.git
 * cd awesome-logos
 * npm install
 * ./node_modules/.bin/tsc
 * bin/loadrepo.py


## Tips
 * Github's [search by filename](https://help.github.com/articles/searching-code/#search-by-filename) is a good way to find logos (and then repos) with logos


 * https://github.com/luoye-fe/sublime-icon/