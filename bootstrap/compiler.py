import shutil
import os
import zipfile as zipper

def compile(paths, mkPaths, cachedObjs, cbd):
    print("Creating all necessary paths...")
    for mkPath in mkPaths:
        if not os.path.isdir(cbd+'/compiling/' + mkPath): os.mkdir(cbd+'/compiling/'+mkPath)

    print("Copying all cached objects...")
    for cachedObj in cachedObjs:
        if not os.path.isfile(cbd+'/compiling/'+cachedObj.compiled): shutil.copy(cbd+'/cache/'+cachedObj.file, cbd+'/compiling/'+cachedObj.compiled)

    print("Copying all compile paths...")
    for path in paths:
        if os.path.isdir(cbd+'/../'+path):
            if not os.path.isdir(cbd+'/compiling/'+path): shutil.copytree(cbd+'/../'+path, cbd+'/compiling/'+path)
        elif os.path.isfile(cbd+'/../'+path):
            if not os.path.isfile(cbd+'/compiling/'+path): shutil.copy(cbd+'/../'+path, cbd+'/compiling/'+path)

    print("Starting zipper...")
    zipfile = zipper.ZipFile(cbd+'/compiled/discord-russian-roulette.zip', mode='w', compression=zipper.ZIP_DEFLATED, compresslevel=9)
    _compileDir(cbd+'/compiling/', '', zipfile)
    zipfile.close()
        

def _compileDir(dir, parent, zip):
    compiling = os.scandir(dir)
    for cpath in compiling:
        if cpath.is_file():
            print("Zipping file with path: "+dir+cpath.name)
            zip.write(dir+cpath.name, arcname=parent+cpath.name)
        elif cpath.is_dir():
            print("Zipping directory with path: "+dir+cpath.name)
            _compileDir(dir+cpath.name+"/", parent+cpath.name+'/', zip)
