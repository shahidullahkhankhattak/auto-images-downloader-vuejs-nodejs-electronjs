const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
var fs = require('fs'),
  request = require('request');
var path = require('path');
var shell = require('shelljs');
var download = require('image-downloader');
var crypto = require('crypto');
var Scraper = require('./shahid-image-scrapper'),
  yahoo = new Scraper.Yahoo(),
  google = new Scraper.Google(),
  bing = new Scraper.Bing(),
  pics = new Scraper.Picsearch();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })
  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})


ipcMain.on("process", async function(e, data){
  var category = data.category;
  var prefix = data.prefix;
  var searchEngine = data.searchEngine;
  var search = data.searchKeywords;
  var limit = data.limit;
  var scraper = shell.exec(`node ./mid -category '${category}' -prefix '${prefix}' -search-engine '${searchEngine}' -search '${search}' -limit '${limit}'`, {async: true});
  scraper.stdout.on('data', function(data){
    mainWindow.send("console", data);
  });
});
