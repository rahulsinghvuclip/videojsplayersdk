window.vivid || (function (window) {
  'use strict';
  /**
     * VVID Player SDK
     * version: 1.0.0
     *
     */
  window.appStartTime = window.appStartTime || (new Date).getTime();
  //Load all dependent files & libraries
  typeof jQuery === 'undefined' && document.write('<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>');
  typeof videojs === 'undefined' && document.write('<script type="text/javascript" src="//s3-ap-southeast-1.amazonaws.com/videojs.vuclip.com/dev/script/video.min.js"></script>');
  typeof videojsihls === 'undefined' && document.write('<script type="text/javascript" src="//s3-ap-southeast-1.amazonaws.com/videojs.vuclip.com/dev/script/videojs-contrib-hls.min.js"></script>');
  typeof videojbrand === 'undefined' && document.write('<script type="text/javascript" src="//s3-ap-southeast-1.amazonaws.com/videojs.vuclip.com/dev/script/videojs-brand.min.js"></script>');
  typeof videojsads === 'undefined' && document.write('<script type="text/javascript" src="//s3-ap-southeast-1.amazonaws.com/videojs.vuclip.com/dev/script/videojs.ads.min.js"></script>');
  typeof videojsima === 'undefined' && document.write('<script type="text/javascript" src="//s3-ap-southeast-1.amazonaws.com/videojs.vuclip.com/dev/script/videojs.ima.min.js"></script>');
  typeof ima === 'undefined' && document.write('<script type="text/javascript" src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>');

  // Ad block detection
  var adBlockEnabled = false;
  var testAd = document.createElement('div');
  testAd.innerHTML = '&nbsp;';
  testAd.className = 'adsbox';
  document.body.appendChild(testAd);
  window.setTimeout(function () {
    if (testAd.offsetHeight === 0) {
      adBlockEnabled = true;
    }
    testAd.remove();
    console.log('AdBlock Enabled? ', adBlockEnabled)
  }, 1);

  var videoDownloaded = false, a = [], lastUptoSeek = [], buffdetails = [], totalSeek = 0, n = 0, timeoutID,
    player = null, loadTime, clickButton, initialization;
    var previousTime = 0;
    var currentTime = 0;
    var seekStart = null;
    var totalSeekDuration=0;

  // private scope of player

  var playerConfig = {

    'onClickButton': function (scope) {
      if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
        scope.player.bigPlayButton.on('touchstart', function (e) {
         
          clickButton = Date.now();
          console.log("hi  " + clickButton);
        });
    } else{
      scope.player.bigPlayButton.on('click', function (e) {
        clickButton = Date.now();
        console.log("hi  " + clickButton);
      });
    }},
    'onVideoPlay': function (scope, configuration) {
      scope.player.on('play', function (e) {
        var z = Date.now();
        if (loadTime == undefined) {
         
          if (configuration.autoplay) {
            loadTime = z - initialization;
          } else {
           
            loadTime = z - clickButton;
          }
        }
        var currentPlayTime = "v," + Date();
       
        buffdetails.push(currentPlayTime);
      
        
        console.log(loadTime);
        console.log("inside play  " + z);
        console.log('video is playing' + scope.durationPlayed());
        amplitude.getInstance('videojs').logEvent('video_playing', {
          'referer': document.referrer,
          'cid': scope.configuration.cid,
          'videoURL': scope.player.currentSource(),
          'currentURL': window.location.href,
          'played_duration': scope.durationPlayed(),
          'siteid': scope.configuration.siteid,
          'slotid': scope.configuration.slotid,
          'pubid': scope.configuration.publisherid,
          'userid': 'mvuclip-' + scope.configuration.userid,
          'sessid': '',
          'loadTime': loadTime,
          'totalBufferTime':getBufferTime(buffdetails),
          'nofTimeVideoSeeked': a,
          'ver': '1.0.0'
        });
        $(window).on('unload', function (scope) {
          _onWindowCloseHandler(scope);
        });
        window.onbeforeunload = function (e) {
          amplitude.getInstance('videojs').logEvent('video_end', {
            'referer': document.referrer,
            'cid': scope.configuration.cid,
            'videoURL': scope.player.currentSource(),
            'currentURL': window.location.href,
            'played_duration': scope.durationPlayed(),
            'siteid': scope.configuration.siteid,
            'slotid': scope.configuration.slotid,
            'pubid': scope.configuration.publisherid,
            'userid': 'mvuclip-' + scope.configuration.userid,
            'sessid': '',
            'loadTime': loadTime,
            'nofTimeVideoSeeked': a,
            'totalBufferTime':getBufferTime(buffdetails),
            'actualDurationPlayed':scope.durationPlayed()-totalSeekDuration,
            'ver': '1.0.0',
            'endType': 'user-end'
          });


        };
        timeoutID = window.setTimeout(function () {
          if ((scope.durationPlayed() > 5) && (scope.durationPlayed() < 6)) {
            amplitude.getInstance('videojs').logEvent('buck_5', {
              'referer': document.referrer,
              'cid': scope.configuration.cid,
              'videoURL': scope.player.currentSource(),
              'currentURL': window.location.href,
              'played_duration': scope.durationPlayed(),
              'siteid': scope.configuration.siteid,
              'slotid': scope.configuration.slotid,
              'pubid': scope.configuration.publisherid,
              'userid': 'mvuclip-' + scope.configuration.userid,
              'sessid': '',
              'nofTimeVideoSeeked': a,
              'ver': '1.0.0'
            });
          }
        }, 6000);

      });
    },
    'onBuffering': function (scope) {
      scope.player.on('waiting', function (e) {
        console.log('video is buffering' + scope.durationPlayed());
        var currentPlayTime = "b," + Date();
        buffdetails.push(currentPlayTime);

        amplitude.getInstance('videojs').logEvent('video_buffering', {
          'referer': document.referrer,
          'cid': scope.configuration.cid,
          'videoURL': scope.player.currentSource(),
          'currentURL': window.location.href,
          'played_duration': scope.durationPlayed(),
          'siteid': scope.configuration.siteid,
          'slotid': scope.configuration.slotid,
          'pubid': scope.configuration.publisherid,
          'userid': 'mvuclip-' + scope.configuration.userid,
          'totalBufferTime':getBufferTime(buffdetails),
          'sessid': '',
          'nofTimeVideoSeeked': a,
          'ver': '1.0.0'
        });
        $(window).on('unload', function (scope) {
          _onWindowCloseHandler(scope);
        });
        window.onbeforeunload = function (e) {
          amplitude.getInstance('videojs').logEvent('video_end', {
            'referer': document.referrer,
            'cid': scope.configuration.cid,
            'videoURL': scope.player.currentSource(),
            'currentURL': window.location.href,
            'played_duration': scope.durationPlayed(),
            'siteid': scope.configuration.siteid,
            'slotid': scope.configuration.slotid,
            'pubid': scope.configuration.publisherid,
            'userid': 'mvuclip-' + scope.configuration.userid,
            'sessid': '',
            'actualDurationPlayed':scope.durationPlayed()-totalSeekDuration,
            'nofTimeVideoSeeked': a,
            'totalBufferTime':getBufferTime(buffdetails),
            'ver': '1.0.0',
            'endType': 'user-end'
          });


        };
      });
    },
    'onVideoPause': function (scope) {
      scope.player.on('pause', function (e) {
        window.clearInterval(timeoutID);
        console.log(loadTime);
        console.log('video is paused' + scope.durationPlayed());
        console.log(scope.configuration.ver);
        amplitude.getInstance('videojs').logEvent('video_paused', {
          'referer': document.referrer,
          'cid': scope.configuration.cid,
          'videoURL': scope.player.currentSource(),
          'currentURL': window.location.href,
          'played_duration': scope.durationPlayed(),
          'siteid': scope.configuration.siteid,
          'slotid': scope.configuration.slotid,
          'pubid': scope.configuration.publisherid,
          'userid': 'mvuclip-' + scope.configuration.userid,
          'totalBufferTime':getBufferTime(buffdetails),
          'sessid': '',
          'nofTimeVideoSeeked': a,
          'ver': '1.0.0'
        });
        $(window).on('unload', function (scope) {
          _onWindowCloseHandler(scope);
        });
        window.onbeforeunload = function (e) {
          amplitude.getInstance('videojs').logEvent('video_end', {
            'referer': document.referrer,
            'cid': scope.configuration.cid,
            'videoURL': scope.player.currentSource(),
            'currentURL': window.location.href,
            'played_duration': scope.durationPlayed(),
            'siteid': scope.configuration.siteid,
            'slotid': scope.configuration.slotid,
            'pubid': scope.configuration.publisherid,
            'userid': 'mvuclip-' + scope.configuration.userid,
            'sessid': '',
            'loadTime': loadTime,
            'nofTimeVideoSeeked': a,
            'totalBufferTime':getBufferTime(buffdetails),
            'actualDurationPlayed':scope.durationPlayed()-totalSeekDuration,
            'ver': '1.0.0',
            'endType': 'user-end'
          });


        };
      });
    },
    'onVideoSeeking': function (scope) {
      scope.player.on('seeking', function (e) {
        if(seekStart === null) {
          seekStart = previousTime;
      }

      });
    },
    'onVideoSeeked': function (scope) {
      scope.player.on('seeked', function (e) {
        console.log('seeked from', seekStart, 'to', currentTime, '; delta:', currentTime - seekStart);
        totalSeekDuration=totalSeekDuration +(currentTime - seekStart);
        seekStart = null;

      });
    },
    'onVideoTimeupdate': function (scope) {
      scope.player.on('timeupdate', function (e) {
        previousTime = currentTime;
        currentTime = scope.durationPlayed();

      });
    },
    'onVideoError': function (e, src, cid, scope) { // Error handel
      console.log(scope.error().message);
      if (scope.error().message && scope.error().code === 4) {
        //  window.location.href = src;
      }
      amplitude.getInstance('videojs').logEvent('player_error', {
        'referer': document.referrer,
        'cid': scope.configuration.cid,
        'videoURL': scope.player.currentSource(),
        'currentURL': window.location.href,
        'played_duration': scope.durationPlayed(),
        'siteid': scope.configuration.siteid,
        'slotid': scope.configuration.slotid,
        'pubid': scope.configuration.publisherid,
        'userid': 'mvuclip-' + scope.configuration.userid,
        'sessid': '',
        'nofTimeVideoSeeked': a,
        'ver': '1.0.0',
        'error': scope.error().message
      });
    },

    'onVideoEnd': function (scope) { // end event
      scope.player.on('ended', function (e) {
        var a = true;
     
        if (a == true) {
          console.log('end');
          amplitude.getInstance('videojs').logEvent('video_end', {
            'referer': document.referrer,
            'cid': scope.configuration.cid,
            'videoURL': scope.player.currentSource(),
            'currentURL': window.location.href,
            'durationPlayed': scope.durationPlayed(),
            'actualDurationPlayed':scope.durationPlayed()-totalSeekDuration,
            'loadTime': loadTime,
            'endType': 'full-video',
            'totalBufferTime':getBufferTime(buffdetails)
          });
          a = false;
        }
      });
    }
  };
  //Videojspalyer class

  var VideoJSPlayer = function (config) {
    var _oThis = this;
    if (!(_oThis instanceof VideoJSPlayer)) {
      return new VideoJSPlayer(config);
    }
    this.configuration = null;
    this.init(config);
  }


  VideoJSPlayer.prototype.init = function (config) {
    var _oThis = this;
    function isMobile() {
      var check = false;
      (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    }
    if (!!document.createElement('video').canPlayType) {
      if (config) {
        this.configuration = {
          'controls': (config && config.controls !== null && config.controls !== undefined) ? config.controls : true,
          'autoplay': (config && config.autoplay !== null && config.autoplay !== undefined) ? config.autoplay : false,
          'mute': (config && config.mute !== null && config.mute !== undefined) ? config.mute : false,
          'preload': (config && config.preload !== null && config.preload !== undefined) ? config.preload : false,
          'loop': (config && config.loop !== null && config.loop !== undefined) ? config.loop : true,
          'auto_resume': (config && config.auto_resume !== null && config.auto_resume !== undefined) ? config.auto_resume : true,
          'playsinline': (config && config.playsinline !== null && config.playsinline !== undefined) ? config.playsinline : true,
          'plugins': {},
          'cid': (config && config.cid !== null && config.cid !== undefined) ? config.cid : '',
          'poster': (config && config.poster !== null && config.poster !== undefined) ? config.poster : '',
          'siteid': (config && config.siteid !== null && config.siteid !== undefined) ? config.siteid : '',
          'slotid': (config && config.slotid !== null && config.slotid !== undefined) ? config.slotid : '',
          'publisherid': (config && config.publisherid !== null && config.publisherid !== undefined) ? config.publisherid : '',
          'productid': (config && config.productid !== null && config.productid !== undefined) ? config.productid : '',
          'userid': (config && config.userid !== null && config.userid !== undefined) ? config.userid : '',
          'dim': (config && config.dim !== null && config.dim !== undefined) ? config.dim : '',
          'brand_icon': (config && config.brand_icon !== null && config.brand_icon !== undefined) ? config.brand_icon : '',
          'brand_text': (config && config.brand_text !== null && config.brand_text !== undefined) ? config.brand_text : '',
          'brand_site': (config && config.brand_site !== null && config.brand_site !== undefined) ? config.brand_site : '',
          'ver': (config && config.build_version !== null && config.build_version !== undefined) ? config.build_version : '',

        };
        var a = true;
        if (videojs.getPlayers()[config.id]) {
          delete videojs.getPlayers()[config.id];
          a = false;
          console.log(videojs.players);
        }
        _oThis.player = videojs(config.id, this.configuration).on('error', function (e) {
          playerConfig.onVideoError(e, config.downloadUrl, config.cid, this)
        });
        initialization = Date.now();
        initializeLog(config, initialization);
        var startEvent = 'click';
        if (navigator.userAgent.match(/iPhone/i) ||
          navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/Android/i)) {
          startEvent = 'touchend';
        }

        _oThis.player.src(config.source);
        _oThis.player.muted(config.mute);
        _oThis.player.bigPlayButton.el().style.zIndex = 1410;

        playerConfig.onClickButton(this);
        playerConfig.onVideoSeeked(this);
        playerConfig.onVideoSeeking(this);
        playerConfig.onVideoTimeupdate(this);
        playerConfig.onVideoPlay(this, this.configuration);
        playerConfig.onVideoPause(this);
        playerConfig.onVideoEnd(this);
        playerConfig.onBuffering(this);
        _oThis.player.brand({
          image: config.brand_icon,
          title: config.brand_text,
          destination: config.brand_site,
          destinationTarget: '_top'
        });
        // Configuration for ad
        if ((config.ad) && (!adBlockEnabled)) {
          _oThis.options = {
            id: config.id,
            autoplay: config.autoplay,
            adTagUrl: config.ad,
            prerollTimeout: 5000,
            timeout: 5000,
            showControlsForJSAds: false
          };
          _oThis.events = [
            google.ima.AdErrorEvent.Type.AD_ERROR,
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            google.ima.AdEvent.Type.CLICK,
            google.ima.AdEvent.Type.COMPLETE,
            google.ima.AdEvent.Type.LOADED,
            google.ima.AdEvent.Type.STARTED,
            google.ima.AdEvent.Type.IMPRESSION,
            google.ima.AdEvent.Type.AD_CAN_PLAY,
          ];

          _oThis.player.ima(
            _oThis.options,
            _oThis.bind(this, this.adsManagerLoadedCallback));

          if (config.autoplay) {
            _oThis.player.ima.initializeAdDisplayContainer();
            _oThis.player.ima.requestAds();
          } else {
            _oThis.player.one(startEvent, function (e) {
              _oThis.player.ima.initializeAdDisplayContainer();
              _oThis.player.ima.requestAds();

            })
          };
          $('.ima-countdown-div').html('');
        } else if ((config.ad) && (adBlockEnabled)) {
          console.log('adblock')
          amplitude.getInstance('videojs').logEvent('ad_block', {})
        }
        return _oThis.player;
      } else {
        console.log('No configuration provided.');
      }
    } else {
      console.log('HTML5 Not supported. Redirecting to download file'); // TODO:- Redirect page to download
      window.location.href = config.downloadUrl;
    }
  };
  //ad prototype

  VideoJSPlayer.prototype.adsManagerLoadedCallback = function () {
    for (var index = 0; index < this.events.length; index++) {
      this.player.ima.addEventListener(
        this.events[index],
        this.bind(this, this.onAdEvent));
    }
    this.player.ima.startFromReadyCallback();
  };

  VideoJSPlayer.prototype.onAdEvent = function (event) {

    var _oThis = this;

    var eventName = 'Ad-' + event.type;
    console.log(eventName);
    amplitude.getInstance('videojs').logEvent(eventName, {
      'ad-title': event.G.g.title,
      'cid': _oThis.configuration.cid,
      'ad-id': event.G.g.adId,
      'ad-duration': event.G.g.duration,
      'ad-description': event.G.g.description,
      'ad-url': event.G.g.clickThroughUrl
    });
  };

  VideoJSPlayer.prototype.bind = function (thisObj, fn) {
    return function () {
      fn.apply(thisObj, arguments);
    };
  };
  //ad end
  VideoJSPlayer.prototype.pause = function () {
    var _oThis = this;
    _oThis.player.pause();
    console.log('pause');
  };
  // VideoJSPlayer.prototype.seeking = function () {
  //   var _oThis = this;
  //   var seeking = _oThis.player.seeking();
  //   console.log('seeking' + seeking);
  // };

  // VideoJSPlayer.prototype.seeked = function () {
  //   var _oThis = this;
  //   var seeking = _oThis.player.seeked();
  //   console.log('seeking' + seeking);
  // };
  VideoJSPlayer.prototype.bufferedPercent = function () {
    var _oThis = this;
    return _oThis.player.bufferedPercent();
  };
  VideoJSPlayer.prototype.durationPlayed = function () {
    var _oThis = this;
    return _oThis.player.currentTime();
  };

  VideoJSPlayer.prototype.onPlaying = function (a) {
    var _oThis = this;
    _oThis.player.on('timeupdate', a);
  };
  VideoJSPlayer.prototype.play = function () {
    var _oThis = this;
    if (_oThis.player) {
      _oThis.player.play();
      console.log('video playing')
    }
  };
  VideoJSPlayer.prototype.onPlay = function (a) {
    var _oThis = this;
    _oThis.player.on('playing', a);
    // _oThis.player.trigger('play');
  };
  VideoJSPlayer.prototype.close = function () {
    var _oThis = this;
    _oThis.player.dispose();
    // _oThis.player.trigger('play');
  };
  //define globally if it doesn't already exist
  window.vivid = VideoJSPlayer;

}(window));

function getBufferTime(ar1) {
  // console.log(new Date());
  var totalbufferitme = 0;
  // // console.log(ar1.length);
  for (var index = 0; index < ar1.length - 1; index++) {
    if (ar1[index].indexOf('b,') !== -1 && ar1[index + 1].indexOf('v,') !== -1) {
      // if (ar1[index].indexOf('b,', -1) && ar1[index + 1].indexOf('v,', -1))
      // {
      var difference = Math.abs(new Date(ar1[index + 1].replace('v,', '').replace('b', '')).getTime() - new Date(ar1[index].replace('v,', '').replace('b', '')).getTime()) / 1000;
      totalbufferitme += difference;

    }
  }

  return totalbufferitme;
}
function initializeLog(config, initialization) {
  console.log("player is initialised" + initialization);
  amplitude.getInstance('videojs').logEvent('video_initialised', {
    'referer': document.referrer,
    'initialisedTime': initialization

  });

};
function _onWindowCloseHandler(scope) {
  return;
}