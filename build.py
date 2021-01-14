
import os
import sys
import bootstrap
import json
import argparse

parser = argparse.ArgumentParser(description="Build Russian Roulette bundling all dependencies and NodeJS on a zip", add_help=False)
parser.add_argument("task", default='help', choices=['help', 'clean-build', 'clean', 'build'], help='Define what builder gonna do now')

args = parser.parse_args()

if args.task == "help":
    parser.print_help()
elif args.task == "clean":
    building_dir = os.path.dirname(os.path.realpath(__file__))

    print("Removing NPM data...")
    bootstrap.rmnpm(building_dir)

    print("Removing Build data...")
    bootstrap.rmenv(building_dir + "/build")
elif args.task == "clean-build":
    building_dir = os.path.dirname(os.path.realpath(__file__))

    print("Removing Build data...")
    bootstrap.rmenv(building_dir + "/build")
elif args.task == "build":
    building_dir = os.path.dirname(os.path.realpath(__file__))

    build_script_path = building_dir + "/build.json"

    print("Reading build.json...")
    with open(build_script_path) as file:
        build_script_content = file.read()

    build_script = json.loads(build_script_content)

    print("Installing npm dependencies...")
    bootstrap.inpm(building_dir)

    print("Creating env...")
    build_path = bootstrap.mkenv(building_dir)

    print("Creating cache...")
    cache = bootstrap.Cache(build_path)
    cachedObj = []

    print("Downloading runtime and extra content...")
    for obj in build_script["download"]:
        print("Creating a CacheObj for file " + obj["file"])

        cacheObj = bootstrap.CacheObject(obj["url"], obj["file"], obj["compiled"])
        cachedObj.append(cacheObj)
        cache.download(cacheObj)

    print("Starting compiler...")
    bootstrap.compile(build_script["compile"], build_script["mkdir"], cachedObj, build_path)

    print("Project compiled, see in build path for the result")
