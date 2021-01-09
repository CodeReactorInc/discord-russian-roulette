import urllib
import os

class Cache:
    def __init__(self, cbd):
        self._dir = cbd

    def download(self, cacheObj):
        cachedir = self._dir + "/cache"
        if os.path.isfile(cachedir+"/"+cacheObj.file): return
        host = urllib.request.urlopen(cacheObj.url)
        file = open(cachedir+"/"+cacheObj.file, 'wb')
        print("Download "+file+" with size: "+host.getheader('content-length'))
        dlsize = 0
        while True:
            buff = host.read(8192)
            if not buff: break
            dlsize += len(buff)
            print("Downloading "+file+" ("+dlsize+"/"+host.getheader('content-length')+")")
            file.write(buff)

        print("File downloaded with successful!")
        host.close()
        file.close()

class CacheObject:
    def __init__(self, url, file, compiled):
        self.url = url
        self.file = file
        self.compiled = compiled