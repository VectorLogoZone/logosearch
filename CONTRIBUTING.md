# Contributing

## Adding a git-based source

The list of indexed `git` repositories are in [git-svg-icons](https://github.com/VectorLogoZone/git-svg-icons/tree/main/data).  

Currently repositories on Github and Gitlab are supported.  Support for other git hosts should not be too difficult.

## Adding a non-git source

The main search engine does not know or care about git: it just needs to get a index file in a standard JSON format.

You can see the JSON structure in the code in [src/sources.ts](https://github.com/VectorLogoZone/logosearch/blob/main/src/sources.ts#L13).

Examples of generating an index:

* [git repos](https://github.com/VectorLogoZone/git-svg-icons/blob/main/bin/loadrepo.py#L234) (in Python)
* [VectorLogoZone](https://github.com/VectorLogoZone/vectorlogozone/blob/main/www/util/searchData.json) (in Jekyll)
* [Wikipedia](https://github.com/VectorLogoZone/wikipedia-svg-logos/blob/main/mediatitles.sh) (in bash using jq)
