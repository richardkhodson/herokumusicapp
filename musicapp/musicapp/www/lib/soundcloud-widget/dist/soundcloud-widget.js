/*
 * jQuery Soundcloud Widget
 * 2016 Matt O'Connell <mattoconnell408@gmail.com> 
 * License: MIT
 */
 
(function($) {
	'use strict';

	var soundcloud = function(el, customOptions) {
		var _ = this;
		_.$el = $(el).addClass('soundcloud loading minimized');

		_.$ui = {};
		_.defaults = defaults;
		_.player = {};
		_.playlists = {
			data: {},
			retrieved: 0
		};
		_.playlist = {
			name: null,
			user: null,
			currentID: null,
			currentIndex: 0,
			tracks: [],
			trackMap: {}
		};
		_.state = {
			playing: false,
			poll: null
		};

		_.options = $.extend(defaults, customOptions);

		_.appendUI();
		_.init(customOptions);
	};

	/*
	 * Default Values
	 */
	var defaults = {
		url: 'https://api.soundcloud.com',
		serverSideScript: 'proxy.php',
		key: null,
		autoPlay: false,
		scrubberSpeed: 250 // How often to update scrubber (ms)
	};

	soundcloud.prototype.appendUI = function() {
		var _ = this;

		var ui = '' +
		'<div class="widget soundcloud">' +
        '    <header class="main">' +
        '        <section class="mini">' +
        '            <img alt="" class="icon">' +
        '            <div class="information">' +
        '                <h2 class="title">Soundcloud</h2>' +
        '                <h3 class="subtitle">Loading...</h3>' +
        '            </div>' +
        '            <button class="action"></button>' +
        '        </section>' +
        '        <section class="controls">' +
        '            <button class="action"></button>' +
        '            <button class="back"></button>' +
        '            <button class="next"></button>' +
        '        </section>' +
        '        <section class="progress">' +
        '            <span class="elapsed">0:12</span>' +
        '            <div class="scrubber">' +
        '                <div class="bar"></div>' +
        '                <div class="handle"></div>' +
        '            </div>' +
        '            <span class="remaining">-3:48</span>' +
        '        </section>' +
        '    </header>' +
        '    <div class="container">' +
        '        <div class="playlist-stage">' +
        '            <section class="playlists">' +
        '                <div class="playlists-scroller">' +
        '                    <a href="#" class="playlist prototype">' +
        '                        <img src="" alt="" class="cover">' +
        '                        <h5 class="title">Playlist Title Here</h5>' +
        '                        <span class="description">11 tracks</span>' +
        '                    </a>' +
        '                </div>' +
        '            </section>' +
        '            <section class="tracks">' +
        '                <header class="row">' +
        '                    <button class="back">Playlists</button>' +
        '					 <h5 class="title">Name</h5>' +
        '                </header>' +
        '                <div class="track-wrapper">' +
        '                    <div class="track-scroller">' +
        '                        <a href="#" class="row track prototype">' +
        '                            <h5 class="title">Long Track Title</h5>' +
        '                            <h6 class="subtitle">Artist Name</h6>' +
        '                            <span class="duration">3:48</span>' +
        '                        </a>' +
        '                    </div>' +
        '                </div>' +
        '            </section>' +
        '        </div>' +
        '    </div>' +
        '</div>';

		_.$el.append(ui);

		//setup pointers to UI elements
		_.$widget = _.$el.find('.widget');

		//mini player
		_.$mini = _.$el.find('.mini');
		_.$actionButton = _.$mini.find('button.action');
		_.$actionButton.on('click', function(){
			if (_.$widget.hasClass('expanded') ) {
				_.toggleExpanded();
				return;
			}

			_.togglePlaying();
		});
		_.$actionButton.addClass('play');
		_.$miniTitle = _.$mini.find('.title');
		_.$miniSubTitle = _.$mini.find('.subtitle');
		_.$miniIcon = _.$mini.find('.icon');

		_.$miniIcon.attr('src', 'https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8f.png');

		//main controls
		_.$controls = _.$el.find('.controls');
		_.$mainActionButton = _.$controls.find('button.action');
		_.$mainActionButton.on('click', function(){
			_.togglePlaying();
		});
		_.$mainActionButton.addClass('play');

		_.$mainNextButton = _.$controls.find('button.next');
		_.$mainNextButton.on('click', function(){
			var index = _.playlist.currentIndex + 1;
			if(index >= 0 && index < _.playlist.tracks.length) {
				_.changeTrack(index);
			}
		});

		_.$mainBackButton = _.$controls.find('button.back');
		_.$mainBackButton.on('click', function(){
			var index = _.playlist.currentIndex - 1;
			if(index >= 0 && index < _.playlist.tracks.length) {
				_.changeTrack(index);
			}
		});


		//playlists
		_.$playlists = _.$el.find('.playlists');
		_.$playlistsStage = _.$playlists.find('.playlists-scroller');
		_.$playlistsPrototype = _.$playlistsStage.find('.playlist.prototype').clone().removeClass('prototype');
		_.$playlistsStage.empty();


		//tracks
		_.$tracks = _.$el.find('.tracks');
		_.$tracksStage = _.$tracks.find('.track-scroller');
		_.$trackPrototype = _.$tracksStage.find('.track.prototype').clone().removeClass('prototype');
		_.$tracksStage.empty();

		_.$tracks.find('button.back').on('click', function(){
			_.showPlaylists();
		});

		//progress
		_.$scrubber = _.$el.find('.scrubber');
        _.$handle = _.$el.find('.handle');
        _.$remaining = _.$el.find('.remaining');
        _.$elapsed = _.$el.find('.elapsed');


        function adjustHeight() {
        	var height = window.innerHeight;

        	if (height > 400) {
        		height = 400;
        	}

        	_.$widget.css({height: (height) + 'px'});
        	_.$widget.css({bottom: '-' + (height - 49) + 'px'});
        }



        window.onresize = adjustHeight;
        adjustHeight();

        //handle all touches to prevent default if needed, like for scrubber
		function mainTouchHandler(event) {
            var touch = event.changedTouches[0];

            var target = $(touch.target);

			var scrubber = _.$scrubber;
	        var handle = _.$handle;

            var leftBound = scrubber[0].offsetLeft;
            var rightBound = scrubber[0].offsetWidth;

            if(target.hasClass('progress')) {

                var left = touch.screenX - leftBound;

                if (left < 0) {
                    left = 0;
                }

                if (left > rightBound) {
                    left = rightBound;
                }


            	if (event.type == 'touchstart') {
            		_.state.scrubbing = true;
            	}
            	if (event.type == 'touchend') {
            		var percent = left / rightBound;

            		_.player.currentTime = _.player.duration * percent;
					_.player.play();

            		_.state.scrubbing = false;
            	}


                left += 'px';

                handle.css({
                    left: left
                });


                event.preventDefault();
            }

            if (target.hasClass('mini') && event.type == 'touchend') {
            	_.toggleExpanded();
            }
        }

        document.addEventListener("touchstart", mainTouchHandler, true);
        document.addEventListener("touchmove", mainTouchHandler, true);
        document.addEventListener("touchend", mainTouchHandler, true);
        document.addEventListener("touchcancel", mainTouchHandler, true);
	};

	/*
	 * Initialize Widget
	 */
	soundcloud.prototype.init = function() {
		/*
		 * Get all playlist data from API, populate playlist nav grid,
		 * Store all data in this.playlists.data[url] where 'url' is playlist url,
		 * Then, call callback function here
		 */
		this.setupPlaylists(function() {
			var _ = this;
			_.addPlayer();

			//trigger first playlist
			var playlist = _.$playlists.find('.playlist').eq(0);
			playlist.trigger('click');
			var track = _.$tracks.find('.track').eq(0);
			track.trigger('click');

		});
	};

	/*
	 * Gets data for all playlists
	 */
	soundcloud.prototype.setupPlaylists = function(callback) {
		var _ = this;
		_.options.playlists.forEach(function(pl) {
			_.options.playlistURL = pl;

			_.getPlaylistData(function(data){ // Get playlist data from API, then callback
				data = JSON.parse(data);
				_.playlists.data[pl] = data;
				_.playlists.retrieved++;

				_.buildPlaylistGrid(data, pl);
				_.checkIfAllPlaylistsReturned(callback);
			});
		});

	};

	/*
	 * Check to see if we've recieved all playlists' data
	 * If so, call callback
	 */
	soundcloud.prototype.checkIfAllPlaylistsReturned = function(callback) {
		var _ = this;
		if(_.playlists.retrieved == _.options.playlists.length) {
			_.$el.removeClass('loading');
			callback.call(_);
		}
	};

	/*
	 * Build playlist navigation grid
	 */
	soundcloud.prototype.buildPlaylistGrid = function(data, pl) {
		var _ = this;

		var playlist =_.$playlistsPrototype.clone();

		var artwork = data.artwork_url || data.tracks[0].artwork_url;

		playlist.attr('data-pl', pl);
		playlist.find('.title').text(data.title);
		playlist.find('.description').text(data.tracks.length + ' tracks');
		playlist.find('.cover').attr('src', toBigImage(artwork));

		var tracks = _.$el.find('.track-scroller');

		playlist.on('click', function(){
			_.$tracksStage.empty();

			_.$tracks.find('.title').text(data.title);

			_.options.playlistURL = $(this).attr('data-pl');
			_.assignPlaylistData(_.playlists.data[_.options.playlistURL]);

			data.tracks.forEach(function(data, i){
				var track = _.$trackPrototype.clone();

				track.find('.title').text(data.title)
				track.find('.subtitle').text(cleanUserName(data.user.username));
				track.find('.duration').text(timecode(data.duration));

				track.on('click', function(){
					_.changeTrack(i, true);
					return false;
				});

				_.$tracksStage.append(track);
			});

			_.showTracks();
			return false;
		});

		_.$playlistsStage.append(playlist);
	};

	soundcloud.prototype.showTracks = function() {
		var _ = this;

		_.$tracks.addClass('show');
		_.$playlists.removeClass('show');
	}

	soundcloud.prototype.showPlaylists = function() {
		var _ = this;

		_.$tracks.removeClass('show');
		_.$playlists.addClass('show');
	}

	soundcloud.prototype.toggleExpanded = function() {
		var _ = this;

		if (_.$widget.hasClass('expanded')) {
			_.$widget.removeClass('expanded');
		} else {
			_.$widget.addClass('expanded');
		}
	}

	soundcloud.prototype.togglePlaying = function() {
		var _ = this;

		if(_.state.playing) {
			_.player.pause();
		} else {
			_.player.play();
			if(_.playlist.currentIndex === 0 && _.player.currentTime === 0) {
				_.startPolling();
			}
		}
	}

	/*
	 * Get playlist data from API
	 */
	soundcloud.prototype.getPlaylistData = function(callback) {
		var _ = this;
		$.ajax({
			url: _.options.serverSideScript,
			data: {
				url: _.getRequestURL()
			},
			success: function(data) {
				callback.call(_, data);
			},
			error: function(e) {
				console.log(e);
			}
		});
	};

	/*
	 * Add HTML5 Audio player and assign to _.player
	 */
	soundcloud.prototype.addPlayer = function() {
		var _ = this;
		_.player = new Audio();
		_.player.addEventListener('play', function() {
			_.state.playing = true;
			_.updateUI();
		});
		_.player.addEventListener('pause', function() {
			_.state.playing = false;
			_.updateUI();
		});
		_.player.addEventListener('ended', function() {
			_.state.playing = false;
			var index = _.playlist.currentIndex + 1;
			if(index > _.playlist.tracks.length - 1)
				return false;
			_.changeTrack(index);
			_.updateUI();
		});
		_.$el.prepend(_.player);
	};

	/*
	 * Configure URL to send to Proxy
	 */
	soundcloud.prototype.getRequestURL = function() {
	    var _ = this,
			params = $.param({
				url: _.options.playlistURL,
				consumer_key: _.options.key
			});
		return decodeURIComponent(_.options.url + '/resolve.json?' + params);
	};

	/*
	 * Assign data retrieved from API to our Soundcloud widget instance
	 */
	soundcloud.prototype.assignPlaylistData = function(data) {
		var _ = this;
		_.playlist.tracks = [];
		_.playlist.trackMap = {};
		var pl = _.playlist;

		pl.name = data.permalink;
		pl.user = data.user.username;
		var i = 0;
		data.tracks.forEach(function(track) {
			if(track.streamable) {
				pl.currentID = pl.currentID || data.tracks[0].id;
				pl.tracks.push(track);
				pl.trackMap[track.id] = pl.tracks[i];
				i++;
			}
		});

		// Add UI Elements using Soundcloud data
		_.updateUI();
		// Queue up first track
		// _.changeTrack(0, !_.options.autoplay);
	};

	soundcloud.prototype.updateUI = function() {
		var _ = this,
			tracks = '';

		if(_.state.playing) {
			_.$actionButton.removeClass('play').addClass('pause');
			_.$mainActionButton.removeClass('play').addClass('pause');

		} else {
			_.$actionButton.removeClass('pause').addClass('play');
			_.$mainActionButton.removeClass('pause').addClass('play');
		}
	};

	/*
	 * Change track, update playlist indices, start track state polling
	 * Params are both optional.
	 * @param {int} index | track index from playlist | default: 0
	 * @param {bool} preventAutoPlay
	 */
	soundcloud.prototype.changeTrack = function(index, preventAutoPlay) {
		var _ = this;
		index = index || 0;
		var id = _.playlist.tracks[index].id,
			track = _.playlist.trackMap[id];

		_.playlist.currentID = id;
		_.playlist.tracks.forEach(function(track, i) {
		    if(track.id == id)
				index = i;
		});
		_.playlist.currentIndex = index;
		_.player.src = track.stream_url + '?consumer_key=' + _.options.key;
		if(!preventAutoPlay) {
			_.player.play();
			_.startPolling();
		}
		_.updateTrackUI(track);
	};

	/*
	 * Scrubber, constantly polls state of player
	 */
	soundcloud.prototype.startPolling = function() {
		var _ = this,
			cover = _.$ui.scrubberPlayed;
		_.state.timer = setInterval(function() {
			if(_.state.playing && !_.state.scrubbing) {

				_.$scrubber = _.$el.find('.scrubber');
        		_.$handle = _.$el.find('.handle');


				var relative = _.player.currentTime / _.player.duration * 100;

				_.$handle.css({left: relative + '%'});


				if (!isNaN(_.player.duration)) {
					_.$remaining.text('-' + timecode((_.player.duration - _.player.currentTime) * 1000));
				}
				_.$elapsed.text(timecode(_.player.currentTime * 1000));
			} else {
				if(!_.player.paused) {
					cover.width('100%');
				}
			}
		}, _.options.scrubberSpeed);
	};

	/*
	 * Update Current Track UI
	 */
	soundcloud.prototype.updateTrackUI = function(track) {
		var _ = this;
		_.$remaining.text('-' + timecode(track.duration));
		_.$elapsed.text('0:00');
		_.$miniIcon.attr('src', toBigImage(track.artwork_url));
	    _.$miniTitle.text(track.title);
		_.$miniSubTitle.text(cleanUserName(track.user.username));
	};

	/*
	 * Utils
	 */
	var toBigImage = function(url) {
		url = url || '';
	    return url.replace('-large', '-t500x500')
	};

	var cleanUserName = function(raw) {
	    return raw.toLowerCase()
			.split('-').join(' ')
			.split('_').join(' ')
			.split('.').join('')
			.replace('[official]', '');
	};

	/*
	 * Converts milliseconds to *.** timecode
	 * Taken from Matas Petrikas, matas@soundcloud.com
	 */
	var timecode = function(ms) {
		var hms = function(ms) {
				return {
					h: Math.floor(ms / (60 * 60 * 1000)),
					m: Math.floor(ms / 60000 % 60),
					s: Math.floor(ms / 1000 % 60)
				};
			}(ms),
			tc = [];
		if(hms.h > 0) {
			tc.push(hms.h);
		}
		tc.push(hms.m < 10 && hms.h > 0 ? '0' + hms.m : hms.m);
		tc.push(hms.s < 10 ? '0' + hms.s : hms.s);
		return tc.join(':');
	};

	$.fn.soundcloud = function(options) {
		return this.each(function() {
			(new soundcloud(this, options));
		});
	};

})();
