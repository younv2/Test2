(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"13_220217c_atlas_1", frames: [[0,0,1115,720],[0,722,1115,720]]},
		{name:"13_220217c_atlas_2", frames: [[0,0,1115,720],[0,722,1115,720]]},
		{name:"13_220217c_atlas_3", frames: [[1273,1444,500,500],[561,1718,561,225],[1117,0,561,720],[0,722,826,720],[0,1444,559,418],[1273,722,554,720],[828,722,443,994],[0,0,1115,720]]},
		{name:"13_220217c_atlas_4", frames: [[0,0,400,306],[1129,0,271,207],[402,0,352,210],[1402,0,223,206],[536,466,53,25],[1507,469,56,28],[1507,430,60,37],[1968,444,63,30],[1968,356,63,41],[1318,328,62,42],[1507,386,61,42],[536,437,53,27],[937,0,190,299],[1318,209,74,73],[780,350,139,177],[756,0,179,348],[378,390,156,186],[1318,284,72,42],[1968,399,58,43],[647,528,131,95],[0,486,148,116],[536,390,40,45],[279,486,94,80],[536,528,109,117],[1968,476,46,27],[921,479,152,142],[591,212,138,136],[2007,48,37,35],[2007,85,38,24],[150,486,127,131],[2007,0,39,46],[1318,386,187,175],[1402,208,187,176],[1627,0,188,176],[1780,356,186,176],[1817,0,188,176],[1129,209,187,176],[1627,178,188,176],[402,212,187,176],[1817,178,188,176],[937,301,187,176],[0,308,187,176],[1126,387,187,175],[189,308,187,176],[591,350,187,176],[1591,356,187,176],[1507,534,103,104],[2027,111,18,10],[2007,111,18,13],[1612,534,103,104],[780,529,100,120]]}
];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.currentSoundStreamInMovieclip;
	this.soundStreamDuration = new Map();
	this.streamSoundSymbolsList = [];

	this.gotoAndPlayForStreamSoundSync = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.gotoAndPlay = function(positionOrLabel){
		this.clearAllSoundStreams();
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos != null) { this.startStreamSoundsForTargetedFrame(pos); }
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(this.currentFrame);
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
		this.clearAllSoundStreams();
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
		this.clearAllSoundStreams();
	}
	this.startStreamSoundsForTargetedFrame = function(targetFrame){
		for(var index=0; index<this.streamSoundSymbolsList.length; index++){
			if(index <= targetFrame && this.streamSoundSymbolsList[index] != undefined){
				for(var i=0; i<this.streamSoundSymbolsList[index].length; i++){
					var sound = this.streamSoundSymbolsList[index][i];
					if(sound.endFrame > targetFrame){
						var targetPosition = Math.abs((((targetFrame - sound.startFrame)/lib.properties.fps) * 1000));
						var instance = playSound(sound.id);
						var remainingLoop = 0;
						if(sound.offset){
							targetPosition = targetPosition + sound.offset;
						}
						else if(sound.loop > 1){
							var loop = targetPosition /instance.duration;
							remainingLoop = Math.floor(sound.loop - loop);
							if(targetPosition == 0){ remainingLoop -= 1; }
							targetPosition = targetPosition % instance.duration;
						}
						instance.loop = remainingLoop;
						instance.position = Math.round(targetPosition);
						this.InsertIntoSoundStreamData(instance, sound.startFrame, sound.endFrame, sound.loop , sound.offset);
					}
				}
			}
		}
	}
	this.InsertIntoSoundStreamData = function(soundInstance, startIndex, endIndex, loopValue, offsetValue){ 
 		this.soundStreamDuration.set({instance:soundInstance}, {start: startIndex, end:endIndex, loop:loopValue, offset:offsetValue});
	}
	this.clearAllSoundStreams = function(){
		this.soundStreamDuration.forEach(function(value,key){
			key.instance.stop();
		});
 		this.soundStreamDuration.clear();
		this.currentSoundStreamInMovieclip = undefined;
	}
	this.stopSoundStreams = function(currentFrame){
		if(this.soundStreamDuration.size > 0){
			var _this = this;
			this.soundStreamDuration.forEach(function(value,key,arr){
				if((value.end) == currentFrame){
					key.instance.stop();
					if(_this.currentSoundStreamInMovieclip == key) { _this.currentSoundStreamInMovieclip = undefined; }
					arr.delete(key);
				}
			});
		}
	}

	this.computeCurrentSoundStreamInstance = function(currentFrame){
		if(this.currentSoundStreamInMovieclip == undefined){
			var _this = this;
			if(this.soundStreamDuration.size > 0){
				var maxDuration = 0;
				this.soundStreamDuration.forEach(function(value,key){
					if(value.end > maxDuration){
						maxDuration = value.end;
						_this.currentSoundStreamInMovieclip = key;
					}
				});
			}
		}
	}
	this.getDesiredFrame = function(currentFrame, calculatedDesiredFrame){
		for(var frameIndex in this.actionFrames){
			if((frameIndex > currentFrame) && (frameIndex < calculatedDesiredFrame)){
				return frameIndex;
			}
		}
		return calculatedDesiredFrame;
	}

	this.syncStreamSounds = function(){
		this.stopSoundStreams(this.currentFrame);
		this.computeCurrentSoundStreamInstance(this.currentFrame);
		if(this.currentSoundStreamInMovieclip != undefined){
			var soundInstance = this.currentSoundStreamInMovieclip.instance;
			if(soundInstance.position != 0){
				var soundValue = this.soundStreamDuration.get(this.currentSoundStreamInMovieclip);
				var soundPosition = (soundValue.offset?(soundInstance.position - soundValue.offset): soundInstance.position);
				var calculatedDesiredFrame = (soundValue.start)+((soundPosition/1000) * lib.properties.fps);
				if(soundValue.loop > 1){
					calculatedDesiredFrame +=(((((soundValue.loop - soundInstance.loop -1)*soundInstance.duration)) / 1000) * lib.properties.fps);
				}
				calculatedDesiredFrame = Math.floor(calculatedDesiredFrame);
				var deltaFrame = calculatedDesiredFrame - this.currentFrame;
				if((deltaFrame >= 0) && this.ignorePause){
					cjs.MovieClip.prototype.play.call(this);
					this.ignorePause = false;
				}
				else if(deltaFrame >= 2){
					this.gotoAndPlayForStreamSoundSync(this.getDesiredFrame(this.currentFrame,calculatedDesiredFrame));
				}
				else if(deltaFrame <= -2){
					cjs.MovieClip.prototype.stop.call(this);
					this.ignorePause = true;
				}
			}
		}
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.보라담요 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.핫팩 = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib._131눈 = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib._131눈보라1 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib._131눈보라overlay1 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib._131bg = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib._131안개multiply = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib._131안개 = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib._131나무 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib._132bg = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib._13boy_eye = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib._13boy_eyeClose = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib._13girl_eye = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib._13girl_eyeClose = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib._13man_eye = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();



(lib._13man_eyeClose = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(9);
}).prototype = p = new cjs.Sprite();



(lib._13woman_eye = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(10);
}).prototype = p = new cjs.Sprite();



(lib._13woman_eyeClose = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(11);
}).prototype = p = new cjs.Sprite();



(lib._13의자 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(12);
}).prototype = p = new cjs.Sprite();



(lib._13의자손잡이 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(13);
}).prototype = p = new cjs.Sprite();



(lib._13농부팔 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(14);
}).prototype = p = new cjs.Sprite();



(lib._13농부몸 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(15);
}).prototype = p = new cjs.Sprite();



(lib._13농부얼굴 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(16);
}).prototype = p = new cjs.Sprite();



(lib._13소녀팔 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(17);
}).prototype = p = new cjs.Sprite();



(lib._13소녀다리 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(18);
}).prototype = p = new cjs.Sprite();



(lib._13소녀몸 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(19);
}).prototype = p = new cjs.Sprite();



(lib._13소녀얼굴 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(20);
}).prototype = p = new cjs.Sprite();



(lib._13소녀얼굴_Mouth_C = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(21);
}).prototype = p = new cjs.Sprite();



(lib._13소년몸 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(22);
}).prototype = p = new cjs.Sprite();



(lib._13소년얼굴 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(23);
}).prototype = p = new cjs.Sprite();



(lib._13소년얼굴_M_C = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(24);
}).prototype = p = new cjs.Sprite();



(lib._13여자다리 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(25);
}).prototype = p = new cjs.Sprite();



(lib._13여자몸 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(26);
}).prototype = p = new cjs.Sprite();



(lib._13여자손1 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(27);
}).prototype = p = new cjs.Sprite();



(lib._13여자손2 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(28);
}).prototype = p = new cjs.Sprite();



(lib._13여자얼굴 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(29);
}).prototype = p = new cjs.Sprite();



(lib._13여자얼굴MouthO = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(30);
}).prototype = p = new cjs.Sprite();



(lib.arrow = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.BMP_097e9a86_90ec_4df9_826d_fa027dc9888b = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(31);
}).prototype = p = new cjs.Sprite();



(lib.BMP_15293221_73a4_4ffe_9ad3_ff803d623ce1 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(32);
}).prototype = p = new cjs.Sprite();



(lib.BMP_1a9accfa_acc3_4dae_a722_1e1a68bf0820 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(33);
}).prototype = p = new cjs.Sprite();



(lib.BMP_2fdb16a6_e278_44f0_a4fb_0d0473bdb4ad = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(34);
}).prototype = p = new cjs.Sprite();



(lib.BMP_49ed1adf_9d76_4100_9b79_652db8344cb4 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(35);
}).prototype = p = new cjs.Sprite();



(lib.BMP_4fa06280_3e94_429b_848b_71b40406206b = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(36);
}).prototype = p = new cjs.Sprite();



(lib.BMP_727ca7b7_5170_4833_99e4_3ea70b74b763 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(37);
}).prototype = p = new cjs.Sprite();



(lib.BMP_855920ec_8231_4b73_b791_b5054d697b13 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(38);
}).prototype = p = new cjs.Sprite();



(lib.BMP_98ecd8bd_92fb_42e2_9d07_de75158a12c0 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(39);
}).prototype = p = new cjs.Sprite();



(lib.BMP_b1de6218_15e8_4223_b837_d423089c4dbb = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(40);
}).prototype = p = new cjs.Sprite();



(lib.BMP_b430d713_f421_4067_bfa4_34b35b62000f = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(41);
}).prototype = p = new cjs.Sprite();



(lib.BMP_bb4be64d_a48c_4353_bc48_1b63686aa290 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(42);
}).prototype = p = new cjs.Sprite();



(lib.BMP_bcc51548_319f_4a5d_869e_5dba3f5fe67e = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(43);
}).prototype = p = new cjs.Sprite();



(lib.BMP_cbd5d7c7_fc83_4475_bc01_f607817512ce = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(44);
}).prototype = p = new cjs.Sprite();



(lib.BMP_d591ddbb_ca70_470d_9fc1_241f77696d82 = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(45);
}).prototype = p = new cjs.Sprite();



(lib.duck_rightPage_body = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(46);
}).prototype = p = new cjs.Sprite();



(lib.duck_rightPage_eye = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(47);
}).prototype = p = new cjs.Sprite();



(lib.duck_rightPage_eye_close = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(48);
}).prototype = p = new cjs.Sprite();



