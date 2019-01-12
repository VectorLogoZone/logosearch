# To Do

 - [ ] API similar to api.vlz
 - [ ] paging in sources/_logos.hbs
 - [ ] switch back to latest lunr (with stopwords disabled)
 - [ ] report of repos w/nothing
 - [ ] descriptions of sources
 - [ ] alternative logo search websites
 - [ ] background select
 - [ ] init script
 - [ ] cron job
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
