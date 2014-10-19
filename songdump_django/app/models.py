from django.conf import settings
from django.db import models
from datetime import datetime

class Node(models.Model):
	# Model for a node somewhere (e.g. at the DUC)
	latitude = models.DecimalField(max_digits = 20, decimal_places = 10)
	longitude = models.DecimalField(max_digits = 20, decimal_places = 10)
	name = models.CharField(max_length=100, default='')

class Song(models.Model):
	url = models.URLField(max_length=500)
	name = models.CharField(max_length=100)
	votes = models.IntegerField(default=0)
	md_id = models.IntegerField(default=0)
	node = models.ForeignKey(Node, related_name='songs', related_query_name='song', default=1)

class SiteUser(models.Model):
	# When they last uploaded a song
	last_song = models.DateTimeField(auto_now_add=True)
	latitude = models.DecimalField(max_digits = 20, decimal_places = 10)
	longitude = models.DecimalField(max_digits = 20, decimal_places = 10)
	node = models.ForeignKey(Node, related_name='users', related_query_name='user', default=1)
	
	def save(self, node=None, *args, **kwargs):
		super(SiteUser, self).save(*args, **kwargs)

class MusicDealersAuth(models.Model):
	auth_token = models.CharField(max_length=200)