from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from django.views import generic
from django.contrib.auth.models import User

from random import randrange

from django.views.decorators.csrf import csrf_exempt

from react import jsx

import urllib, urllib2

import json

from app.models import *

max = 0.0027 # 300 meters approximated in degrees (obviously not the best, but workable)

def updateAuthentication():
	''' Updates Music Dealers authentication token '''
	# Authentication model object
	auth_obj = MusicDealersAuth.objects.first()
	
	# URL for authentication api
	auth_url = 'https://api.musicdealers.com/authentication/login'
	values = {'username': 'b.k.bolte@emory.edu', 'password': 'kichline'}
	data = urllib.urlencode(values)
	req = urllib2.Request(auth_url, data)
	response = urllib2.urlopen(req).read()
	results = json.loads(response)
	auth_obj.auth_token = results['token']
	auth_obj.save()

def getClosestNode(latitude, longitude):
	''' Gets the node closest to this lat/long '''
	n = Node.objects.filter(latitude__lt=latitude+0.0027, latitude__gt=latitude-0.0027, longitude__lt=longitude+0.0027, longitude__gt=longitude-0.00027)
	return n.order_by('latitude', 'longitude').first() or None

def getSongData(request, part='songs', page=1):
	''' Retrieve data related to a single song id '''
	auth = MusicDealersAuth.objects.first()
	url = 'https://api.musicdealers.com/' + part
	data = {}
	if 'song_id' in request.POST:
		data['songs[]'] = int(request.POST['song_id'])
	if 'genre' in request.POST:
		data['genre[]'] = request.POST['genre']
	data['page'] = page
	url_data = urllib.urlencode(data)
	url = url + '?' + url_data
	req = urllib2.Request(url, headers={'X-Auth-Token': auth.auth_token})
	try:
		contents = urllib2.urlopen(req).read()
		results = json.loads(contents)
	except urllib2.HTTPError, err:
		# Need to update auth token and re-run
		if err.code == 401:
			updateAuthentication()
			return getSongData(id)
		else:
			raise
	return results

def index(request):
	''' Main landing page '''
	context = {}
	return render(request, 'index.html', context)

@csrf_exempt
def current_song(request):
	''' Return the url for streaming the current song '''
	try:
		latitude = float(request.POST['latitude'])
		longitude = float(request.POST['longitude'])
		node = getClosestNode(latitude, longitude)
		if not node:
			''' There are no nodes within range '''
			return HttpResponse(json.dumps({'error': 'true', 'code': 'notnearnode'}), content_type='application/json')
			
		# Generate response for first three elements
		songs = node.songs.all()
		node_json = {'error': 'false'}
		node_json['server'] = node.name
		songs_dict = {}
		for i in range(0, songs.count()):
			song = songs[i]
			songs_dict[song.name] = {'name': song.name, 'url': song.url, 'votes': song.votes, 'id': song.id, 'position': i}
		node_json['songs'] = songs_dict
	except KeyError:
		return HttpResponse(json.dumps({'error': 'true', 'code': 'KeyError'}), content_type='application/json')
	# Return the next three songs in the playlist
	return HttpResponse(json.dumps(node_json), content_type='application/json')

def add_song(request):
	''' Add song to the current playlist '''
	if request.is_ajax():
		try:
			# Music Dealers ID of the song being added
			song = getSongData(request)
			result = {'error': 'false'}
			result.update(song)
			print song
			song = song['results'][0]
			
			latitude = float(request.POST['latitude'])
			longitude = float(request.POST['longitude'])
			node = getClosestNode(latitude, longitude)
			if not node:
				print 'no node'
				return HttpResponse(json.dumps({'error': 'true'}), content_type='application/json')
			
			m = Song.objects.create(url=song['mp3_file_path'], name=song['title'], votes=0, md_id=song['id'], node=node)
			m.save()
			while node.songs.count() > 5:
				node.songs.all()[randrange(5)].delete()
			return HttpResponse(json.dumps(result), content_type='application/json')
		except Exception, e:
			print str(e)
			return HttpResponse(json.dumps({'error': 'true'}), content_type='application/json')
	else:
		raise Http404

def browse(request):
	if request.is_ajax():
		try:
			songs = getSongData(request, page=randrange(4342))
			result = {'error': 'false'}
			result.update(songs)
			return HttpResponse(json.dumps(result), content_type='application/json')
		except:
			return HttpResponse(json.dumps({'error': 'true'}), content_type='application/json')
	else:
		raise Http404

def vote(request):
	''' Upvote or downvote the current song '''
	if request.is_ajax():
		try:
			latitude = float(request.POST['latitude'])
			longitude = float(request.POST['longitude'])
			vote = request.POST['vote']
			id = request.POST['song']
			current_song = Song.objects.get(id=id)
			if vote == 'down':
				current_song.votes = current_song.votes - 1
				current_song.save()
			elif vote == 'up':
				current_song.votes = current_song.votes + 1
				current_song.save()
			if current_song.votes <= -5:
				current_song.delete()
			return HttpResponse(json.dumps({'error': 'false'}), content_type='application/json')
		except:
			return HttpResponse(json.dumps({'error': 'true'}), content_type='application/json')
	else:
		raise Http404