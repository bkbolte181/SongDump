-----------------------------------------------------------------------------------------
--
-- main.lua
--
-----------------------------------------------------------------------------------------

-- 

display.setDefault( "background", 0, 300, 455)

local image = display.newImageRect( "songdumpCover.png", 340, 340)
image:translate(160, 50 )
		
local myTextObject = display.newText( "Now Playing", 160, 220, "Arial", 25)
myTextObject:setFillColor(255, 255, 255)

local widget = require( "widget" )

--creates a count for the number of likes versus the number of dislikes 
local count = 0
local json = require "json"

--DOING POST REQUESTS NOW

local function finishStream(event)
	local url = "http://75d3c64d.ngrok.com/"
	local body = "latitude=" .. latitude .. "&longitude=" .. longitude
	params = {}
	params.body = body
	network.request(url .. "current/", "POST", networkListener, params)
end

local function playSong(event)
	if (event.isError) then
		print("Neywork error, download failed")
	elseif (event.phase == "began") then
		print("Progress began")
	elseif (event.phase == "progress") then
		local bTransferred = event.bytesTransferred
		local bEstimated = event.bytesEstimated
		
		print(event.bytesTransferred, event.bytesEstimated)
		
		if bTransferred >= bEstimated / 2 then
			backgroundMusic = audio.loadStream('local.mp3', system.TemporaryDirectory)
			backgroundMusicChannel = audio.play(backgroundMusic, {channel=1, loops=-1, fadein=5000})
		end
	elseif (event.phase == "ended") then
		
	end
end

local function networkListener(event)
	if (event.isError) then
		print("Network error")
	else
		local t = json.decode(event.response)
		allsongs = t.songs
		for key, song in pairs(allsongs) do
			local params = {}
			myTextObject.text = song.name .. ' (' .. t.server .. ')  '
			params.progress = true
			network.download(
				song.url,
				"GET",
				playSong,
				params,
				"local.mp3",
				system.TemporaryDirectory
			)
			print(song.url)
			break
		end
	end
end

-- Function to handle button events
local function handleButtonEvent( event )

	if ( "ended" == event.phase ) then
		local url = "http://75d3c64d.ngrok.com/"
		local body = "latitude=" .. latitude .. "&longitude=" .. longitude
		params = {}
		params.body = body
		network.request(url .. "current/", "POST", networkListener, params)
    end
end

--Should mute the song
local function handleMuteButton( event )
	
	if audio.getVolume()==1 then
		audio.setVolume(0)
		print( "Muting the songs" )
	else
		audio.setVolume(1)
	end
end

-- Create the widget
local button1 = widget.newButton
{
    label = "button",
    onEvent = handleButtonEvent,
    emboss = false,
    --properties for a rounded rectangle button...
    shape="roundedRect",
    width = 100,
    height = 80,
    cornerRadius = 5,
    fillColor = { default={ 255, 255, 255, 1 }, over={ 1, 0.1, 0.7, 0.4 } },
    strokeColor = { default={ 0, 0, 0, 1 }, over={ 0.8, 0.8, 1, 1 } },
    strokeWidth = 4
}

local muteButton = widget.newButton
{
    label = "button",
    onPress = handleMuteButton,
    emboss = false,
    --properties for a rounded rectangle button...
    shape="roundedRect",
    width = 100,
    height = 80,
    cornerRadius = 5,
    fillColor = { default={ 255, 255, 255, 1 }, over={ 1, 0.1, 0.7, 0.4 } },
    strokeColor = { default={ 0, 0, 0, 1 }, over={ 0.8, 0.8, 1, 1 } },
    strokeWidth = 4
}

-- Center the buttons
button1.x = 70
button1.y = 450

muteButton.x = 250
muteButton.y = 450


-- Change the button's label text
muteButton:setLabel( "Mute" )
button1:setLabel( "Start")


local function inputListener( event )
    if event.phase == "began" then

        -- user begins editing textBox
        print( event.text )

    elseif event.phase == "ended" then

        -- do something with textBox's text

    elseif event.phase == "editing" then

        print( event.newCharacters )
        print( event.oldText )
        print( event.startPosition )
        print( event.text )

    end
end

--local textBox = native.newTextBox( 160, 340, 280, 45 )
--textBox.text = "This is line 1.\nAnd this is line2"
--textBox.isEditable = true
--textBox:addEventListener( "userInput", inputListener )


--Creates a way to get the latitude and longitude of the owner
local locationHandler = function(event)
	if (event.errorCode) then
		native.showAlert("GPS Location Error", event.errorMessage, {"OK"} )
		print("Location error: " .. tostring(event.errorMessage))
	else
		latitude = event.latitude
		longitude = event.longitude
		print("Latitude: " .. latitude .. ", Longitude: " .. longitude)
	end
end

Runtime:addEventListener("location", locationHandler)