(lib.duck_rightPage_Head = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(49);
}).prototype = p = new cjs.Sprite();



(lib.finger = function() {
	this.initialize(ss["13_220217c_atlas_4"]);
	this.gotoAndStop(50);
}).prototype = p = new cjs.Sprite();



(lib.text1 = function() {
	this.initialize(ss["13_220217c_atlas_1"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.text2 = function() {
	this.initialize(ss["13_220217c_atlas_1"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.text3 = function() {
	this.initialize(ss["13_220217c_atlas_2"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.text4 = function() {
	this.initialize(ss["13_220217c_atlas_2"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.text5 = function() {
	this.initialize(ss["13_220217c_atlas_3"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop, this.reversed));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.WarpedAsset_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.BMP_98ecd8bd_92fb_42e2_9d07_de75158a12c0();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,188,176);


(lib.tE5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.text5();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1115,720);


(lib.tE4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.text4();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1115,720);


(lib.tE3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.text3();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1115,720);


(lib.tE2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.text2();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1115,720);


(lib.tE1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.text1();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1115,720);


(lib.Symbol8 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.핫팩();
	this.instance.setTransform(1.85,236.8,0.47,0.47,-90.4483);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol8, new cjs.Rectangle(0,0,236.8,236.8), null);


(lib.Symbol7 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.보라담요();
	this.instance.setTransform(0,0,0.8144,1.1307);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol7, new cjs.Rectangle(0,0,325.8,346), null);


(lib.Symbol4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.arrow();
	this.instance.setTransform(198.9,47.6,0.1851,0.1851,104.9987);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol4, new cjs.Rectangle(0,0,198.9,126.8), null);


(lib.Symbol3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.finger();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol3, new cjs.Rectangle(0,0,100,120), null);


(lib.Symbol2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.arrow();
	this.instance.setTransform(0,19.65,0.1723,0.1722,0,-14.9599,-14.904);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol2, new cjs.Rectangle(0,0,118,185), null);


(lib.Symbol1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.finger();
	this.instance.setTransform(0,61);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol1, new cjs.Rectangle(0,61,100,120), null);


(lib.MomMO = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib._13여자얼굴MouthO();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.MomMO, new cjs.Rectangle(0,0,39,46), null);


(lib.woman_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13여자얼굴();
	this.instance.setTransform(0,0,1.0001,1);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,127,131);


(lib.woman_eye_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13woman_eye();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,61,42);


(lib.woman_eye_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13woman_eyeClose();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,53,27);


(lib.snow_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._131눈();
	this.instance.setTransform(0,0,1,0.9998);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,561.1,225);


(lib.man_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13농부얼굴();
	this.instance.setTransform(0,0,1.0017,1.0012);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,156.3,186.2);


(lib.man_eye_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13man_eye();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,63,41);


(lib.man_eye_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13man_eyeClose();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,62,42);


(lib.girl_eye_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13girl_eyeClose();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,63,30);


(lib.girl = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// girl_eye
	this.instance = new lib._13girl_eye();
	this.instance.setTransform(26,-36);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1636).to({_off:false},0).to({_off:true},1).wait(1052));

	// girl_face
	this.instance_1 = new lib._13소녀얼굴();
	this.instance_1.setTransform(-50,-89,1.0013,0.9999);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1636).to({_off:false},0).to({_off:true},1).wait(1052));

	// girl_arm
	this.instance_2 = new lib._13소녀팔();
	this.instance_2.setTransform(23,25,0.9998,1.002);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1636).to({_off:false},0).to({_off:true},1).wait(1052));

	// Girl_body
	this.instance_3 = new lib._13소녀몸();
	this.instance_3.setTransform(0,0,1.0009,1.0002);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(1636).to({_off:false},0).to({_off:true},1).wait(1052));

	// girl_leg
	this.instance_4 = new lib._13소녀다리();
	this.instance_4.setTransform(3,74,1.0119,1.0157);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(1636).to({_off:false},0).to({_off:true},1).wait(1052));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-50,-89,181.1,206.7);


(lib.Boy_eye_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib._13boy_eyeClose();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,56,28);


(lib.Boy = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Boy_eye
	this.instance = new lib._13boy_eye();
	this.instance.setTransform(44,-26);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1601).to({_off:false},0).to({_off:true},1).wait(1087));

	// Boy_face
	this.instance_1 = new lib._13소년얼굴();
	this.instance_1.setTransform(6,-102,1.0049,1.0047);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1601).to({_off:false},0).to({_off:true},1).wait(1087));

	// Boy_body
	this.instance_2 = new lib._13소년몸();
	this.instance_2.setTransform(-3,-2,1.0027,1.0013);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1601).to({_off:false},0).to({_off:true},1).wait(1087));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,-102,118.6,180.1);


(lib.BG_R = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#000000").s().p("EgrRA4QMAAAhwfMBWjAAAMAAABwfg");
	this.shape.setTransform(277,360);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,554,720);


(lib.Girl_MC = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib._13소녀얼굴_Mouth_C();
	this.instance.setTransform(0,0,0.9051,0.9051);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Girl_MC, new cjs.Rectangle(0,0,36.2,40.8), null);


(lib.duck_face_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.duck_rightPage_Head();
	this.instance.setTransform(43.05,0,1,1,24.4571);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,136.8,137.3);


(lib.duck_eye_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.duck_rightPage_eye();
	this.instance.setTransform(4.15,0,1,1,24.4571);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,20.6,16.6);


(lib.duck_eye_close = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.duck_rightPage_eye_close();
	this.instance.setTransform(8.1,0,1,1,38.4564);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,22.2,21.4);


(lib.waterFinger = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// arrow
	this.instance = new lib.Symbol2();
	this.instance.setTransform(108.55,95.55,1,1,0,0,0,58.6,92);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({regX:59,regY:92.5,x:111.15,y:103.8},0).wait(1).to({x:113.4,y:111.6},0).wait(1).to({x:115.65,y:119.35},0).wait(1).to({x:117.9,y:127.15},0).wait(1).to({x:120.15,y:134.9},0).wait(1).to({x:122.4,y:142.7},0).wait(1).to({x:124.65,y:150.5},0).wait(1).to({x:126.9,y:158.25},0).wait(1).to({x:129.15,y:166.05},0).wait(1).to({x:131.35,y:173.8},0).wait(1).to({x:133.6,y:181.6},0).wait(1).to({x:135.85,y:189.35},0).wait(1).to({x:138.1,y:197.15},0).wait(1).to({x:140.35,y:204.95},0).wait(1).to({x:142.6,y:212.7},0).wait(1).to({x:144.85,y:220.5},0).wait(1).to({x:147.1,y:228.25},0).wait(1).to({x:149.35,y:236.05},0).wait(1).to({x:151.55,y:243.8},0).wait(1).to({x:153.8,y:251.6},0).wait(1).to({x:156.05,y:259.4},0).wait(1).to({x:158.3,y:267.15},0).wait(1).to({x:160.55,y:274.95},0).wait(1).to({x:162.8,y:282.7},0).wait(1).to({x:165.05,y:290.5},0).wait(1).to({x:167.3,y:298.25},0).wait(1).to({x:169.55,y:306.05},0).wait(1).to({x:171.8,y:313.85},0).wait(1));

	// finger
	this.instance_1 = new lib.Symbol1();
	this.instance_1.setTransform(13.05,60,1,1,0,0,0,49.9,60);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({regX:50,regY:121,x:19.15,y:135.15},0).wait(1).to({x:25.15,y:149.35},0).wait(1).to({x:31.15,y:163.55},0).wait(1).to({x:37.1,y:177.75},0).wait(1).to({x:43.1,y:191.95},0).wait(1).to({x:49.1,y:206.1},0).wait(1).to({x:55.05,y:220.3},0).wait(1).to({x:61,y:234.5},0).wait(1).to({x:67,y:248.7},0).wait(1).to({x:73,y:262.9},0).wait(1).to({x:78.95,y:277.1},0).wait(1).to({x:84.95,y:291.25},0).wait(1).to({x:90.95,y:305.45},0).wait(1).to({x:96.95,y:319.65},0).wait(1).to({x:102.9,y:333.85},0).wait(1).to({x:108.9,y:348.05},0).wait(1).to({x:114.9,y:362.2},0).wait(1).to({x:120.85,y:376.4},0).wait(1).to({x:126.85,y:390.6},0).wait(1).to({x:132.85,y:404.8},0).wait(1).to({x:138.85,y:419},0).wait(1).to({x:144.8,y:433.2},0).wait(1).to({x:150.8,y:447.35},0).wait(1).to({x:156.8,y:461.55},0).wait(1).to({x:162.75,y:475.75},0).wait(1).to({x:168.75,y:489.95},0).wait(1).to({x:174.75,y:504.15},0).wait(1).to({x:180.75,y:518.35},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-36.8,3.6,267.6,574.8);


