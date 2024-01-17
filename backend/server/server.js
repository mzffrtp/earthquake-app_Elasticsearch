const { Client } = require('@elastic/elasticsearch');
const client = require('./elasticsearch/client');
const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv")


const app = express();
dotenv.config({
    path: process.cwd() + "/.env"
})

const data = require('./data_managenent/retrieve_and_ingest_data.js');
app.use("/ingest_data", data)

app.use(cors());

app.get('/results', (req, res) => {
    const passedType = req.query.type;
    const passedMag = req.query.mag;
    const passedLocation = req.query.location;
    const passedDateRange = req.query.dateRange;
    const passedSortOption = req.query.sortOption;
    const sortOrder = passedSortOption === 'asc' ? 'asc' : 'desc';

    async function sendESRequest() {
        const body = await client.search({
            index: 'earthquakes',
            body: {
                sort: [
                    {
                        mag: {
                            order: sortOrder,
                        },
                    },
                ],
                size: 300,
                query: {
                    bool: {
                        filter: [
                            {
                                term: { type: passedType },
                            },
                            {
                                range: {
                                    mag: {
                                        gte: passedMag,
                                    },
                                },
                            },
                            {
                                match: { place: passedLocation },
                            },
                            // for those who use prettier, make sure there is no whitespace.
                            {
                                range: {
                                    '@timestamp': {
                                        gte: `now-${passedDateRange}d/d`,
                                        lt: 'now/d',
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });
        res.json(body.hits.hits);
    }
    sendESRequest();
});


const port = process.env.HTTP_SERVER_PORT || 7003;
const host = process.env.HTTP_SERVER_HOST || "localhost";

app.listen(
    port,
    host,
    () => {
        console.log(`HTTP Server started at --> http://${host}:${port}`);
    }
);
