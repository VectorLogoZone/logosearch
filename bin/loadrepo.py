#!/usr/bin/env python3
#
# get the list of svg images from a repo
#

import argparse
import datetime
import json
import os
import pathlib
import re
import sh
import shutil
import sys
import tempfile
import time
import yaml

default_branch = "master"

parser = argparse.ArgumentParser()
parser.add_argument("-q", "--quiet", help="hide status messages", default=True, dest='verbose', action="store_false")
parser.add_argument("--always", help="always process", default=False, dest='always', action="store_true")
parser.add_argument("--branch", help="git branch (default='%s')" % default_branch, action="store", default=default_branch)
parser.add_argument("--cache", help="location of previously downloaded repo", action="store", default="./cache")
parser.add_argument("--input", help="YAML of potential repos", action="store", default="data/repos.yaml")
parser.add_argument("--output", help="output directory", action="store", default="./logos")
parser.add_argument("--nocleanup", help="do not erase temporary files", default=True, dest='cleanup', action="store_false")
parser.add_argument('repos', help='repos (all if none specified)', metavar='repos', nargs='*')

args = parser.parse_args()

if args.verbose:
    print("INFO: loadrepo starting at %s" % datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'))

fdata = open(args.input, "r")
rawdata = yaml.load(fdata)
fdata.close()

repolist = {}
for data in rawdata:
    repolist[data['id']] = data
if args.verbose:
    print("INFO: %d repo definitions loaded from %s" % (len(rawdata), args.input))

if len(args.repos) == 0:
    args.repos = repolist.keys()
if args.verbose:
    print("INFO: will process %d repo(s)" % (len(args.repos)))

total = 0
origdir = os.getcwd()
cachedir = os.path.abspath(args.cache)
outputdir = os.path.abspath(args.output)

pathlib.Path(cachedir).mkdir(parents=True, exist_ok=True)
pathlib.Path(outputdir).mkdir(parents=True, exist_ok=True)

for repo_id in args.repos:

    if repo_id not in repolist:
        sys.stdout.write("ERROR: no repository info for id '%s'\n" % (repo_id))
        sys.exit(1)

    repodata = repolist[repo_id]

    sys.stdout.write("OUTPUT: processing %s (%s)\n" % (repo_id, repodata["repo"]))

    gitdir = os.path.join(cachedir, repo_id)
    if args.verbose:
        sys.stdout.write("INFO: git repo directory %s\n" % gitdir)

    giturl = "https://github.com/" + repodata['repo']

    if os.path.isdir(gitdir):
        os.chdir(gitdir)

        cached_commit = sh.git("rev-parse", "HEAD")

        if args.verbose:
            sys.stdout.write("INFO: pulling changes from git repo %s\n" % giturl)
        sh.git.pull("--ff-only", _err_to_out=True, _out=os.path.join(cachedir, "git-" + repo_id + ".stdout"))
        if args.verbose:
            sys.stdout.write("INFO: pull complete\n")

        current_commit = sh.git("rev-parse", "HEAD")
        if cached_commit == current_commit:
            if args.always:
                sys.stdout.write("INFO: no changes to repo since last run but processing anyway\n")
            else:
                sys.stdout.write("INFO: no changes to repo since last run so skipping\n")
                continue
    else:
        if args.verbose:
            sys.stdout.write("INFO: cloning git repo %s\n" % giturl)
        sh.git.clone(giturl, gitdir, _err_to_out=True, _out=os.path.join(cachedir, "git-" + repo_id + ".stdout"))
        if args.verbose:
            sys.stdout.write("INFO: clone complete\n")
        os.chdir(gitdir)

    if args.verbose:
        print("INFO: switching to branch '%s'" % (repodata['branch']))
    sh.git.checkout(repodata['branch'], _err_to_out=True, _out=os.path.join(cachedir, "git-" + repo_id + ".stdout"))

    current_commit = sh.git("rev-parse", "HEAD")

    logodir = os.path.join(gitdir, repodata['directory'])
    if args.verbose:
        print("INFO: copying svgs from %s" % logodir)

    images = []

    pathfix = re.compile(repodata["rename"]) if "rename" in repodata else None

    for srcpath in pathlib.Path(logodir).glob("**/*.svg"):

        shortpath = os.path.join(repo_id, str(srcpath)[len(logodir)+1:] if len(repodata["directory"]) > 0 else str(srcpath)[len(logodir):])

        if pathfix is not None:
            fixdir, fixname = os.path.split(shortpath)
            fixname = pathfix.sub("\\1", fixname)
            shortpath = os.path.join(fixdir, fixname)

        dstpath = os.path.join(outputdir, shortpath)

        #if (pathlib.Path(dstpath).exists()):
        #	continue

        dstdir, dstname = os.path.split(dstpath)

        pathlib.Path(dstdir).mkdir(parents=True, exist_ok=True)
        shutil.copyfile(str(srcpath), dstpath)

        sys.stdout.write("DEBUG: repo %s copy from '%s' to '%s' (%s)\n" % (repo_id, str(srcpath), dstpath, shortpath))

        images.append({
            'name': os.path.splitext(dstname)[0],
            'src': giturl + "/blob/" + repodata['branch'] + str(srcpath)[len(gitdir):],
            'img': shortpath
            })

    print("OUTPUT: %d svg files found for %s (%s)" % (len(images), repo_id, repodata['repo']))
    total += len(images)

    if len(images) == 0:
        continue

    data = {
        'id': repo_id,
        'commit': str(current_commit).strip(),
        'lastmodified': datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'),
        'images': images
    }

    outputpath = os.path.join(outputdir, repo_id + ".json")

    outputfile = open(outputpath, 'w')
    json.dump(data, outputfile, sort_keys=True, indent=2)
    outputfile.close()

os.chdir(origdir)

sys.exit(1);

# WTF?  why isn't there an easy way to unique sort dicts???
data = map(lambda svg: frozenset(svg.items()), data)
data = sorted(set(data), key=lambda svg: dict(svg)['name'])
data = list(map(lambda svg: dict(svg), data))

with open(args.output, 'w') as outfile:
    json.dump(data, outfile, sort_keys=True, indent=2)
    #json.dump(data, outfile, sort_keys=True, indent=2)

if args.verbose:
    print("INFO: loadrepo complete: %d logos found at %s (%d total)" % (total, datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'), len(data)))
