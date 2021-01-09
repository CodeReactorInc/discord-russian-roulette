import os
import shutil

def mkenv(cwd):
    if not os.path.isdir(cwd+"/build"): os.mkdir(cwd+"/build")
    if not os.path.isdir(cwd+"/build/cache"): os.mkdir(cwd+"/build/cache")
    if not os.path.isdir(cwd+"/build/compiling"): os.mkdir(cwd+"/build/compiling")
    if not os.path.isdir(cwd+"/build/compiled"): os.mkdir(cwd+"/build/compiled")
    return cwd+"/build"

def rmenv(ccd):
    if os.path.isdir(ccd): shutil.rmtree(ccd)

def rmnpm(cwd):
    if os.path.isdir(cwd+"/node_modules"): shutil.rmtree(cwd+"/node_modules")
    if os.path.isfile(cwd+"/package-lock.json"): os.remove(cwd+"/package-lock.json")

def inpm(cwd):
    os.execv('npm', ['install'])