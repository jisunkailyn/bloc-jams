var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;

     var $row = $(template);

     var clickHandler = function() {
       var songNumber = parseInt($(this).attr('data-song-number'));

       if(currentlyPlayingSongNumber !== null) {
         var attrFinder = '[data-song-number="' + currentlyPlayingSongNumber + '"]';
         $('.song-item-number' + attrFinder).html(currentlyPlayingSongNumber);
       }

       	if (currentlyPlayingSongNumber !== songNumber) {
       		$(this).html(pauseButtonTemplate);
       		currentlyPlayingSongNumber = songNumber;
          currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
          updatePlayerBarSong();
       	} else if (currentlyPlayingSongNumber === songNumber) {
       		$(this).html(playButtonTemplate);
       		currentlyPlayingSongNumber = null;
          currentSongFromAlbum = null;
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

  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) + 1;
  var lastSongNumber = currentlyPlayingSongNumber;

  if (currentSongIndex >= currentAlbum.songs.length) {
      currentSongIndex = 0;
  }

  currentlyPlayingSongNumber = currentSongIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex]

  updatePlayerBarSong();

  var $nextSongNumber = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
  var $lastSongNumber = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

  $nextSongNumber.html(pauseButtonTemplate);
  $lastSongNumber.html(lastSongNumber);
}

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) - 1;
  var lastSongNumber = currentlyPlayingSongNumber;

  if (currentSongIndex < 0) {
      currentSongIndex = currentAlbum.songs.length - 1;
  }

  currentlyPlayingSongNumber = currentSongIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex]

  updatePlayerBarSong();

  var $prevSongNumber = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
  var $lastSongNumber = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

  $prevSongNumber.html(pauseButtonTemplate);
  $lastSongNumber.html(lastSongNumber);
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

 $(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);
 });
