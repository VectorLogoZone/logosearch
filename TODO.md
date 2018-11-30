# To Do

 - [ ] loadrepo.py
 - [ ] /logos/*
 - [ ] /api/search.json
 - [ ] cron job
 - [ ] router.param()
 - [x] /repo/:repo/index.html
 - [ ] /repo/:repo/clone
 - [ ] /repo/:repo/pull
 - [ ] /repo/:repo/link (with option to delete current)
 - [ ] /repo/:repo/list.html
 - [ ] /repo/:repo/purge
 - [ ] /repo/:repo/clone
 - [x] 404 page
 - [x] 500 page
 - [x] logging
 - [ ] flash messages
 - [x] h1 override
 - [ ] reuse repo for icon search
 - [ ] fancier logging
 - [ ] check for moved repos
 - [ ] font-blast support
 - [ ] /data/README.md
 - [ ] /404.html/json/svg
 
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