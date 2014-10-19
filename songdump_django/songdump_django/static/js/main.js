$(document).ready(function() {
	// Pass the current location and get the current song in the playlist
	updateSongs()
	browse()
})

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
							$('.playlist').append('<div rel="tooltip" title="' + mysong.name + ' (' + mysong.votes + ')" onclick="playSong(' + mysong.id + ',this)" class="playback"></div><div class="voting ' + mysong.id + '">' + mysong.name + ' <a href="javascript:vote(\'up\',' + mysong.id + ')"><span class="glyphicon glyphicon-chevron-up"></span></a><a href="javascript:vote(\'down\',' + mysong.id + ')"><span class="glyphicon glyphicon-chevron-down"></span></a><audio id="' + mysong.id + '" controls><source src="' + mysong.url + '" type="audio/mpeg" /></audio>');
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
						$('[rel=tooltip]').tooltip()
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

function vote(val, id) {
	$('.'+id).css({'display': 'none'});
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
					vote: val,
					song: id,
				},
				success: function(data) {
					obj.style.display = 'none';
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