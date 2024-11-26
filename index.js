const express = require('express');
const axios = require('axios');
const cors = require("cors");
const bodyParser = require('body-parser');
const FormData = require('form-data');
const googleTrends = require('google-trends-api');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3500;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
});  // Start at Port


// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
});

//to connect to database.
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


app.get('/test', async (req, res) => {
    //res.send({hello: "world"})
    try {
        let sql = "SELECT * FROM `users`";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.json({ "status": true, "message": "User Found", "data": result });
            } else {
                res.json({ "status": false, "message": "User Not Found" });
            }
        });

    } catch (err) {
        console.log(err)
    }
})

app.post('/rapidAPI1', async (req, res) => {
    const options = {
        method: 'POST',
        url: 'https://ai-written-articles-multi-lingual-long-and-short-smodin-author.p.rapidapi.com/article',
        headers: {
            'x-rapidapi-key': 'cf15913753msh64c6a1165af2a46p1eaca4jsn39073e572916',
            'x-rapidapi-host': 'ai-written-articles-multi-lingual-long-and-short-smodin-author.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            prompt: req.body.topic,
            sections: 2,
            paragraphsPerSection: 3,
            language: 'en',
            rewrite: true
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        res.send(response.data);
    } catch (error) {
        console.error(error);
    }
});

app.post('/rapidAPI2', async (req, res) => {

    const data = new FormData();
    data.append('topic', req.body.topic);

    const options = {
        method: 'POST',
        url: 'https://ai-content-writer.p.rapidapi.com/data',
        headers: {
            'x-rapidapi-key': 'cf15913753msh64c6a1165af2a46p1eaca4jsn39073e572916',
            'x-rapidapi-host': 'ai-content-writer.p.rapidapi.com',
            ...data.getHeaders(),
        },
        data: data
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        res.send(response.data);

    } catch (error) {
        console.error(error);
    }
});

app.post('/getTrendingTopics', async (req, res) => {

    try {
        googleTrends.dailyTrends({
            trendDate: new Date(),
            geo: req.body.geo,
        }, (err, results) => {
            if (err) {
                console.log('errorrrrr', err);
            } else {
                console.log(results);
                res.send(JSON.parse(results));
            }
        });
    } catch (err) {
        console.error(error);
    }
});

app.post('/generateArticleFromTopicAPI1', async (req, res) => {
    try {
        let topics = await googleTrends.dailyTrends({
            trendDate: new Date(),
            geo: req.body.geo,
        });
        if (topics) {
            topics = JSON.parse(topics);
            const options = {
                method: 'POST',
                url: 'https://ai-written-articles-multi-lingual-long-and-short-smodin-author.p.rapidapi.com/article',
                headers: {
                    'x-rapidapi-key': 'cf15913753msh64c6a1165af2a46p1eaca4jsn39073e572916',
                    'x-rapidapi-host': 'ai-written-articles-multi-lingual-long-and-short-smodin-author.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                data: {
                    prompt: topics.default.trendingSearchesDays[0].trendingSearches[0].title.query,
                    sections: 2,
                    paragraphsPerSection: 3,
                    language: 'en',
                    rewrite: true
                }
            };

            try {
                const response = await axios.request(options);
                console.log(response.data);
                res.send(response.data);
            } catch (error) {
                console.error(error);
                res.error(response.data);
            }
        }
    } catch (err) {
        console.log(err)
    }
})

app.post('/generateArticleFromTopicAPI2', async (req, res) => {
    try {
        let topics = await googleTrends.dailyTrends({
            trendDate: new Date(),
            geo: req.body.geo,
        });
        if (topics) {
            topics = JSON.parse(topics);

            const data = new FormData();
            data.append('topic', topics.default.trendingSearchesDays[0].trendingSearches[0].title.query);

            const options = {
                method: 'POST',
                url: 'https://ai-content-writer.p.rapidapi.com/data',
                headers: {
                    'x-rapidapi-key': 'cf15913753msh64c6a1165af2a46p1eaca4jsn39073e572916',
                    'x-rapidapi-host': 'ai-content-writer.p.rapidapi.com',
                    ...data.getHeaders(),
                },
                data: data
            };

            try {
                const response = await axios.request(options);
                res.send(response.data);
            } catch (error) {
                console.error(error);
            }
        }
    } catch (err) {
        console.log(err)
    }
})

app.post('/generateImage', async (req, res) => {
    try {
        const options = {
            method: 'POST',
            url: `https://api.limewire.com/api/image/generation`,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Version': 'v1',
                Accept: 'application/json',
                Authorization: 'Bearer lmwr_sk_xxQOAcLiXi_aYTnPzzGsqx2Yq3PXA9EUjkHCJ5vGuUgkv6PL'
            },
            data: {
                prompt: req.body.text,
                aspect_ratio: '1:1'
            }
        };
        try {
            const response = await axios.request(options);
            console.log(response)
            res.send(response.data);
        } catch (error) {
            console.error(error);
        }
    }
    catch (err) {
        console.error(err)
    }
})
