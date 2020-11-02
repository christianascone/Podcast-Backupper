const path = require('path');
const StringFormat = require('./app/utils/stringFormatUtil');
const FilenameUtil = require('./app/utils/filenameUtil');
const xml2js = require('xml2js');
const fs = require('fs');
const https = require('follow-redirects').https;
const http = require('follow-redirects').http;
const {hideBin} = require('yargs/helpers');
const yargs = require('yargs');

const argv = yargs(hideBin(process.argv))
    .option('name', {
        alias: 'n',
        type: 'string',
        description: 'Podcast name',
    })
    .option('feed', {
        alias: 'f',
        type: 'string',
        description: 'Rss feed url',
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output directory',
    })
    .option('count', {
        alias: 'c',
        type: 'string',
        description: 'Number of episodes to download (starting from last)',
    })
    .demandOption(['name', 'feed', 'output'], 'Please provide name, feed and output arguments to work with this tool')
    .argv;

// Read command line arguments
const name = argv.name;
const feed = argv.feed;
const outputDir = argv.output;
const maxCount = argv.count || -1;

function getReqByUri(uri) {
    return uri.startsWith('https') ? https : http;
}

function makeDownloadDir() {
    const podcast_name = FilenameUtil.stringToFilename(name);
    const dir = outputDir + path.sep + podcast_name;
    console.log("Output dir: " + dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return dir;
}

function writeFeedXml(dir, data) {
    fs.writeFile(dir + path.sep + 'feed.xml', data, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
}

function downloadEpisode(dir, filename, url) {
    const file = fs.createWriteStream(dir + path.sep + filename + '.mp3');
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close();  // close() is async, call cb after close completes.
        });
    });
}

function main() {
    const parser = new xml2js.Parser({mergeAttrs: true});
    console.log(name);
    const dir = makeDownloadDir();
    const uri = feed;

    const req = getReqByUri(uri);


    let data = '';
    req.get(uri, function (res) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
            res.on('data', function (data_) {
                data += data_.toString();
            });
            res.on('end', function () {
                writeFeedXml(dir, data);
                parser.parseString(data, function (err, result) {
                    const items = result.rss.channel[0].item;
                    for (const key in items) {
                        if (items.hasOwnProperty(key)) {
                            const element = items[key];
                            console.log("key: " + key);
                            let filename = FilenameUtil.stringToFilename(element.title[0]);
                            console.log(filename);
                            let season = element['itunes:season'];
                            let episode = element['itunes:episode'];
                            if (season && episode) {
                                const prefix = StringFormat.padZeroWithLength(season, 2) + "x" + StringFormat.padZeroWithLength(episode, 2);
                                filename = prefix + "_" + filename;
                            }

                            const url = element.enclosure[0].url[0];
                            console.log('Url: ' + url);

                            const index = parseInt(key);
                            if (index < maxCount || maxCount < 0) {
                                downloadEpisode(dir, filename, url);
                            }
                        }
                    }
                });
            });
        }
    });
}

main();