(lib.towel_finger = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// arrow
	this.instance = new lib.Symbol4();
	this.instance.setTransform(23.1,-41.15,1,1,0,0,0,99.5,63.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({regX:99.4,x:15.3,y:-43.65},0).wait(1).to({x:7.6,y:-46.2},0).wait(1).to({x:-0.15,y:-48.75},0).wait(1).to({x:-7.85,y:-51.3},0).wait(1).to({x:-15.55,y:-53.8},0).wait(1).to({x:-23.3,y:-56.35},0).wait(1).to({x:-31,y:-58.9},0).wait(1).to({x:-38.75,y:-61.45},0).wait(1).to({x:-46.45,y:-63.95},0).wait(1).to({x:-54.15,y:-66.5},0).wait(1).to({x:-61.9,y:-69.05},0).wait(1).to({x:-69.6,y:-71.6},0).wait(1).to({x:-77.35,y:-74.1},0).wait(1).to({x:-85.05,y:-76.65},0).wait(1).to({x:-92.75,y:-79.2},0).wait(1).to({x:-100.5,y:-81.75},0).wait(1).to({x:-108.2,y:-84.25},0).wait(1).to({x:-115.95,y:-86.8},0).wait(1).to({x:-123.65,y:-89.35},0).wait(1).to({x:-131.35,y:-91.9},0).wait(1).to({x:-139.1,y:-94.4},0).wait(1).to({x:-146.8,y:-96.95},0).wait(1).to({x:-154.55,y:-99.5},0).wait(1).to({x:-162.25,y:-102.05},0).wait(1).to({x:-169.95,y:-104.55},0).wait(1).to({x:-177.7,y:-107.1},0).wait(1).to({x:-185.4,y:-109.65},0).wait(1).to({x:-193.15,y:-112.2},0).wait(1));

	// finger
	this.instance_1 = new lib.Symbol3();
	this.instance_1.setTransform(0,60,1,1,0,0,0,50,60);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({x:-11.85,y:57.35},0).wait(1).to({x:-23.7,y:54.7},0).wait(1).to({x:-35.6,y:52.05},0).wait(1).to({x:-47.45,y:49.4},0).wait(1).to({x:-59.3,y:46.75},0).wait(1).to({x:-71.2,y:44.1},0).wait(1).to({x:-83.05,y:41.45},0).wait(1).to({x:-94.9,y:38.8},0).wait(1).to({x:-106.8,y:36.15},0).wait(1).to({x:-118.65,y:33.5},0).wait(1).to({x:-130.5,y:30.85},0).wait(1).to({x:-142.4,y:28.2},0).wait(1).to({x:-154.25,y:25.55},0).wait(1).to({x:-166.15,y:22.9},0).wait(1).to({x:-178,y:20.25},0).wait(1).to({x:-189.85,y:17.6},0).wait(1).to({x:-201.75,y:14.95},0).wait(1).to({x:-213.6,y:12.3},0).wait(1).to({x:-225.45,y:9.65},0).wait(1).to({x:-237.35,y:7},0).wait(1).to({x:-249.2,y:4.35},0).wait(1).to({x:-261.05,y:1.7},0).wait(1).to({x:-272.95,y:-0.95},0).wait(1).to({x:-284.8,y:-3.6},0).wait(1).to({x:-296.65,y:-6.25},0).wait(1).to({x:-308.55,y:-8.9},0).wait(1).to({x:-320.4,y:-11.55},0).wait(1).to({x:-332.3,y:-14.25},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-382.3,-175.6,504.8,295.6);


(lib.PuppetShape_5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_b1de6218_15e8_4223_b837_d423089c4dbb();
	this.instance_1.setTransform(0.4,-0.75);

	this.instance_2 = new lib.BMP_d591ddbb_ca70_470d_9fc1_241f77696d82();
	this.instance_2.setTransform(0.25,-0.55);

	this.instance_3 = new lib.BMP_15293221_73a4_4ffe_9ad3_ff803d623ce1();
	this.instance_3.setTransform(0.15,-0.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.7,188,176.7);


(lib.PuppetShape_4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_2fdb16a6_e278_44f0_a4fb_0d0473bdb4ad();
	this.instance_1.setTransform(1.3,-0.5);

	this.instance_2 = new lib.BMP_4fa06280_3e94_429b_848b_71b40406206b();
	this.instance_2.setTransform(0.95,-0.55);

	this.instance_3 = new lib.BMP_bcc51548_319f_4a5d_869e_5dba3f5fe67e();
	this.instance_3.setTransform(0.65,-0.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.6,188,176.6);


(lib.PuppetShape_3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_1a9accfa_acc3_4dae_a722_1e1a68bf0820();
	this.instance_1.setTransform(-0.05,0.2);

	this.instance_2 = new lib.BMP_855920ec_8231_4b73_b791_b5054d697b13();
	this.instance_2.setTransform(0.45,0);

	this.instance_3 = new lib.BMP_cbd5d7c7_fc83_4475_bc01_f607817512ce();
	this.instance_3.setTransform(0.85,-0.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.2,188,176.39999999999998);


(lib.PuppetShape_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_b430d713_f421_4067_bfa4_34b35b62000f();
	this.instance_1.setTransform(0.25,-0.2);

	this.instance_2 = new lib.BMP_727ca7b7_5170_4833_99e4_3ea70b74b763();
	this.instance_2.setTransform(0.2,-0.05);

	this.instance_3 = new lib.BMP_49ed1adf_9d76_4100_9b79_652db8344cb4();
	this.instance_3.setTransform(0.1,0.05);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.2,188.2,176.29999999999998);


(lib.PuppetShape_1복사본 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_097e9a86_90ec_4df9_826d_fa027dc9888b();
	this.instance_1.setTransform(0.05,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,188,176);


(lib.PuppetShape_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.WarpedAsset_1("synched",0);

	this.instance_1 = new lib.BMP_bb4be64d_a48c_4353_bc48_1b63686aa290();
	this.instance_1.setTransform(0.05,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,188,176);


(lib.hotpack_interaction = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {waterFadeout:1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_23 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(23).call(this.frame_23).wait(1));

	// Layer_1
	this.instance = new lib.핫팩();
	this.instance.setTransform(-116.55,118.4,0.47,0.47,-90.4483);

	this.instance_1 = new lib.Symbol8();
	this.instance_1.setTransform(0,0,1,1,0,0,0,118.4,118.4);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({_off:false},0).wait(1).to({alpha:0.9545},0).wait(1).to({alpha:0.9091},0).wait(1).to({alpha:0.8636},0).wait(1).to({alpha:0.8182},0).wait(1).to({alpha:0.7727},0).wait(1).to({alpha:0.7273},0).wait(1).to({alpha:0.6818},0).wait(1).to({alpha:0.6364},0).wait(1).to({alpha:0.5909},0).wait(1).to({alpha:0.5455},0).wait(1).to({alpha:0.5},0).wait(1).to({alpha:0.4545},0).wait(1).to({alpha:0.4091},0).wait(1).to({alpha:0.3636},0).wait(1).to({alpha:0.3182},0).wait(1).to({alpha:0.2727},0).wait(1).to({alpha:0.2273},0).wait(1).to({alpha:0.1818},0).wait(1).to({alpha:0.1364},0).wait(1).to({alpha:0.0909},0).wait(1).to({alpha:0.0455},0).wait(1).to({alpha:0},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-118.4,-118.4,236.8,236.8);


(lib.woman_eye = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// woman_eyeClose
	this.instance = new lib.woman_eye_M("synched",0);
	this.instance.setTransform(27.5,17.5,1,1,0,0,0,26.5,13.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(50).to({_off:false},0).to({y:20},12).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,54,33.5);


(lib.woman = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// woman_eye
	this.instance = new lib.woman_eye_move("synched",0);
	this.instance.setTransform(60.5,-6,1,1,0,0,0,30.5,21);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1652).to({_off:false},0).to({y:7},33).wait(668).to({startPosition:0},0).to({_off:true},1).wait(335));

	// woman_face
	this.instance_1 = new lib.woman_move("synched",0);
	this.instance_1.setTransform(62.5,-28.5,1,1,0,0,0,63.5,65.5);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1652).to({_off:false},0).to({y:-15.5},33).wait(668).to({startPosition:0},0).to({_off:true},1).wait(335));

	// woman_rightHand
	this.instance_2 = new lib._13여자손1();
	this.instance_2.setTransform(61,99,0.9999,0.9989);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	// woman_leftHand
	this.instance_3 = new lib._13여자손2();
	this.instance_3.setTransform(5,87,1.007,1.0039);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	// woman_body
	this.instance_4 = new lib._13여자몸();
	this.instance_4.setTransform(3,-4,1.0054,1.0058);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	// chair
	this.instance_5 = new lib._13의자손잡이();
	this.instance_5.setTransform(120,116,1.0043,1.004);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	// woman_leg
	this.instance_6 = new lib._13여자다리();
	this.instance_6.setTransform(-20,119,0.9997,0.9973);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	// chair_all
	this.instance_7 = new lib._13의자();
	this.instance_7.setTransform(-5,-41,1.0001,0.9994);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(1652).to({_off:false},0).wait(701).to({_off:true},1).wait(335));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-20,-94,214.3,354.6);


(lib.snow = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// snow
	this.instance = new lib.snow_M("synched",0);
	this.instance.setTransform(280.5,112.5,1,1,0,0,0,280.5,112.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:420.85,y:287.3},42).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,701.4,399.8);


(lib.man_eye = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// man_eyeClose
	this.instance = new lib.man_eye_M("synched",0);
	this.instance.setTransform(31.15,20.85,1,1,0,0,0,31,21);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(45).to({_off:false},0).to({x:32.5,y:24.45},11).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.1,63.5,45.6);


(lib.man = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// man_eye
	this.instance = new lib.man_eye_move("synched",0);
	this.instance.setTransform(-9.5,3.5,1,1,0,0,0,31.5,20.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1615).to({_off:false},0).to({regX:31.4,rotation:-14.9983,x:-17.25,y:12.35},33).wait(666).to({startPosition:0},0).to({_off:true},1).wait(374));

	// man_face
	this.instance_1 = new lib.man_move("synched",0);
	this.instance_1.setTransform(-2.9,-9.9,1,1,0,0,0,78.1,93.1);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1615).to({_off:false},0).to({regX:78,rotation:-14.9983,x:-14.65,y:-2.7},33).wait(666).to({startPosition:0},0).to({_off:true},1).wait(374));

	// man_body
	this.instance_2 = new lib._13농부몸();
	this.instance_2.setTransform(0,0,1.0052,1.004);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1615).to({_off:false},0).wait(699).to({_off:true},1).wait(374));

	// man_arm
	this.instance_3 = new lib._13농부팔();
	this.instance_3.setTransform(-85,70,1.0016,1.0029);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(1615).to({_off:false},0).wait(699).to({_off:true},1).wait(374));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-114.1,-112.9,294.1,462.29999999999995);


(lib.girl_eye = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.instance = new lib.girl_eye_M("synched",0);
	this.instance.setTransform(31.35,12.3,1,1,0,0,0,31.5,15);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(38).to({_off:false},0).to({x:31.65,y:15.45},5).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.1,-2.7,63.300000000000004,33.2);


(lib.girl_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.girl("synched",1636);
	this.instance.setTransform(115.5,136.6,1,1,0,0,0,65.5,47.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,181.1,206.7);


(lib.duck = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Duck
	this.instance = new lib.PuppetShape_1("synched",1,false);
	this.instance.setTransform(94,88,1,1,0,0,0,94,88);

	this.instance_1 = new lib.PuppetShape_2("synched",1,false);
	this.instance_1.setTransform(94,88,1,1,0,0,0,94,88);
	this.instance_1._off = true;

	this.instance_2 = new lib.PuppetShape_3("synched",1,false);
	this.instance_2.setTransform(94,88,1,1,0,0,0,94,88);
	this.instance_2._off = true;

	this.instance_3 = new lib.PuppetShape_4("synched",1,false);
	this.instance_3.setTransform(94,88,1,1,0,0,0,94,88);
	this.instance_3._off = true;

	this.instance_4 = new lib.PuppetShape_5("synched",1,false);
	this.instance_4.setTransform(94,88,1,1,0,0,0,94,88);
	this.instance_4._off = true;

	this.instance_5 = new lib.PuppetShape_1복사본("synched",1,false);
	this.instance_5.setTransform(94,88,1,1,0,0,0,94,88);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_2}]},3).to({state:[{t:this.instance_3}]},3).to({state:[{t:this.instance_4}]},3).to({state:[{t:this.instance_5}]},3).wait(2));
	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true},2).wait(14));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({_off:false},2).to({_off:true},3).wait(11));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(2).to({_off:false},3).to({_off:true},3).wait(8));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(5).to({_off:false},3).to({_off:true},3).wait(5));
	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(8).to({_off:false},3).to({_off:true},3).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.7,188.2,176.89999999999998);


(lib.Boy_eye = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Boy_eyeClose
	this.instance = new lib.Boy_eye_M("synched",0);
	this.instance.setTransform(27.35,12.5,1,1,0,0,0,28,14);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(57).to({_off:false},0).to({y:16.1},6).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.6,-1.5,56,31.6);


(lib.boy_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.Boy("synched",1601);
	this.instance.setTransform(47.6,140,1,1,0,0,0,44.6,38);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,118.6,180.1);


(lib.girl_eye_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.girl_eye("synched",42);
	this.instance.setTransform(31.4,15.2,1,1,0,0,0,31.5,15);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(44));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.2,-2.5,63.300000000000004,33.2);


(lib.duck_eye_M = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// duck_eye
	this.instance = new lib.duck_eye_close("synched",0);
	this.instance.setTransform(11.1,10.7,1,1,0,0,0,11.1,10.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},14).to({_off:true},1).wait(39).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,22.2,21.4);


