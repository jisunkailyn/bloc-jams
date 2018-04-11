var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + buzz.toTimer(songLength) + '</td>'
      + '</tr>'
      ;

     var $row = $(template);

     var clickHandler = function() {
       var songNumber = parseInt($(this).attr('data-song-number'));

       if(currentlyPlayingSongNumber !== null) {
         getSongNumberCell(currentlyPlayingSongNumber);
       }

       	if (currentlyPlayingSongNumber !== songNumber) {
       		$(this).html(pauseButtonTemplate);
          setSong(songNumber);
          updatePlayerBarSong();
          $('.main-controls .play-pause').html(playerBarPauseButton);
       	} else if (currentlyPlayingSongNumber === songNumber) {
       		$(this).html(playButtonTemplate);
          $('.main-controls .play-pause').html(playerBarPlayButton);
          setSong(null);
       	}

     };

     var onHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
         songNumberCell.html(playButtonTemplate);
       }
     };

     var offHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
         songNumberCell.html(songNumber);
       }
     };

     $row.find('.song-item-number').click(clickHandler);
     $row.hover(onHover, offHover);
     return $row;
   };

var setCurrentAlbum = function(album) {
     currentAlbum = album;
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');


     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);


     $albumSongList.empty();


     for (var i = 0; i < album.songs.length; i++) {
       var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
       $albumSongList.append($newRow);
     }
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // #10
        currentSoundFile.bind('timeupdate', function(event) {
            // #11
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            setCurrentTimeInPlayerBar(this.getTime())
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
   var offsetXPercent = seekBarFillRatio * 100;
   offsetXPercent = Math.max(0, offsetXPercent);
   offsetXPercent = Math.min(100, offsetXPercent);

   var percentageString = offsetXPercent + '%';
   $seekBar.find('.fill').width(percentageString);
   $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($(this).parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio * 100);
            }
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
  var $songName = $('.song-name');
  var $artistSongMobile = $('.artist-song-mobile');
  var $artistName = $('.artist-name');

  $songName.text(currentSongFromAlbum.title);
  $artistSongMobile.text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
  $artistName.text(currentAlbum.artist);

  setVolume(currentVolume);
  updateSeekBarWhileSongPlays();
  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) + 1;
  var lastSongNumber = currentlyPlayingSongNumber;

  if (currentSongIndex >= currentAlbum.songs.length) {
      currentSongIndex = 0;
  }

  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();

  var $nextSongNumber = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumber = getSongNumberCell(lastSongNumber);

  $nextSongNumber.html(pauseButtonTemplate);
  $lastSongNumber.html(lastSongNumber);
};

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) - 1;
  var lastSongNumber = currentlyPlayingSongNumber;

  if (currentSongIndex < 0) {
      currentSongIndex = currentAlbum.songs.length - 1;
  }

  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();

  var $prevSongNumber = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumber = getSongNumberCell(lastSongNumber);

  $prevSongNumber.html(pauseButtonTemplate);
  $lastSongNumber.html(lastSongNumber);
};

var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  if (songNumber == null) {
    currentlyPlayingSongNumber = null;
    currentSongFromAlbum = null;
    currentSoundFile = null;
  } else {
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      // #2
      formats: [ 'mp3' ],
      preload: true
    });

    currentSoundFile.play();

    setVolume(currentVolume);
  }
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(currentVolume + '%');
        $volumeThumb.css({left: currentVolume + '%'});

        currentSoundFile.setVolume(volume);
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
  var $currentTime = $('.current-time');
  $currentTime.text(buzz.toTimer(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
  var $totalTime = $('.total-time');
  $totalTime.text(buzz.toTimer(totalTime));
}

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
setSong(null);
var currentVolume = 80;
var currentSoundFile = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

 $(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     setupSeekBars();
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);
 });
