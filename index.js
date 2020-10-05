require('dotenv').config()
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const SpotifyWebApi = require('spotify-web-api-node');

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/artist-search", (req, res) => {
    let input = req.query.search_word
    console.log(input)
    if (input == "") {
        res.render("index");
        return
    }
    spotifyApi
        .searchArtists(input)
        .then(data => {
            res.render("artist-search-results", { input, mydata: data.body.artists.items });
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:artistId', (req, res, next) => {
    spotifyApi
        .getArtistAlbums(req.params.artistId,
            { limit: 10, offset: 20 },
            function (err, data) {
                if (err) {
                    console.error('Something went wrong!');
                } else {
                    res.render("albums", { albumData: data.body.items });
                }
            }
        );
});

app.get('/tracks/:albumId', (req, res, next) => {
    console.log(req.params.albumId)
    spotifyApi
        .getAlbumTracks(req.params.albumId, { limit: 30, offset: 1 })
        .then(function (data) {
            res.render("tracks", { trackData: data.body.items });
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.listen(PORT, () => {
    console.log("server");
});

app.use((req, res) => {
    res.render('404')
})