(lib.duck_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// duck_eyeClose
	this.instance_6 = new lib.duck_rightPage_eye_close();
	this.instance_6.setTransform(78,23);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1652).to({_off:false},0).to({_off:true},179).wait(806));

	// duck_eye
	this.instance_7 = new lib.duck_rightPage_eye();
	this.instance_7.setTransform(80.2,22.8,1,1,24.4571);

	this.instance_8 = new lib.duck_eye_move("synched",0);
	this.instance_8.setTransform(86.25,31,1,1,0,0,0,10.2,8.2);
	this.instance_8._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_7}]},1652).to({state:[{t:this.instance_8}]},179).to({state:[{t:this.instance_8}]},36).to({state:[{t:this.instance_8}]},663).to({state:[]},1).wait(106));
	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(1831).to({_off:false},0).to({rotation:-45,x:74.2,y:28.45},36).wait(663).to({startPosition:0},0).to({_off:true},1).wait(106));

	// duck_face
	this.instance_9 = new lib.duck_rightPage_Head();
	this.instance_9.setTransform(34.3,-21.05,1,1,24.4571);

	this.instance_10 = new lib.duck_face_move("synched",0);
	this.instance_10.setTransform(59.65,47.65,1,1,0,0,0,68.4,68.7);
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_9}]},1652).to({state:[{t:this.instance_10}]},179).to({state:[{t:this.instance_10}]},36).to({state:[{t:this.instance_10}]},663).to({state:[]},1).wait(106));
	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(1831).to({_off:false},0).to({rotation:-18.7004,x:53.4,y:52.05},36).wait(663).to({startPosition:0},0).to({_off:true},1).wait(106));

	// duck_body
	this.instance_11 = new lib.duck_rightPage_body();
	this.instance_11._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_11).wait(1652).to({_off:false},0).wait(878).to({_off:true},1).wait(106));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-8.7,-21,136.79999999999998,137.3);


(lib.boy_eye_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.Boy_eye("synched",0);
	this.instance.setTransform(28.65,11.9,1,1,0,0,0,28,14);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(64));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-3.6,56,31.6);


(lib.blanket = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {towelFadeout:1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_23 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(23).call(this.frame_23).wait(1));

	// Layer_1
	this.instance = new lib.보라담요();
	this.instance.setTransform(-162.85,-173,0.8144,1.1307);

	this.instance_1 = new lib.Symbol7();
	this.instance_1.setTransform(-0.05,0,1,1,0,0,0,162.8,173);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({_off:false},0).wait(1).to({regX:162.9,x:0.05,alpha:0.9545},0).wait(1).to({alpha:0.9091},0).wait(1).to({alpha:0.8636},0).wait(1).to({alpha:0.8182},0).wait(1).to({alpha:0.7727},0).wait(1).to({alpha:0.7273},0).wait(1).to({alpha:0.6818},0).wait(1).to({alpha:0.6364},0).wait(1).to({alpha:0.5909},0).wait(1).to({alpha:0.5455},0).wait(1).to({alpha:0.5},0).wait(1).to({alpha:0.4545},0).wait(1).to({alpha:0.4091},0).wait(1).to({alpha:0.3636},0).wait(1).to({alpha:0.3182},0).wait(1).to({alpha:0.2727},0).wait(1).to({alpha:0.2273},0).wait(1).to({alpha:0.1818},0).wait(1).to({alpha:0.1364},0).wait(1).to({alpha:0.0909},0).wait(1).to({alpha:0.0455},0).wait(1).to({alpha:0},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-162.8,-173,325.70000000000005,346);


(lib.woman_eye_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.woman_eye("synched",0);
	this.instance.setTransform(29.5,15.1,1,1,0,0,0,30.5,21);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(67));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-1.9,53,29.5);


(lib.man_eye_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.man_eye("synched",0);
	this.instance.setTransform(29.5,17.55,1,1,0,0,0,31,21);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(57));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.3,-3.6,63.3,45.6);


(lib.woman_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.woman("synched",1652);
	this.instance.setTransform(96.6,169.7,1,1,0,0,0,76.6,75.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true},1).wait(2).to({_off:false,startPosition:1655},0).wait(284).to({startPosition:1939},0).to({_off:true},1).wait(414));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,214.3,354.6);


(lib.man_alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.man("synched",1615);
	this.instance.setTransform(175,277.7,1,1,0,0,0,90,174.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(284).to({startPosition:1899},0).to({_off:true},1).wait(415));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-29.1,-9.9,294.1,462.29999999999995);


