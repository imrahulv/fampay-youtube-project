const express = require("express");
const secrets = require("../utils/secrets");
const logger = require("../utils/logger");
const VideoModel = require("../models/videoModel");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");

const router = express.Router();

router.get("/", async (req, res) => {
    res.render("index", {
        title: "Youtube Feed",
        phrase: secrets.YOUTUBE_SEARCH_QUERY,
    });
});

router.get("/videos", async (req, res) => {
    const page = req.query.page || 0;
    const sortBy = req.query.sortBy || "publishedAt";
    const { q } = req.query;

    let videos;
    let totalItems;

    try {
        if (q) {
            const regexPattern = q.split(/\s+/).map(word => `(?=.*${word})`).join('');
            const regex = new RegExp(regexPattern, 'i'); // 'i' flag for case-insensitive matching

            videos = await VideoModel
                .find({
                    $or: [
                        { title: { $regex: regex } },
                        { description: { $regex: regex } },
                    ],
                })
                .sort({ [sortBy]: 1 });
            totalItems = videos.length;
            videos = videos.splice(page * 10, 10);
        } else {
            totalItems = await VideoModel.estimatedDocumentCount();
            videos = await VideoModel.find(
                {
                    skip: page * 10,
                    limit: 10,
                }
            ).sort({ [sortBy]: 1 });
        }

        const totalPages = Math.ceil(totalItems / 10);
        const hasPrev = page > 0;
        const hasNext = page < totalPages;

        res.status(StatusCodes.OK).json({
            videos,
            hasPrev,
            hasNext,
            totalItems,
            totalPages,
        });
    } catch (err) {
        logger.error("GET /videos", {
            error: err,
        });
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

module.exports = router;
