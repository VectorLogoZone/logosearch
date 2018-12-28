# To Do

 - [ ] favicon to use tile
 - [ ] about page: no hotlinking, check parent for license
 - [ ] init script
 - [ ] cron job
 - [ ] check for moved repos
 - [ ] 404: return svg if url has .svg
 
## Data structure

File are located in `/logos/<repoid>/data.json`

 * commit
 * created_at
 * updated_at
 * [logos]
 
## Longer term

 - [ ] font blast for repos with no svgs
 - [ ] log storage and viewing

 - [ ] separate github user account
 - [ ] watches all repos
 - [ ] trigger reindex on email receipt
 - [ ] forks all repos in case they go away
 
 
## Install on Ubuntu

 * apt-get install git nodejs npm python3-pip
 * mkdir /app
 * chdir /app
 * git clone https://github.com/VectorLogoZone/vlz-search.git
 * ./node_modules/.bin/tsc
 * pip3 install sh