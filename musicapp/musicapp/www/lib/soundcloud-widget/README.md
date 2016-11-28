#Soundcloud Widget
Creates a Soundcloud widget

## Getting Started

Include using Bower (all scripts are located within `bower_components` directory):

```sh
bower install soundcloud-widget
```

OR, download zip and include scripts manually. All production-ready scripts are in the `dist` directory.

```html
<script src="http://code.jquery.com/jquery-1.11.2.min.js"></script>
<script src="soundcloud-widget.js"></script>
```

### Proxy
Soundcloud is not allowing certain headers that are standard in Safari to be sent along with the API request, so for now we use the `proxy.php` file located in the root directory of this repo. 

### Styles
Include css file in head:

```html
<link rel="stylesheet" href="soundcloud-widget.css">
```


### Set Up the Widget

```html
<div class="my-class"></div>
```


```javascript
$('.player').soundcloud({
    key: '*******',
    playlists: [
        'https://soundcloud.com/tobiasvanschneider/sets/fade',
        'https://soundcloud.com/mattb0t/sets/chillhouse',
        'https://soundcloud.com/mattb0t/sets/futrmsic',
        'https://soundcloud.com/alexboogie/sets/comme-de-fuk-down-v1-nov12',
        'https://soundcloud.com/alexboogie/sets/m-xt-pe5',
        'https://soundcloud.com/alexboogie/sets/perpetual'
    ]
});
```

Option | Type | Default | Description
------ | ---- | ------- | -----------
key|string|null|Soundcloud API key 
playlists|array|null|Array of playlist links
autoPlay|bool|true|Whether or not we should attempt to autoplay when songs are changed or playlists are loaded
serverSideScript|string|'proxy.php'|Path to proxy script 
skin|string|'spoticloud'|Skin to use for widget
scrubberSpeed|int|250|How often to update scubber on front end (milliseconds)