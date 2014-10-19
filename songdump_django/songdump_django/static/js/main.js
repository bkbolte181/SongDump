$(document).ready(function() {
	// Pass the current location and get the current song in the playlist
	updateSongs()
	browse()
	addTooltips()
})

function addTooltips() {
	$('.tooltip').each(function(index) {
		var pos = $(this).offset();
		var tw = pos.left + $(this).width() + 5;
		var th = pos.top;
		$(this).append('<div class="tooltip-text">' + $(this).attr('tooltip') + '</div>');
		$(this).css({
			'cursor': 'default',
		});
		$(this).children('.tooltip-text').each(function(index) {
			$(this).css({
				'display': 'none',
				'font-size': '10px',
				'position': 'fixed',
				'background-color': 'black',
				'color': 'white',
				'padding': '2px 4px 2px 4px',
				'max-width': '200px',
			});
			$(this).offset({
				top: th,
				left: tw,
			});
		});
	});
}

function updateSongs() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			// If the user's position was found successfully
			$.ajax({
				type: "POST",
				url: "current/",
				data: {
					csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value,
					latitude: position.coords.latitude, // Current user's latitude
					longitude: position.coords.longitude, // Current user's longitude
				},
				success: function(data) {
					if (data.error == true) {
						$('.playlist').html('An internal error occured.');
					} else {
						$('.playlist').html('');
						for (var song in data.songs) {
							// Loop through returned songs and print out some information about them
							mysong = data.songs[song]
							$('.playlist').append('<div onclick="playSong(' + mysong.id + ',this)" class="playback"></div><audio id="' + mysong.id + '" controls><source src="' + mysong.url + '" type="audio/mpeg" /></audio>');
						}
						$('.playback').each(function() {
							var divsize = 50; //((Math.random()*100) + 50).toFixed();
							var posx = (($(document).width() - divsize) + Math.random() * ($(document).width() - divsize)) / 2;
							var posy = (($(document).height() - divsize) + Math.random() * ($(document).height() - divsize)) / 2;
							//var posx = Math.floor((Math.random() * ($(document).width() - divsize)).toFixed()/(2*divsize)+($(document).width() - divsize).toFixed()/2)*divsize;
							//var posy = Math.floor((Math.random() * ($(document).height() - divsize)).toFixed()/(2*divsize)+($(document).height() - divsize).toFixed()/2)*divsize;
							$(this).css({
								'background-color': 'rgb('+(Math.floor(Math.random()*256))+','+(Math.floor(Math.random()*256))+','+(Math.floor(Math.random()*256))+')',
								'width': divsize,
								'height': divsize,
								'position': 'absolute',
								'top': posy+'px',
								'left': posx+'px',
							});
						});
					}
				}
			});
		}, function() {
			$('.playlist').html('Your position could not be located.');
		});
	} else {
		$('.playlist').html('Sorry, your browser does not support reolcation.');
	}
}

function browse() {
	// Load a bunch of random songs
	$.ajax({
		type: "POST",
		url: "browse/",
		data: {
			csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value
		},
		success: function(data) {
			array = data.results;
			console.log(array.length)
			var tmp, current, top = array.length;
			
			if (top) while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
			
			for (var i = 0; i < 10; i++) {
				$('.browse').append('<div><a href="javascript:addSong(' + array[i].id + ')">' + array[i].title + '</a></div>');
			}
		},
	});
}

function addSong(id) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			// If the user's position was found successfully
			$.ajax({
				type: "POST",
				url: "add/",
				data: {
					csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value,
					latitude: position.coords.latitude, // Current user's latitude
					longitude: position.coords.longitude, // Current user's longitude
					song_id: id
				},
				success: function(data) {
					updateSongs()
				}
			});
		}, function() {
			alert('Your browser does not support geolocation.');
		});
	}
}

function vote(val) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			// If the user's position was found successfully
			$.ajax({
				type: "POST",
				url: "vote/",
				data: {
					csrfmiddlewaretoken:document.getElementsByName('csrfmiddlewaretoken')[0].value,
					latitude: position.coords.latitude, // Current user's latitude
					longitude: position.coords.longitude, // Current user's longitude
					vote: val
				},
				success: function(data) {
					updateSongs()
				}
			});
		}, function() {
			alert('Your browser does not support geolocation.');
		});
	}
}

function playSong(id,playbtn) {
	obj = document.getElementById(id);
	if (obj.paused) {
		obj.play();
		playbtn.style.opacity = '0.5';
	} else {
		obj.pause();
		playbtn.style.opacity = '1';
	}
}

$('.tooltip').mouseover(function() {
	$(this).children('.tooltip-text').each(function(index) {
		$(this).css({
			'display': 'block',
		});
	});
});

$('.tooltip').mouseout(function() {
	$(this).children('.tooltip-text').css('display', 'none');
});