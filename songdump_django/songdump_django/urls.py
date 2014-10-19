from django.conf.urls import patterns, include, url
from django.contrib import admin

import views

urlpatterns = patterns('',
	# Main landing page
    url(r'^$', views.index, name='index'),
	
	# AJAX for getting current song
	url(r'^current/$', views.current_song, name='current'),
	
	# AJAX for adding song to playlist
	url(r'add/$', views.add_song, name='add'),
	
	# AJAX for browsing songs
	url(r'browse/$', views.browse, name='add'),
	
	# AJAX for voting
	url(r'vote/$', views.vote, name='vote'),
)
