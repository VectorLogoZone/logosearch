# To Do

- [ ] debounce
- [ ] meta description in /search.html
- [ ] process.on() trapping and logging
- [ ] server-side tracking of hits to search.json
- [ ] parallel loading of indices
- [ ] endpoint for json schema
- [ ] test page for json schema
- [ ] server-side search directly in search.html (maybe?)
- [ ] exact matches first in search results

## Signing URLs

At this point, not worth it, since only gitlab doesn't allow hotlinking.

- [ ] add key_id to sourceData
- [ ] config.ts: map of key_id to key_secret
- [ ] sign URLs if key_id in sourceData

## How to serve images on Gitlab

I couldn't find a way to hotlink images on Gitlab, so they are being cached.

An alternative to caching for gitlab would be to use a proxy.  The gitlab API has access to the content, but pops a download dialog (`content-disposition: attachment') [docs](https://docs.gitlab.com/ee/api/repository_files.html#get-raw-file-from-repository), [example-API](https://gitlab.com/api/v4/projects/celebdor%2Fdesign/repository/files/logos%2FSamsung.svg/raw?ref=master), [example-direct](https://gitlab.com/celebdor/design/raw/master/logos/Samsung.svg).  In theory the blob API should (work)[https://gitlab.com/gitlab-org/gitlab-foss/-/issues/55882], but it did not work in [my testing](https://gitlab.com/api/v4/projects/celebdor%2Fdesign/repository/blobs/68e68b6f5f192dba625337323526f9a8f4cb8c30/raw)

## Content

- [ ] fill out FAQ
- [ ] tags for sources (country, black/white/blue/color, hexagonal/circle/square, etc)
- [ ] cleanup paging in sources/_logos.hbs
- [ ] use window.location.replace() when paging in sources/_logos.hbs
- [ ] switch back to latest lunr (with stopwords disabled)
- [ ] alternatives/_index.hbs
- [ ] alternatives/index.hbs: remember search value when leaving then returing
- [ ] contact page (or link to VLZ's?)

## Longer term

- [ ] hbs local variable for robots

