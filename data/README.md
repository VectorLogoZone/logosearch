# Data Files

## repos.yaml

The list of git repositories to search.
  
Each entry should have
 * `id` - id of this repo.  Normally the owner or repository name.  Must be unique.  Will be used as the directory (among other things)
 * `repo` - github repository (LATER: any git url)
 * `branch` - which branch contains the logos
 * `directory` - which subdirectory contains the logos
 * LATER: `rename` - regex to use to rename the files (since file names are the basis for searching)
 
 
## /logos/<repo_id>.json

 * `id` - id of this repo
 * `commit` - current commit
 * `lastmodified` - date last updated
 * `images` - array of image metadata objects

Each image metadata object consists of:
 * `name` - name of the project/company (from the file name, so not especially accurate)
 * `img` - local url to use to display
 * `src` - url of logo in the repository (for hyperlinking)