(lib.girl_move = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.girl_alpha("synched",0);
	this.instance.setTransform(90.5,103.3,1,1,0,0,0,90.5,103.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,181.1,206.7);


(lib.duck_Alpha = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 레이어_1
	this.instance = new lib.duck_1("synched",1652);
	this.instance.setTransform(68.35,80.65,1,1,7.7327,0,0,51.5,52.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(26).to({startPosition:1678},0).to({_off:true},1).wait(151).to({_off:false,startPosition:1830},0).wait(632).to({startPosition:2462},0).to({_off:true},1).wait(68));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,148.3,148.7);


// stage content:
(lib._13_220217c = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.actionFrames = [0,1952];
	this.streamSoundSymbolsList[0] = [{id:"_7131",startFrame:0,endFrame:2642,loop:1,offset:0}];
	// timeline functions:
	this.frame_0 = function() {
		this.clearAllSoundStreams();
		 
		var soundInstance = playSound("_7131",0);
		this.InsertIntoSoundStreamData(soundInstance,0,2642,1);
		let _this = this;
		let isStarted = false;
		
		_this.stop();
		
		_this.on('click', function() {
			if( !isStarted ) {
				isStarted = true;
				_this.play();
				//test
				_this.gotoAndPlay(1940);
			}
		});
		
		
		// Enable touch events on this stage.
		createjs.Touch.enable( stage );
	}
	this.frame_1952 = function() {
		let _this = this;
		let isStarted = false;
		let isClearWater = false;
		let isClearTowel = false;
		
		//오브젝트를 this로 통해 가져올수 있음
		let water = _this.water;
		let waterFinger = _this.waterFinger
		
		let blanket = _this.blanket;
		let blanketFinger = _this.blanketFinger;
		
		const waitMilliSec = 5000;
		
		//터치 범위
		const touchRangeMinX = 740;
		const touchRangeMaxX = 870;
		const touchRangeMinY = 475;
		const touchRangeMaxY = 636;
		
		//핫팩의 시작 범위
		const waterStartPosX = 986.4;
		const waterStartPosY = 597.4;
		//이불의 시작 범위
		const blanketStartPosX = 672.85;
		const blanketStartPosY = 307.0;
		
		_this.stop();
		//씬 플레이 함수
		_this.playScene = function() {
			if( !isStarted ) {
				isStarted = true;
				_this.play();
			}
		};
		//5초가 지날시 playScene 함수 실행
		let skipTimePlay = setTimeout(function() {
			_this.playScene();
		}, waitMilliSec);
		//
		_this.clearPlay = function() {
			if( isClearWater && isClearTowel ) {
				setTimeout(function() {
					_this.playScene();
				}, 1000);
			}
		};
		//오리 범위를 확인하는 함수/ 핫팩이 오리의 범위 안에 없을 경우 false 출력.
		_this.checkDuckRange = function(x, y) {
			if( touchRangeMinX < x && touchRangeMaxX > x &&
				touchRangeMinY < y && touchRangeMaxY > y) {
					return true;
				}
			
			return false;
		};
		
		water.on('mousedown', function(e) {
			if( isClearWater ) return;
			
			waterFinger.visible = false;
			
			clearTimeout(skipTimePlay);
			
			let currMouseX = e.stageX / stage.scaleX;
			let currMouseY = e.stageY / stage.scaleY;
			console.log("currMouseX: ", currMouseX, "currMouseY: ", currMouseY);
			
			water.offsetX = (e.stageX / stage.scaleX) - water.x;
			water.offsetY = (e.stageY / stage.scaleY) - water.y;
		});
		
		water.on('pressmove', function(e) {
			if( isClearWater ) return;
			
			water.x = (e.stageX / stage.scaleX) - water.offsetX;
			water.y = (e.stageY / stage.scaleY) - water.offsetY;
			console.log("waterX: ", water.x, "waterY: ", water.y);
		});
		
		water.on('pressup', function() {
			if( isClearWater ) return;
			
			let isDuckRange = _this.checkDuckRange(water.x, water.y);
			
			if( isDuckRange ) {
				isClearWater = true;
				water.gotoAndPlay("waterFadeout");
				_this.clearPlay();
			} else {
				waterFinger.visible = true;
				water.x = waterStartPosX;
				water.y = waterStartPosY;
			}
		});
		
		
		blanket.on('mousedown', function(e) {
			if( isClearTowel ) return;
			
			blanketFinger.visible = false;
			
			clearTimeout(skipTimePlay);
			
			let currMouseX = e.stageX / stage.scaleX;
			let currMouseY = e.stageY / stage.scaleY;
			console.log("currMouseX: ", currMouseX, "currMouseY: ", currMouseY);
			
			blanket.offsetX = (e.stageX / stage.scaleX) - blanket.x;
			blanket.offsetY = (e.stageY / stage.scaleY) - blanket.y;
		});
		
		blanket.on('pressmove', function(e) {
			if( isClearTowel ) return;
			
			blanket.x = (e.stageX / stage.scaleX) - blanket.offsetX;
			blanket.y = (e.stageY / stage.scaleY) - blanket.offsetY;
		});
		
		blanket.on('pressup', function() {
			if( isClearTowel ) return;
			
			let isDuckRange = _this.checkDuckRange(blanket.x, blanket.y);
			
			if( isDuckRange ) {
				isClearTowel = true;
				blanket.gotoAndPlay("towelFadeout");
				_this.clearPlay();
			} else {
				blanketFinger.visible = true;
				blanket.x = blanketStartPosX;
				blanket.y = blanketStartPosY;
			}
		});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1952).call(this.frame_1952).wait(690));

	// blanketFinger
	this.blanketFinger = new lib.waterFinger();
	this.blanketFinger.name = "blanketFinger";
	this.blanketFinger.setTransform(683.75,341.05,0.62,0.6196,0,0,0,0.2,60.1);
	this.blanketFinger._off = true;

	this.timeline.addTween(cjs.Tween.get(this.blanketFinger).wait(1953).to({_off:false},0).to({_off:true},1).wait(688));

	// blanket
	this.blanket = new lib.blanket();
	this.blanket.name = "blanket";
	this.blanket.setTransform(672.85,307);
	this.blanket._off = true;

	this.timeline.addTween(cjs.Tween.get(this.blanket).wait(1953).to({_off:false},0).to({_off:true},1).wait(688));

	// waterFinger
	this.waterFinger = new lib.towel_finger();
	this.waterFinger.name = "waterFinger";
	this.waterFinger.setTransform(1005,682.8,0.62,0.6196,0,0,0,0,60.1);
	this.waterFinger._off = true;

	this.timeline.addTween(cjs.Tween.get(this.waterFinger).wait(1952).to({_off:false},0).to({_off:true},1).wait(689));

	// water
	this.water = new lib.hotpack_interaction();
	this.water.name = "water";
	this.water.setTransform(986.4,597.4);
	this.water._off = true;

	this.timeline.addTween(cjs.Tween.get(this.water).wait(1952).to({_off:false},0).to({_off:true},1).wait(689));

	// tE_mask (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_94 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_95 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_96 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_97 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_98 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_99 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_100 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_101 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_102 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_103 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_104 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_105 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_106 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_216 = new cjs.Graphics().p("Egi6ADMIAAmXMBF1AAAIAAGXg");
	var mask_graphics_217 = new cjs.Graphics().p("Egi6ADJIAAmRMBF1AAAIAAGRg");
	var mask_graphics_218 = new cjs.Graphics().p("Egi6ADHIAAmNMBF1AAAIAAGNg");
	var mask_graphics_219 = new cjs.Graphics().p("Egi6ADFIAAmJMBF1AAAIAAGJg");
	var mask_graphics_220 = new cjs.Graphics().p("Egi6ADCIAAmDMBF1AAAIAAGDg");
	var mask_graphics_221 = new cjs.Graphics().p("Egi6ADAIAAl/MBF1AAAIAAF/g");
	var mask_graphics_222 = new cjs.Graphics().p("Egi6AC+IAAl7MBF1AAAIAAF7g");
	var mask_graphics_223 = new cjs.Graphics().p("Egi6AC8IAAl3MBF1AAAIAAF3g");
	var mask_graphics_224 = new cjs.Graphics().p("Egi6AC5IAAlxMBF1AAAIAAFxg");
	var mask_graphics_225 = new cjs.Graphics().p("Egi6AC3IAAltMBF1AAAIAAFtg");
	var mask_graphics_226 = new cjs.Graphics().p("Egi6AC1IAAlpMBF1AAAIAAFpg");
	var mask_graphics_227 = new cjs.Graphics().p("Egi6ACzIAAllMBF1AAAIAAFlg");
	var mask_graphics_228 = new cjs.Graphics().p("Egi6ACwIAAlfMBF1AAAIAAFfg");
	var mask_graphics_229 = new cjs.Graphics().p("Egi6ACuIAAlbMBF1AAAIAAFbg");
	var mask_graphics_230 = new cjs.Graphics().p("Egi6ACsIAAlXMBF1AAAIAAFXg");
	var mask_graphics_359 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_360 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_361 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_362 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_363 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_364 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_365 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_366 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_367 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_368 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_369 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_370 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_371 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_372 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_373 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_374 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_481 = new cjs.Graphics().p("EgmMAJEIAAyHMBMZAAAIAASHg");
	var mask_graphics_482 = new cjs.Graphics().p("EgmQAI5IAAxxMBMhAAAIAARxg");
	var mask_graphics_483 = new cjs.Graphics().p("EgmUAItIAAxZMBMpAAAIAARZg");
	var mask_graphics_484 = new cjs.Graphics().p("EgmZAIiIAAxDMBMzAAAIAARDg");
	var mask_graphics_485 = new cjs.Graphics().p("EgmdAIWIAAwrMBM7AAAIAAQrg");
	var mask_graphics_486 = new cjs.Graphics().p("EgmhAILIAAwVMBNDAAAIAAQVg");
	var mask_graphics_487 = new cjs.Graphics().p("EgmlAH/IAAv9MBNLAAAIAAP9g");
	var mask_graphics_488 = new cjs.Graphics().p("EgmqAH0IAAvnMBNVAAAIAAPng");
	var mask_graphics_489 = new cjs.Graphics().p("EgmuAHpIAAvRMBNdAAAIAAPRg");
	var mask_graphics_490 = new cjs.Graphics().p("EgmyAHdIAAu5MBNlAAAIAAO5g");
	var mask_graphics_491 = new cjs.Graphics().p("Egm3AHSIAAujMBNvAAAIAAOjg");
	var mask_graphics_492 = new cjs.Graphics().p("Egm7AHGIAAuLMBN3AAAIAAOLg");
	var mask_graphics_493 = new cjs.Graphics().p("Egm/AG7IAAt1MBN/AAAIAAN1g");
	var mask_graphics_494 = new cjs.Graphics().p("EgnDAGvIAAtdMBOHAAAIAANdg");
	var mask_graphics_495 = new cjs.Graphics().p("EgnIAGkIAAtHMBORAAAIAANHg");
	var mask_graphics_663 = new cjs.Graphics().p("Egi6AH+IAAv7MBF1AAAIAAP7g");
	var mask_graphics_664 = new cjs.Graphics().p("EgjHAIFIAAwJMBGPAAAIAAQJg");
	var mask_graphics_665 = new cjs.Graphics().p("EgjUAIMIAAwXMBGpAAAIAAQXg");
	var mask_graphics_666 = new cjs.Graphics().p("EgjhAITIAAwlMBHDAAAIAAQlg");
	var mask_graphics_667 = new cjs.Graphics().p("EgjuAIaIAAwzMBHdAAAIAAQzg");
	var mask_graphics_668 = new cjs.Graphics().p("Egj7AIhIAAxBMBH3AAAIAARBg");
	var mask_graphics_669 = new cjs.Graphics().p("EgkIAIoIAAxPMBIRAAAIAARPg");
	var mask_graphics_670 = new cjs.Graphics().p("EgkVAIuIAAxbMBIrAAAIAARbg");
	var mask_graphics_671 = new cjs.Graphics().p("EgkiAI1IAAxpMBJFAAAIAARpg");
	var mask_graphics_672 = new cjs.Graphics().p("EgkvAI8IAAx3MBJfAAAIAAR3g");
	var mask_graphics_673 = new cjs.Graphics().p("Egk9AJDIAAyFMBJ7AAAIAASFg");
	var mask_graphics_674 = new cjs.Graphics().p("EglKAJKIAAyTMBKVAAAIAASTg");
	var mask_graphics_675 = new cjs.Graphics().p("EglXAJRIAAyhMBKvAAAIAAShg");
	var mask_graphics_676 = new cjs.Graphics().p("EglkAJYIAAyvMBLJAAAIAASvg");
	var mask_graphics_843 = new cjs.Graphics().p("Egi6AJsIAAzXMBF1AAAIAATXg");
	var mask_graphics_844 = new cjs.Graphics().p("Egi6AJgIAAy/MBF1AAAIAAS/g");
	var mask_graphics_845 = new cjs.Graphics().p("Egi6AJTIAAylMBF1AAAIAASlg");
	var mask_graphics_846 = new cjs.Graphics().p("Egi6AJHIAAyNMBF1AAAIAASNg");
	var mask_graphics_847 = new cjs.Graphics().p("Egi6AI7IAAx1MBF1AAAIAAR1g");
	var mask_graphics_848 = new cjs.Graphics().p("Egi6AIuIAAxbMBF1AAAIAARbg");
	var mask_graphics_849 = new cjs.Graphics().p("Egi6AIiIAAxDMBF1AAAIAARDg");
	var mask_graphics_850 = new cjs.Graphics().p("Egi6AIWIAAwrMBF1AAAIAAQrg");
	var mask_graphics_851 = new cjs.Graphics().p("Egi6AIKIAAwTMBF1AAAIAAQTg");
	var mask_graphics_852 = new cjs.Graphics().p("Egi6AH9IAAv5MBF1AAAIAAP5g");
	var mask_graphics_853 = new cjs.Graphics().p("Egi6AHxIAAvhMBF1AAAIAAPhg");
	var mask_graphics_854 = new cjs.Graphics().p("Egi6AHlIAAvJMBF1AAAIAAPJg");
	var mask_graphics_855 = new cjs.Graphics().p("Egi6AHYIAAuvMBF1AAAIAAOvg");
	var mask_graphics_856 = new cjs.Graphics().p("Egi6AHMIAAuXMBF1AAAIAAOXg");
	var mask_graphics_1042 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1043 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1044 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1045 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1046 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1047 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1048 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1049 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1050 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1051 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1052 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1053 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1054 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1055 = new cjs.Graphics().p("Egi6AC0IAAlnMBF1AAAIAAFng");
	var mask_graphics_1283 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1284 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1285 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1286 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1287 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1288 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1289 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1290 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1291 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1292 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1293 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1294 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1295 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1296 = new cjs.Graphics().p("Egl4ADwIAAnfMBLxAAAIAAHfg");
	var mask_graphics_1591 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1592 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1593 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1594 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1595 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1596 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1597 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1598 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1599 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1600 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1601 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1602 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1603 = new cjs.Graphics().p("Egi6AG4IAAtvMBF1AAAIAANvg");
	var mask_graphics_1779 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1780 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1781 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1782 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1783 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1784 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1785 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1786 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1787 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1788 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1789 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1790 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1791 = new cjs.Graphics().p("Egi6AFKIAAqTMBF1AAAIAAKTg");
	var mask_graphics_1952 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1953 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1954 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1955 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1956 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1957 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1958 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1959 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1960 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1961 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1962 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1963 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1964 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1965 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1966 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_1967 = new cjs.Graphics().p("Egi6ADwIAAnfMBF1AAAIAAHfg");
	var mask_graphics_2090 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2091 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2092 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2093 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2094 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2095 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2096 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2097 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2098 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2099 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2100 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2101 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2102 = new cjs.Graphics().p("Egi6AGQIAAsfMBF1AAAIAAMfg");
	var mask_graphics_2331 = new cjs.Graphics().p("EgkeAFeIAAq7MBI9AAAIAAK7g");
	var mask_graphics_2332 = new cjs.Graphics().p("EgkkAFlIAArJMBJJAAAIAALJg");
	var mask_graphics_2333 = new cjs.Graphics().p("EgkpAFtIAArZMBJTAAAIAALZg");
	var mask_graphics_2334 = new cjs.Graphics().p("EgkvAF0IAArnMBJfAAAIAALng");
	var mask_graphics_2335 = new cjs.Graphics().p("Egk1AF8IAAr3MBJrAAAIAAL3g");
	var mask_graphics_2336 = new cjs.Graphics().p("Egk7AGDIAAsFMBJ3AAAIAAMFg");
	var mask_graphics_2337 = new cjs.Graphics().p("EglBAGLIAAsVMBKDAAAIAAMVg");
	var mask_graphics_2338 = new cjs.Graphics().p("EglHAGSIAAsjMBKPAAAIAAMjg");
	var mask_graphics_2339 = new cjs.Graphics().p("EglMAGZIAAsxMBKZAAAIAAMxg");
	var mask_graphics_2340 = new cjs.Graphics().p("EglSAGhIAAtBMBKlAAAIAANBg");
	var mask_graphics_2341 = new cjs.Graphics().p("EglYAGoIAAtPMBKxAAAIAANPg");
	var mask_graphics_2342 = new cjs.Graphics().p("EgleAGwIAAtfMBK9AAAIAANfg");
	var mask_graphics_2343 = new cjs.Graphics().p("EglkAG3IAAttMBLJAAAIAANtg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:null,x:0,y:0}).wait(94).to({graphics:mask_graphics_94,x:284.5247,y:573.9502}).wait(1).to({graphics:mask_graphics_95,x:284.5247,y:571.95}).wait(1).to({graphics:mask_graphics_96,x:284.5247,y:569.9497}).wait(1).to({graphics:mask_graphics_97,x:284.5247,y:567.9499}).wait(1).to({graphics:mask_graphics_98,x:284.5247,y:565.9501}).wait(1).to({graphics:mask_graphics_99,x:284.5247,y:563.9499}).wait(1).to({graphics:mask_graphics_100,x:284.5247,y:561.9501}).wait(1).to({graphics:mask_graphics_101,x:284.5247,y:559.9499}).wait(1).to({graphics:mask_graphics_102,x:284.5247,y:557.95}).wait(1).to({graphics:mask_graphics_103,x:284.5247,y:555.9502}).wait(1).to({graphics:mask_graphics_104,x:284.5247,y:553.95}).wait(1).to({graphics:mask_graphics_105,x:284.5247,y:551.9497}).wait(1).to({graphics:mask_graphics_106,x:284.5247,y:549.9499}).wait(1).to({graphics:null,x:0,y:0}).wait(109).to({graphics:mask_graphics_216,x:280.4746,y:613.4049}).wait(1).to({graphics:mask_graphics_217,x:280.8176,y:611.8056}).wait(1).to({graphics:mask_graphics_218,x:281.1605,y:610.2063}).wait(1).to({graphics:mask_graphics_219,x:281.5034,y:608.607}).wait(1).to({graphics:mask_graphics_220,x:281.8462,y:607.0072}).wait(1).to({graphics:mask_graphics_221,x:282.1891,y:605.4084}).wait(1).to({graphics:mask_graphics_222,x:282.532,y:603.8086}).wait(1).to({graphics:mask_graphics_223,x:282.8749,y:602.2098}).wait(1).to({graphics:mask_graphics_224,x:283.2179,y:600.61}).wait(1).to({graphics:mask_graphics_225,x:283.5608,y:599.0107}).wait(1).to({graphics:mask_graphics_226,x:283.9037,y:597.4114}).wait(1).to({graphics:mask_graphics_227,x:284.2465,y:595.8121}).wait(1).to({graphics:mask_graphics_228,x:284.5894,y:594.2124}).wait(1).to({graphics:mask_graphics_229,x:284.9323,y:592.6135}).wait(1).to({graphics:mask_graphics_230,x:285.2752,y:591.0858}).wait(1).to({graphics:null,x:0,y:0}).wait(128).to({graphics:mask_graphics_359,x:280.4746,y:663.6501}).wait(1).to({graphics:mask_graphics_360,x:280.4746,y:662.3167}).wait(1).to({graphics:mask_graphics_361,x:280.4746,y:660.9834}).wait(1).to({graphics:mask_graphics_362,x:280.4746,y:659.6501}).wait(1).to({graphics:mask_graphics_363,x:280.4746,y:658.3167}).wait(1).to({graphics:mask_graphics_364,x:280.4746,y:656.9833}).wait(1).to({graphics:mask_graphics_365,x:280.4746,y:655.65}).wait(1).to({graphics:mask_graphics_366,x:280.4746,y:654.3166}).wait(1).to({graphics:mask_graphics_367,x:280.4746,y:652.9833}).wait(1).to({graphics:mask_graphics_368,x:280.4746,y:651.6499}).wait(1).to({graphics:mask_graphics_369,x:280.4746,y:650.3166}).wait(1).to({graphics:mask_graphics_370,x:280.4746,y:648.9832}).wait(1).to({graphics:mask_graphics_371,x:280.4746,y:647.6499}).wait(1).to({graphics:mask_graphics_372,x:280.4746,y:646.3166}).wait(1).to({graphics:mask_graphics_373,x:280.4746,y:644.9832}).wait(1).to({graphics:mask_graphics_374,x:280.4746,y:643.6498}).wait(1).to({graphics:null,x:0,y:0}).wait(106).to({graphics:mask_graphics_481,x:284.5737,y:573.9502}).wait(1).to({graphics:mask_graphics_482,x:284.5773,y:573.2946}).wait(1).to({graphics:mask_graphics_483,x:284.5813,y:572.6394}).wait(1).to({graphics:mask_graphics_484,x:284.5849,y:571.9842}).wait(1).to({graphics:mask_graphics_485,x:284.589,y:571.3286}).wait(1).to({graphics:mask_graphics_486,x:284.5931,y:570.6733}).wait(1).to({graphics:mask_graphics_487,x:284.5967,y:570.0181}).wait(1).to({graphics:mask_graphics_488,x:284.6002,y:569.3625}).wait(1).to({graphics:mask_graphics_489,x:284.6047,y:568.7073}).wait(1).to({graphics:mask_graphics_490,x:284.6083,y:568.0521}).wait(1).to({graphics:mask_graphics_491,x:284.6119,y:567.3964}).wait(1).to({graphics:mask_graphics_492,x:284.616,y:566.7412}).wait(1).to({graphics:mask_graphics_493,x:284.62,y:566.0856}).wait(1).to({graphics:mask_graphics_494,x:284.6236,y:565.4299}).wait(1).to({graphics:mask_graphics_495,x:284.5719,y:564.9502}).wait(1).to({graphics:null,x:0,y:0}).wait(167).to({graphics:mask_graphics_663,x:284.5247,y:692.0001}).wait(1).to({graphics:mask_graphics_664,x:284.5327,y:690.8616}).wait(1).to({graphics:mask_graphics_665,x:284.5408,y:689.7231}).wait(1).to({graphics:mask_graphics_666,x:284.5485,y:688.5846}).wait(1).to({graphics:mask_graphics_667,x:284.5566,y:687.4461}).wait(1).to({graphics:mask_graphics_668,x:284.5647,y:686.3076}).wait(1).to({graphics:mask_graphics_669,x:284.5723,y:685.1691}).wait(1).to({graphics:mask_graphics_670,x:284.58,y:684.0306}).wait(1).to({graphics:mask_graphics_671,x:284.5876,y:682.8925}).wait(1).to({graphics:mask_graphics_672,x:284.5958,y:681.754}).wait(1).to({graphics:mask_graphics_673,x:284.6039,y:680.6151}).wait(1).to({graphics:mask_graphics_674,x:284.6115,y:679.4771}).wait(1).to({graphics:mask_graphics_675,x:284.6196,y:678.3385}).wait(1).to({graphics:mask_graphics_676,x:284.5737,y:676.9499}).wait(1).to({graphics:null,x:0,y:0}).wait(166).to({graphics:mask_graphics_843,x:284.5247,y:573.9997}).wait(1).to({graphics:mask_graphics_844,x:284.5247,y:573.1425}).wait(1).to({graphics:mask_graphics_845,x:284.5247,y:572.2852}).wait(1).to({graphics:mask_graphics_846,x:284.5247,y:571.428}).wait(1).to({graphics:mask_graphics_847,x:284.5247,y:570.5703}).wait(1).to({graphics:mask_graphics_848,x:284.5247,y:569.713}).wait(1).to({graphics:mask_graphics_849,x:284.5247,y:568.8558}).wait(1).to({graphics:mask_graphics_850,x:284.5247,y:567.9985}).wait(1).to({graphics:mask_graphics_851,x:284.5247,y:567.1408}).wait(1).to({graphics:mask_graphics_852,x:284.5247,y:566.2836}).wait(1).to({graphics:mask_graphics_853,x:284.5247,y:565.4263}).wait(1).to({graphics:mask_graphics_854,x:284.5247,y:564.5691}).wait(1).to({graphics:mask_graphics_855,x:284.5247,y:563.7119}).wait(1).to({graphics:mask_graphics_856,x:284.5247,y:562.95}).wait(1).to({graphics:null,x:0,y:0}).wait(185).to({graphics:mask_graphics_1042,x:284.5247,y:658.9503}).wait(1).to({graphics:mask_graphics_1043,x:284.5247,y:656.9496}).wait(1).to({graphics:mask_graphics_1044,x:284.5247,y:654.9498}).wait(1).to({graphics:mask_graphics_1045,x:284.5247,y:652.95}).wait(1).to({graphics:mask_graphics_1046,x:284.5247,y:650.9502}).wait(1).to({graphics:mask_graphics_1047,x:284.5247,y:648.9504}).wait(1).to({graphics:mask_graphics_1048,x:284.5247,y:646.9497}).wait(1).to({graphics:mask_graphics_1049,x:284.5247,y:644.9499}).wait(1).to({graphics:mask_graphics_1050,x:284.5247,y:642.9501}).wait(1).to({graphics:mask_graphics_1051,x:284.5247,y:640.9503}).wait(1).to({graphics:mask_graphics_1052,x:284.5247,y:638.9496}).wait(1).to({graphics:mask_graphics_1053,x:284.5247,y:636.9498}).wait(1).to({graphics:mask_graphics_1054,x:284.5247,y:634.95}).wait(1).to({graphics:mask_graphics_1055,x:284.5247,y:632.9502}).wait(1).to({graphics:null,x:0,y:0}).wait(227).to({graphics:mask_graphics_1283,x:284.5719,y:701.95}).wait(1).to({graphics:mask_graphics_1284,x:284.5719,y:700.4115}).wait(1).to({graphics:mask_graphics_1285,x:284.5719,y:698.873}).wait(1).to({graphics:mask_graphics_1286,x:284.5719,y:697.3348}).wait(1).to({graphics:mask_graphics_1287,x:284.5719,y:695.7958}).wait(1).to({graphics:mask_graphics_1288,x:284.5719,y:694.2577}).wait(1).to({graphics:mask_graphics_1289,x:284.5719,y:692.7192}).wait(1).to({graphics:mask_graphics_1290,x:284.5719,y:691.1806}).wait(1).to({graphics:mask_graphics_1291,x:284.5719,y:689.6425}).wait(1).to({graphics:mask_graphics_1292,x:284.5719,y:688.1035}).wait(1).to({graphics:mask_graphics_1293,x:284.5719,y:686.5655}).wait(1).to({graphics:mask_graphics_1294,x:284.5719,y:685.0269}).wait(1).to({graphics:mask_graphics_1295,x:284.5719,y:683.4883}).wait(1).to({graphics:mask_graphics_1296,x:284.5719,y:681.9502}).wait(1).to({graphics:null,x:0,y:0}).wait(294).to({graphics:mask_graphics_1591,x:790.5253,y:76.9999}).wait(1).to({graphics:mask_graphics_1592,x:791.775,y:75.2499}).wait(1).to({graphics:mask_graphics_1593,x:793.0246,y:73.4998}).wait(1).to({graphics:mask_graphics_1594,x:794.2747,y:71.7498}).wait(1).to({graphics:mask_graphics_1595,x:795.5248,y:69.9997}).wait(1).to({graphics:mask_graphics_1596,x:796.7749,y:68.2497}).wait(1).to({graphics:mask_graphics_1597,x:798.0251,y:66.5001}).wait(1).to({graphics:mask_graphics_1598,x:799.2751,y:64.7501}).wait(1).to({graphics:mask_graphics_1599,x:800.5252,y:63}).wait(1).to({graphics:mask_graphics_1600,x:801.7753,y:61.2499}).wait(1).to({graphics:mask_graphics_1601,x:803.025,y:59.4999}).wait(1).to({graphics:mask_graphics_1602,x:804.2746,y:57.7498}).wait(1).to({graphics:mask_graphics_1603,x:805.5247,y:55.9998}).wait(1).to({graphics:null,x:0,y:0}).wait(175).to({graphics:mask_graphics_1779,x:811.4746,y:164.4448}).wait(1).to({graphics:mask_graphics_1780,x:811.4746,y:162.778}).wait(1).to({graphics:mask_graphics_1781,x:811.4746,y:161.1112}).wait(1).to({graphics:mask_graphics_1782,x:811.4746,y:159.4445}).wait(1).to({graphics:mask_graphics_1783,x:811.4746,y:157.7776}).wait(1).to({graphics:mask_graphics_1784,x:811.4746,y:156.1109}).wait(1).to({graphics:mask_graphics_1785,x:811.4746,y:154.4445}).wait(1).to({graphics:mask_graphics_1786,x:811.4746,y:152.7781}).wait(1).to({graphics:mask_graphics_1787,x:811.4746,y:151.1114}).wait(1).to({graphics:mask_graphics_1788,x:811.4746,y:149.4445}).wait(1).to({graphics:mask_graphics_1789,x:811.4746,y:147.7778}).wait(1).to({graphics:mask_graphics_1790,x:811.4746,y:146.1109}).wait(1).to({graphics:mask_graphics_1791,x:811.4746,y:144.4441}).wait(1).to({graphics:null,x:0,y:0}).wait(160).to({graphics:mask_graphics_1952,x:811.4746,y:225.95}).wait(1).to({graphics:mask_graphics_1953,x:810.9751,y:224.7169}).wait(1).to({graphics:mask_graphics_1954,x:810.4747,y:223.483}).wait(1).to({graphics:mask_graphics_1955,x:809.9753,y:222.25}).wait(1).to({graphics:mask_graphics_1956,x:809.4748,y:221.0166}).wait(1).to({graphics:mask_graphics_1957,x:808.9753,y:219.7831}).wait(1).to({graphics:mask_graphics_1958,x:808.4749,y:218.5501}).wait(1).to({graphics:mask_graphics_1959,x:807.9745,y:217.3167}).wait(1).to({graphics:mask_graphics_1960,x:807.475,y:216.0833}).wait(1).to({graphics:mask_graphics_1961,x:806.9746,y:214.8503}).wait(1).to({graphics:mask_graphics_1962,x:806.4751,y:213.6168}).wait(1).to({graphics:mask_graphics_1963,x:805.9747,y:212.3833}).wait(1).to({graphics:mask_graphics_1964,x:805.4753,y:211.1499}).wait(1).to({graphics:mask_graphics_1965,x:804.9748,y:209.9165}).wait(1).to({graphics:mask_graphics_1966,x:804.4753,y:208.6834}).wait(1).to({graphics:mask_graphics_1967,x:803.9749,y:207.45}).wait(1).to({graphics:null,x:0,y:0}).wait(122).to({graphics:mask_graphics_2090,x:811.4746,y:81.0004}).wait(1).to({graphics:mask_graphics_2091,x:811.0624,y:79.3337}).wait(1).to({graphics:mask_graphics_2092,x:810.6502,y:77.6668}).wait(1).to({graphics:mask_graphics_2093,x:810.2371,y:76}).wait(1).to({graphics:mask_graphics_2094,x:809.8249,y:74.3332}).wait(1).to({graphics:mask_graphics_2095,x:809.4128,y:72.6664}).wait(1).to({graphics:mask_graphics_2096,x:808.9996,y:71.0001}).wait(1).to({graphics:mask_graphics_2097,x:808.5874,y:69.3338}).wait(1).to({graphics:mask_graphics_2098,x:808.1752,y:67.667}).wait(1).to({graphics:mask_graphics_2099,x:807.7621,y:66.0001}).wait(1).to({graphics:mask_graphics_2100,x:807.3499,y:64.3333}).wait(1).to({graphics:mask_graphics_2101,x:806.9377,y:62.6665}).wait(1).to({graphics:mask_graphics_2102,x:806.5246,y:60.9998}).wait(1).to({graphics:null,x:0,y:0}).wait(228).to({graphics:mask_graphics_2331,x:819.5265,y:164.0997}).wait(1).to({graphics:mask_graphics_2332,x:819.7425,y:163.1295}).wait(1).to({graphics:mask_graphics_2333,x:819.9585,y:162.1588}).wait(1).to({graphics:mask_graphics_2334,x:820.1745,y:161.1887}).wait(1).to({graphics:mask_graphics_2335,x:820.3909,y:160.218}).wait(1).to({graphics:mask_graphics_2336,x:820.6069,y:159.2478}).wait(1).to({graphics:mask_graphics_2337,x:820.8229,y:158.2771}).wait(1).to({graphics:mask_graphics_2338,x:821.0389,y:157.3065}).wait(1).to({graphics:mask_graphics_2339,x:821.2554,y:156.3363}).wait(1).to({graphics:mask_graphics_2340,x:821.4713,y:155.3656}).wait(1).to({graphics:mask_graphics_2341,x:821.6873,y:154.3955}).wait(1).to({graphics:mask_graphics_2342,x:821.9034,y:153.4248}).wait(1).to({graphics:mask_graphics_2343,x:822.1734,y:152.3628}).wait(299));

	// tE5
	this.instance = new lib.tE5("synched",0);
	this.instance.setTransform(557.5,383,1,1,0,0,0,557.5,360);
	this.instance.alpha = 0;
	this.instance._off = true;

	var maskedShapeInstanceList = [this.instance];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(2090).to({_off:false},0).to({y:360,alpha:1},12).to({_off:true},1).wait(228).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},12).to({_off:true},1).wait(298));

	// tE4
	this.instance_1 = new lib.tE4("synched",0);
	this.instance_1.setTransform(557.5,383,1,1,0,0,0,557.5,360);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	var maskedShapeInstanceList = [this.instance_1];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1591).to({_off:false},0).to({y:360,alpha:1},12).to({_off:true},1).wait(175).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},12).to({_off:true},1).wait(160).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},15).to({_off:true},1).wait(674));

	// tE3
	this.instance_2 = new lib.tE3("synched",0);
	this.instance_2.setTransform(557.5,383,1,1,0,0,0,557.5,360);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	var maskedShapeInstanceList = [this.instance_2];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(843).to({_off:false},0).to({y:360,alpha:1},13).to({_off:true},1).wait(185).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},13).to({_off:true},1).wait(227).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},13).to({_off:true},1).wait(1345));

	// tE2
	this.instance_3 = new lib.tE2("synched",0);
	this.instance_3.setTransform(557.5,383,1,1,0,0,0,557.5,360);
	this.instance_3.alpha = 0;
	this.instance_3._off = true;

	var maskedShapeInstanceList = [this.instance_3];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(481).to({_off:false},0).to({y:360,alpha:1},14).to({_off:true},1).wait(167).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},13).to({_off:true},1).wait(1965));

	// tE1
	this.instance_4 = new lib.tE1("synched",0);
	this.instance_4.setTransform(557.5,383,1,1,0,0,0,557.5,360);
	this.instance_4.alpha = 0;
	this.instance_4._off = true;

	var maskedShapeInstanceList = [this.instance_4];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(94).to({_off:false},0).to({y:360,alpha:1},12).to({_off:true},1).wait(109).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},14).to({_off:true},1).wait(128).to({_off:false,y:383,alpha:0},0).to({y:360,alpha:1},15).to({_off:true},1).wait(2267));

	// t_mask (mask)
	var mask_1 = new cjs.Shape();
	mask_1._off = true;
	var mask_1_graphics_106 = new cjs.Graphics().p("EgkAAC+IAAl7MBIBAAAIAAF7g");
	var mask_1_graphics_230 = new cjs.Graphics().p("EgkAAH8IAAttIAAhdIAAgtMBIBAAAIAAP3g");
	var mask_1_graphics_374 = new cjs.Graphics().p("EgkAAOiIAA9DMBIBAAAIAAdDg");
	var mask_1_graphics_495 = new cjs.Graphics().p("EAjFAF8MhHFAAAIAAl8IAAl7MBIBAAAIAAL3g");
	var mask_1_graphics_676 = new cjs.Graphics().p("EgkAAVpIAAvtIAAl8IAA1oMBIBAAAMAAAArRg");
	var mask_1_graphics_856 = new cjs.Graphics().p("EAjFAF8MhHFAAAIAAl8IAAl7MBIBAAAIAAL3g");
	var mask_1_graphics_1055 = new cjs.Graphics().p("EAjFAMdMhHFAAAIAAsdIAAscMBIBAAAIAAY5g");
	var mask_1_graphics_1296 = new cjs.Graphics().p("EAjFAQMMhHFAAAIAAwMIAAwLMBIBAAAMAAAAgXg");
	var mask_1_graphics_1603 = new cjs.Graphics().p("EgoJAGpIAAtRMBQTAAAIAANRg");
	var mask_1_graphics_1791 = new cjs.Graphics().p("EgmCAMCIAA4DMBMFAAAIAAYDg");
	var mask_1_graphics_1967 = new cjs.Graphics().p("EgmCASZMAAAgkxMBMFAAAMAAAAkxg");
	var mask_1_graphics_2102 = new cjs.Graphics().p("EgmCAHNIAAuZMBMFAAAIAAOZg");
	var mask_1_graphics_2343 = new cjs.Graphics().p("EgmCATaMAAAgmzMBMFAAAMAAAAmzg");

	this.timeline.addTween(cjs.Tween.get(mask_1).to({graphics:null,x:0,y:0}).wait(106).to({graphics:mask_1_graphics_106,x:287.5,y:553.95}).wait(124).to({graphics:mask_1_graphics_230,x:287.5,y:562.05}).wait(144).to({graphics:mask_1_graphics_374,x:287.5,y:620.95}).wait(121).to({graphics:mask_1_graphics_495,x:293.5,y:575.95}).wait(181).to({graphics:mask_1_graphics_676,x:294.55,y:658}).wait(180).to({graphics:mask_1_graphics_856,x:294.55,y:568.95}).wait(199).to({graphics:mask_1_graphics_1055,x:294.55,y:568.675}).wait(241).to({graphics:mask_1_graphics_1296,x:294.55,y:595.625}).wait(307).to({graphics:mask_1_graphics_1603,x:831.9,y:57.55}).wait(188).to({graphics:mask_1_graphics_1791,x:825.4,y:103.05}).wait(176).to({graphics:mask_1_graphics_1967,x:825.4,y:103.075}).wait(135).to({graphics:mask_1_graphics_2102,x:823.5,y:56.25}).wait(241).to({graphics:mask_1_graphics_2343,x:823.5,y:56.25}).wait(299));

	// t5
	this.instance_5 = new lib.text5();
	this.instance_5._off = true;

	var maskedShapeInstanceList = [this.instance_5];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask_1;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(2102).to({_off:false},0).wait(540));

	// t4
	this.instance_6 = new lib.text4();
	this.instance_6._off = true;

	var maskedShapeInstanceList = [this.instance_6];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask_1;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1603).to({_off:false},0).wait(364).to({_off:true},123).wait(552));

	// t3
	this.instance_7 = new lib.text3();
	this.instance_7._off = true;

	var maskedShapeInstanceList = [this.instance_7];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask_1;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(856).to({_off:false},0).wait(440).to({_off:true},287).wait(1059));

	// t2
	this.instance_8 = new lib.text2();
	this.instance_8._off = true;

	var maskedShapeInstanceList = [this.instance_8];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask_1;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(495).to({_off:false},0).wait(181).to({_off:true},160).wait(1806));

	// t1
	this.instance_9 = new lib.text1();
	this.instance_9._off = true;

	var maskedShapeInstanceList = [this.instance_9];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask_1;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(106).to({_off:false},0).wait(268).to({_off:true},101).wait(2167));

	// duck_eye_M
	this.instance_10 = new lib.duck_eye_M("synched",7);
	this.instance_10.setTransform(830.25,534.05,1,1,0,0,0,11.1,10.7);
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(2009).to({_off:false},0).to({x:818.75,y:529.55,startPosition:13},61).wait(572));

	// duck
	this.instance_11 = new lib.duck_Alpha("synched",0);
	this.instance_11.setTransform(801.15,547.7,1,1,0,0,0,77,77.2);
	this.instance_11.alpha = 0;
	this.instance_11._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_11).wait(1652).to({_off:false},0).to({alpha:1,mode:"single"},27).wait(330).to({mode:"synched",startPosition:178,loop:false},0).wait(633));

	// girl_eye
	this.instance_12 = new lib.girl_eye_alpha("synched",0);
	this.instance_12.setTransform(695.6,584.8,1,1,0,0,0,31.5,15);
	this.instance_12.alpha = 0;
	this.instance_12._off = true;

	this.instance_13 = new lib.girl_eye("synched",25);
	this.instance_13.setTransform(695.5,585,1,1,0,0,0,31.5,15);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_12}]},1630).to({state:[{t:this.instance_12}]},20).to({state:[{t:this.instance_13}]},464).to({state:[]},42).wait(486));
	this.timeline.addTween(cjs.Tween.get(this.instance_12).wait(1630).to({_off:false},0).to({alpha:1},20).to({_off:true},464).wait(528));

	// Girl_MC
	this.instance_14 = new lib.Girl_MC();
	this.instance_14.setTransform(701.1,607.4,1,1,0,0,0,18.1,20.4);
	this.instance_14._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_14).wait(2097).to({_off:false},0).to({_off:true},4).wait(16).to({_off:false,x:704.05,y:607.8},0).to({x:707.05},6).to({_off:true},1).wait(4).to({_off:false,x:710.1,y:607.4},0).to({x:711.1},2).to({_off:true},1).wait(5).to({_off:false,x:713.85},0).to({x:715.4},4).to({_off:true},1).wait(3).to({_off:false,x:717},0).to({x:718.6},4).to({_off:true},2).wait(8).to({_off:false,x:720.95},0).to({_off:true},4).wait(480));

	// girl
	this.instance_15 = new lib.girl_alpha("synched",0);
	this.instance_15.setTransform(678.5,617.3,1,1,0,0,0,90.5,103.3);
	this.instance_15.alpha = 0;
	this.instance_15._off = true;

	this.instance_16 = new lib.girl_move("synched",0);
	this.instance_16.setTransform(678.5,617.3,1,1,0,0,0,90.5,103.3);
	this.instance_16._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_15).wait(1601).to({_off:false},0).to({alpha:1},78).to({_off:true},435).wait(528));
	this.timeline.addTween(cjs.Tween.get(this.instance_16).wait(2114).to({_off:false},0).to({x:698,y:616.65},42).wait(486));

	// Boy_eye
	this.instance_17 = new lib.boy_eye_alpha("synched",0);
	this.instance_17.setTransform(706.1,458.1,1,1,0,0,0,28,14);
	this.instance_17.alpha = 0;
	this.instance_17._off = true;

	this.instance_18 = new lib.Boy_eye("synched",45);
	this.instance_18.setTransform(707,456,1,1,0,0,0,28,14);
	this.instance_18._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_17).wait(1651).to({_off:false},0).to({alpha:1,startPosition:15},15).to({_off:true},448).wait(528));
	this.timeline.addTween(cjs.Tween.get(this.instance_18).wait(2114).to({_off:false},0).to({x:729.75,startPosition:37},42).wait(486));

	// Boy_MC
	this.instance_19 = new lib._13소년얼굴_M_C();
	this.instance_19.setTransform(707,464);
	this.instance_19._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_19).wait(2190).to({_off:false},0).to({_off:true},14).wait(21).to({_off:false},0).to({_off:true},4).wait(14).to({_off:false},0).to({_off:true},4).wait(10).to({_off:false},0).to({_off:true},15).wait(5).to({_off:false},0).to({_off:true},3).wait(26).to({_off:false},0).to({_off:true},23).wait(313));

	// Boy
	this.instance_20 = new lib.boy_alpha("synched",0);
	this.instance_20.setTransform(693.2,464,1,1,0,0,0,59.2,90);
	this.instance_20.alpha = 0;
	this.instance_20._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_20).wait(1634).to({_off:false},0).to({alpha:1},45).wait(435).to({startPosition:0},0).to({x:715.95},42).wait(486));

	// man_eye
	this.instance_21 = new lib.man_eye_alpha("synched",0);
	this.instance_21.setTransform(921.5,375.45,1,1,0,0,0,31,21);
	this.instance_21.alpha = 0;
	this.instance_21._off = true;

	this.instance_22 = new lib.man_eye("synched",50);
	this.instance_22.setTransform(920,372,1,1,0,0,0,31,21);
	this.instance_22._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_21).wait(1638).to({_off:false},0).to({alpha:1},14).to({_off:true},705).wait(285));
	this.timeline.addTween(cjs.Tween.get(this.instance_22).wait(2357).to({_off:false},0).to({regX:31.1,rotation:-14.9983,x:913.9,y:381.95,startPosition:32},34).wait(251));

	// man
	this.instance_23 = new lib.man_alpha("single",0);
	this.instance_23.setTransform(981.4,493.2,1,1,0,0,0,132.4,226.2);
	this.instance_23.alpha = 0;
	this.instance_23._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_23).wait(1615).to({_off:false},0).to({x:982.65,y:493.7,alpha:1},64).wait(678).to({mode:"synched",loop:false},0).wait(285));

	// woman_eye
	this.instance_24 = new lib.woman_eye_alpha("synched",0);
	this.instance_24.setTransform(809.5,452.4,1,1,0,0,0,26.5,13.5);
	this.instance_24.alpha = 0;
	this.instance_24._off = true;

	this.instance_25 = new lib.woman_eye("synched",20);
	this.instance_25.setTransform(812.5,454,1,1,0,0,0,30.5,21);
	this.instance_25._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_24).wait(1652).to({_off:false},0).to({alpha:1},27).to({_off:true},678).wait(285));
	this.timeline.addTween(cjs.Tween.get(this.instance_25).wait(2357).to({_off:false},0).to({y:468.95,startPosition:54},34).wait(251));

	// woman_MO
	this.instance_26 = new lib._13여자얼굴MouthO();
	this.instance_26.setTransform(793,443);
	this.instance_26._off = true;

	this.instance_27 = new lib.MomMO();
	this.instance_27.setTransform(813.5,471,1,1,0,0,0,19.5,23);
	this.instance_27._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_26).wait(2338).to({_off:false},0).to({_off:true},8).wait(3).to({_off:false},0).to({_off:true},8).wait(30).to({_off:false,y:456},0).to({_off:true},4).wait(3).to({_off:false},0).to({_off:true},7).wait(3).to({_off:false,y:457},0).to({_off:true},5).wait(6).to({_off:false,x:794},0).to({_off:true},3).wait(3).to({_off:false},0).to({_off:true},7).wait(5).to({_off:false,x:793,y:455},0).to({_off:true},4).wait(4).to({_off:false,x:794,y:456},0).wait(4).to({_off:true},1).wait(6).to({_off:false,x:793,y:459},0).to({_off:true},5).wait(185));
	this.timeline.addTween(cjs.Tween.get(this.instance_27).wait(2365).to({_off:false},0).to({y:476.45},13).to({_off:true},1).wait(263));

	// woman
	this.instance_28 = new lib.woman_alpha("single",0);
	this.instance_28.setTransform(834.5,543.3,1,1,0,0,0,102.5,177.3);
	this.instance_28.alpha = 0;
	this.instance_28._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_28).wait(1652).to({_off:false},0).to({alpha:1},27).wait(678).to({mode:"synched",startPosition:3,loop:false},0).wait(285));

	// BG_R_Alpha
	this.instance_29 = new lib.BG_R("synched",0);
	this.instance_29.setTransform(838.1,358.85,1,1.0029,0,0,0,277.1,359.9);
	this.instance_29.alpha = 0.6992;

	this.timeline.addTween(cjs.Tween.get(this.instance_29).wait(1601).to({regX:277,scaleY:1.0093,x:837.95,y:360.9},0).to({regY:360.1,scaleY:1.0028,x:838.55,y:361.5,alpha:0},78).wait(963));

	// BG_R
	this.instance_30 = new lib._132bg();
	this.instance_30.setTransform(561,0);

	this.timeline.addTween(cjs.Tween.get(this.instance_30).wait(2642));

	// snow
	this.instance_31 = new lib.snow("synched",0);
	this.instance_31.setTransform(280.5,111.5,1,1,0,0,0,280.5,112.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_31).wait(1582).to({startPosition:34},0).to({x:248.7,y:112.9,startPosition:29,loop:false},14).wait(1046));

	// duck
	this.instance_32 = new lib.duck("synched",0);
	this.instance_32.setTransform(279.3,360.2,1,1,0,0,0,94.3,88.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_32).wait(1582).to({startPosition:14},0).to({alpha:0,startPosition:9,loop:false},14).wait(1046));

	// Tree
	this.instance_33 = new lib._131나무();
	this.instance_33.setTransform(-1,303,1.0127,0.9995);

	this.timeline.addTween(cjs.Tween.get(this.instance_33).wait(2642));

	// 눈보라2
	this.instance_34 = new lib._131눈보라1();
	this.instance_34.setTransform(289,1,1.0019,1.002);

	this.timeline.addTween(cjs.Tween.get(this.instance_34).wait(2642));

	// 눈보라1
	this.instance_35 = new lib._131눈보라overlay1();
	this.instance_35.setTransform(209,1,1.0015,1.0023);

	this.timeline.addTween(cjs.Tween.get(this.instance_35).wait(2642));

	// 안개
	this.instance_36 = new lib._131안개();
	this.instance_36.setTransform(0,41,1.0009,1.0006);

	this.timeline.addTween(cjs.Tween.get(this.instance_36).wait(2642));

	// 안개multiply
	this.instance_37 = new lib._131안개multiply();
	this.instance_37.setTransform(0,0,0.6791,0.7311);

	this.timeline.addTween(cjs.Tween.get(this.instance_37).wait(2642));

	// BG_L
	this.instance_38 = new lib._131bg();

	this.timeline.addTween(cjs.Tween.get(this.instance_38).wait(2642));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(537.1,357.7,578.4999999999999,385.3);
// library properties:
lib.properties = {
	id: 'E5519CCDE5F542718E6ADCBABE6465C8',
	width: 1115,
	height: 720,
	fps: 29.97,
	color: "#000000",
	opacity: 1.00,
	manifest: [
		{src:"images/13_220217c_atlas_1.png?1645073164751", id:"13_220217c_atlas_1"},
		{src:"images/13_220217c_atlas_2.png?1645073164751", id:"13_220217c_atlas_2"},
		{src:"images/13_220217c_atlas_3.png?1645073164751", id:"13_220217c_atlas_3"},
		{src:"images/13_220217c_atlas_4.png?1645073164752", id:"13_220217c_atlas_4"},
		{src:"sounds/_7131.mp3?1645073164891", id:"_7131"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['E5519CCDE5F542718E6ADCBABE6465C8'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;