var fs = require('fs'),
    request = require('request');
var path = require('path');
var download = require('image-downloader');
var crypto = require('crypto');
var Spinner = require('cli-spinner').Spinner;
var Scraper = require ('./shahid-image-scrapper')
, yahoo = new Scraper.Yahoo(),
  google = new Scraper.Google(),
  bing = new Scraper.Bing(),
  pics = new Scraper.Picsearch();


/*
    to do 
    add -   msn
            duckduckgo
            https://yandex.ru


*/
async function downloadIMG(url, path) {
      var { filename, image } = await download.image({url: url, dest: path});
      return {filename, image};
};

function mkdirSyncP(location) {
    let normalizedPath = path.normalize(location);
    let parsedPathObj = path.parse(normalizedPath);
    let curDir = parsedPathObj.root;
    let folders = parsedPathObj.dir.split(path.sep);
    folders.push(parsedPathObj.base);
    for(let part of folders) {
        curDir = path.join(curDir, part);
        if (!fs.existsSync(curDir)) {
            fs.mkdirSync(curDir);
        }
    }
}


async function fetchImages(searchengine, keyword, limit){
    var links = [];
    if(searchengine == 'google' || searchengine == "duckduckgo" || searchengine == "yandex"){
        links =  await google.list({
            keyword: keyword,
            num: limit,
            detail: false,
            nightmare: {
                show: false
            }
        });
    }else if(searchengine == 'yahoo'){
        links = await yahoo.list({
            keyword: keyword,
            num: limit,
            detail: false,
            nightmare: {
                show: false
            }
        });
    }else if(searchengine == 'bing' || searchengine == "msn"){
        links = await bing.list({
            keyword: keyword,
            num: limit,
            detail: false,
            nightmare: {
                show: false
            }
        });
    }else{
        links = await google.list({
            keyword: keyword,
            num: Math.floor(limit/3),
            detail: false,
            nightmare: {
                show: false
            }
        });
        console.log("fetched "+Math.floor(limit/3)+" images from google");
        links = links.concat(await bing.list({
            keyword: keyword,
            num: Math.floor(limit/3),
            detail: false,
            nightmare: {
                show: false
            }
        }));
        console.log("fetched "+Math.floor(limit/3)+" images from bing");
        links = links.concat(await yahoo.list({
            keyword: keyword,
            num: Math.floor(limit/3),
            detail: false,
            nightmare: {
                show: false
            }
        }));
        console.log("fetched "+Math.floor(limit/3)+" images from yahoo");
    }
    return links;
}

function printHelp(){
    console.log("---------------------------------------");
    console.log('---------------  M I D  ---------------');
    console.log("---------------------------------------");
    console.log("MID works for the following commands: \n");
    console.log("\t-category 'your category'");
    console.log("\t\texample: -category 'weapons/guns/g3'");
    console.log("\t-prefix 'your prefix'");
    console.log("\t-search 'your search'");
    console.log("\t-limit 'your limit'");
    console.log("\t-search-engine 'search engine name'");
    console.log("\n\texample: ");
    console.log("\t\tnode mid -category 'planes' -prefix 'plane-f16-' -search-engine 'google'");
    console.log("\n\tSearch engines codes : ");
    console.log("\tGoogle: -search-engine 'google'");
    console.log("\tYahoo: -search-engine 'yahoo'");
    console.log("\tBing: -search-engine 'bing'");
    console.log("\tFull Search: -search-engine 'all'");
}
var args = process.argv;
if(process.argv.indexOf("--help") > -1){
    printHelp();
}else{
    var category = 'not specified';
    var prefix = '';
    var searchEngine = 'all';
    var search = 'everything';
    var limit = 1000;
    if(args.indexOf("-category") > -1){
        category=args[args.indexOf("-category") + 1];
    }
    if(args.indexOf("-prefix") > -1){
        prefix=args[args.indexOf("-prefix") + 1];
    }
    if(args.indexOf("-search-engine") > -1){
        searchEngine=args[args.indexOf("-search-engine") + 1];
    }
    if(args.indexOf("-search") > -1){
        search = args[args.indexOf("-search") + 1];
    }
    if(args.indexOf("-limit") > -1){
        limit = args[args.indexOf("-limit") + 1];
    }

    if(!fs.existsSync("./downloads/"+category+"/")){
        mkdirSyncP("./downloads/"+category+"/");
    }

    async function process(){
        console.log("crawling the web ...");
        var links = await fetchImages(searchEngine, search, limit);
        for(var i = 0 ; i < links.length; i++){
            var ext = ".jpg";
            if(links[i].type){
                ext = links[i].type == "image/jpg" ? ".jpg" :
                      links[i].type == "image/png" ? ".png" : ".gif";
            }else{
                ext = "."+links[i].url.split(".")[links[i].url.split(".").length - 1];
                if(ext.length > 5){
                    console.log(links[i]);
                    ext = ".jpg";
                }
            }
            var name = "./downloads/"+category+"/"+prefix+ crypto.randomBytes(5).toString('hex');
            name = name+"-"+path.basename(links[i].url);
            console.log("downloading "+path.basename(links[i].url) + " ...");
            console.log(" ");
            try{
                var fulllink = links[i].url;
                var downloaded = await downloadIMG(fulllink, name);
                //console.log(links[i]);
                console.log(downloaded.filename + " saved");
            }catch(ex){
                console.log("error downloading image");
            }
        }
        console.log("Search Completed");
    }

    process();
}
