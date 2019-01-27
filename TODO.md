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
 
## Longer term

 - [ ] font blast for repos with no svgs
 - [ ] log storage and viewing

 - [ ] separate github user account
 - [ ] watches all repos
 - [ ] trigger reindex on email receipt
 - [ ] forks all repos in case they go away
 - [ ] hotlink detection/prevention
 
 
## Install on Ubuntu

 * apt-get install git nodejs npm python3-pip
 * pip3 install sh
 * mkdir /app
 * chdir /app
 * git clone https://github.com/VectorLogoZone/vlz-search.git
 * npm install
 * ./node_modules/.bin/tsc
