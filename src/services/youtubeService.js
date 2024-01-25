const VideoModel = require("../models/videoModel");
const secrets = require("../utils/secrets");
const logger = require("../utils/logger");
const cron = require("node-cron");
const { fetchVideos } = require("../utils/helper");

//Cron Job to constantly fetch data
module.exports = () => {
    cron.schedule("*/10 * * * * *", async () => {
        //will execute every minute until stopped
        try {
            let done = false;

            for (const apiKey of secrets.YOUTUBE_API_KEY.split(",")) {
                try {
                    if (done) {
                        break;
                    }

                    const videos = await fetchVideos(
                        apiKey,
                        secrets.YOUTUBE_SEARCH_QUERY
                    );
                    logger.info("Videos inserted");
                    await VideoModel.create(videos);
                    
                    done = true;
                } catch (err) {
                    if (err?.code === 11000) {
                        done = true;
                        logger.info("Duplicate record found thus not inserting into DB");
                    }
                    else {
                        logger.error("Error saving videos to DB", {
                            error: err,
                        });
                    }

                }
            }

            if (!done) {
                throw new Error("No videos found");
            }
        } catch (err) {
            logger.error("No videos found", {
                error: err,
            });
        }
    });
};
