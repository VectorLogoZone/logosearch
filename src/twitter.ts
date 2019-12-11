const Twit = require('twit');
import Pino from 'pino';
import axios from 'axios';

type Logo = {
    handle: string,
    name: string
};

async function getClient(logger:Pino.Logger):Promise<any> {
    const twitterClient = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_SECRET,
        timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
        strictSSL: true,     // optional - requires SSL certificates to be valid.
    });

    const user = await twitterClient.get('account/verify_credentials')
    logger.debug({ apiResponse: user }, "verify_credentials result");

    return twitterClient;
}

async function tweet(logger:Pino.Logger, logo:Logo) {

    const imageUrl = `https://svg2raster.fileformat.info/vlz.jsp?svg=/logos/${logo.handle}/${logo.handle}-ar21.svg&width=1024`;

    const imgResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
        });

    logger.debug({ resp: imgResponse }, 'img response');

    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
        throw new Error('you must set TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET');
    }   

    const twitterClient = await getClient(logger);

    var b64content = Buffer.from(imgResponse.data, 'binary').toString('base64');



    // post the media to Twitter
    const uploadResponse = await twitterClient.post('media/upload', { 
        media_data: b64content 
    });
    logger.debug({ apiResponse: uploadResponse }, 'upload response');

    // update its metadata
    const mediaIdStr = uploadResponse.data.media_id_string;
    const metadataResponse = await twitterClient.post('media/metadata/create', {
        media_id: uploadResponse.data.media_id_string, 
        alt_text: { text: `PNG Preview of the SVG logo for ${logo.name}` } 
    });
    logger.debug({ apiResponse: metadataResponse }, 'metadata/create response');

    // post the tweet
    const postResult = await twitterClient.post('statuses/update', { 
        status: `${logo.name} vector (SVG) logos.  Check them out at https://vlz.one/${logo.handle}`, 
        media_ids: [mediaIdStr], 
        source: 'vlz-bot',
        trim_user: true
    });
    logger.debug({ apiResponse: postResult }, 'update response');
/*
    // delete the tweet
    const deleteResult = twitterClient.post('statuses/destroy/:id', { 
        id: postResult.id_str 
    });
    logger.debug({ apiResponse: deleteResult }, 'destroy response');
*/  
}

export {
    findRandomNotRecent,
    getLastTimestamp,
    getRecent,
    tweet
}
