import shutil
import os
import cache
import zipfile as zipper

def compile(paths, mkPaths, cachedObjs, cbd):
    for mkPath in mkPaths:
        if not os.path.isdir(mkPath): os.mkdir(cbd+'/compiling/'+mkPath)

    for cachedObj in cachedObjs:
        if not os.path.isfile(cbd+'/compiling/'+cachedObj.compiled): shutil.copy(cbd+'/cache'+cachedObj.file, cbd+'/compiling/'+cachedObj.compiled)

    for path in paths:
        if os.path.isdir(cbd+'/../'+path):
            if not os.path.isdir(cbd+'/compiling/'+path): shutil.copytree(cbd+'/../'+path, cbd+'/compiling/'+path)
        elif os.path.isfile(cbd+'/../'+path):
            if not os.path.isfile(cbd+'/compiling/'+path): shutil.copy(cbd+'/../'+path, cbd+'/compiling/'+path)

    zipfile = zipper.ZipFile(cbd+'/compiled/discord-russian-roulette.zip', mode='w', compression=zipper.ZIP_DEFLATED, compresslevel=9)
    _compileDir(cbd+'/compiling', '', zipfile)
        

def _compileDir(dir, parent, zip):
    compiling = os.scandir(dir)
    for cpath in compiling:
        if cpath.is_dir:
            _compileDir(dir+cpath.name, parent+cpath.name+'/', zip)
        elif cpath.is_file:
            zip.write(dir+cpath.name, arcname=parent+cpath.name)
