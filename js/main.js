/*
 * YOUTUBE
 */

// load IFrame API asynchronously

var ytScriptTag = document.createElement('script');
ytScriptTag.src = 'https://www.youtube.com/iframe_api';

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(ytScriptTag, firstScriptTag);

// create player <iframe> when API download completes

function makeYTPlayer(divId, youtubeId) {
    return new YT.Player(divId, {
        height: '60',
        width: '460',
        videoId: youtubeId,
        events: {
            onError: onYoutubePlayerError
        }
    });
}

function onYoutubePlayerError(event) {
    console.error('youtube error ' + event.data);
}

function makeYTPlayerInfo(playerId) {
    var playerInfo = ambienceDB[playerId];

    return {
        checkId: playerInfo.checkId,
        player: makeYTPlayer(playerInfo.divId, playerInfo.youtubeId)
    };
}

function makeYTPlaylistPlayer(divId) {
    return new YT.Player(divId, {
        height: '60',
        width: '460',
        playerVars: {
            listType: 'playlist'
        },
        events: {
            onError: onYoutubePlayerError
        }
    });
}

var players = {};
var playerDB = {};
var playerYTPlaylist;
// this function required by API
function onYouTubeIframeAPIReady() {
    playerDB.rain = makeYTPlayerInfo('rain');
    playerYTPlaylist = makeYTPlayer('yt-playlist');
}

/*
 * UI CONTROL
 */

function playerCheckboxIsChecked(playerId) {
    var checkId = playerDB[playerId].checkId;
    return $('#' + checkId).is(':checked');
}

// set up listeners

var currentYoutubePlaylistId;

$(function () {
    $('#button-play-pause').on('click', function () {
        if (dashboardIsPaused()) {
            dashboardDoPlay();
        } else {
            dashboardDoPause();
        }
    });

    currentYoutubePlaylistId = '';
});

function dashboardIsPaused() {
    // can't do "=== pause.png" since we use data URI for the pause button on page load
    return $('#button-play-pause').attr('src') !== 'img/button_pause.png';
}

function dashboardDoPlay() {
    $('#button-play-pause').attr('src', 'img/button_pause.png');
    playYoutubeVideos();
    playYoutubePlaylist();
}

function playYoutubeVideos() {
    for (playerId in playerDB) {
        if (playerCheckboxIsChecked(playerId)) {
            var playerInfo = playerDB[playerId];
            playerInfo.player.playVideo();
        }
    }
}

function playYoutubePlaylist() {
    var newYoutubePlaylistId = $.trim($('#text-yt-playlist').val());
    if (newYoutubePlaylistId === '' || !$('#check-yt-playlist').is(':checked')) {
        // blank or disabled playlist: do nothing
        return;
    }

    if (newYoutubePlaylistId === currentYoutubePlaylistId) {
        // same playlist: resume video
        playerYTPlaylist.playVideo();
    } else {
        // new playlist: load new playlist
        // must use object syntax! arg syntax makes you take the "PL" out first
        playerYTPlaylist.loadPlaylist({list: newYoutubePlaylistId});
        currentYoutubePlaylistId = newYoutubePlaylistId;
    }
}

function dashboardDoPause() {
    $('#button-play-pause').attr('src', 'img/button_play.png');
    pauseYoutubeVideos();
    pauseYoutubePlaylist();
}

function pauseYoutubeVideos() {
    for (playerId in playerDB) {
        var playerInfo = playerDB[playerId];
        playerInfo.player.pauseVideo();
    }
}

function pauseYoutubePlaylist() {
    playerYTPlaylist.pauseVideo();
}

