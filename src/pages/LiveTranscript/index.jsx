/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Card, Row, Switch, Input } from 'antd';
import { Space, Button, Divider } from 'antd';
import { AudioOutlined, ProfileFilled, AudioMutedOutlined, UploadOutlined } from '@ant-design/icons';
import { DesktopOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
// eslint-disable-next-line import/no-webpack-loader-syntax
// import SampleVideo from '-!file-loader!./sintel-short.mp4';

import './App.css';

import ModelDropdown from './components/ModelDropdown';
import CaptionMenu from './components/CaptionMenu';
import FullscreenBtn from './components/FullscreenBtn';

import recognizeMic from '../../lib/speech-to-text/recognize-microphone';
import recognizeMicrophone from '../../lib/ibm/watson-speech/speech-to-text/recognize-microphone';
import recognizeFile from '../../lib/ibm/watson-speech/speech-to-text/recognize-file';
import Transcript from './components/transcript.jsx';
// import TimingView from './components/timing.jsx';

const { TextArea } = Input;

const displayMediaOptions = {
  video: {
    cursor: "always",
    frameRate: { ideal: 60, max: 120 },
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  }
};

let active = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

function dragStart(e, dragItem) {
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.target === dragItem || dragItem.contains(e.target)) {
    active = true;
  }
}

function dragEnd() {
  initialX = currentX;
  initialY = currentY;

  active = false;
}

function setTranslate(xPos, yPos, el) {
  // eslint-disable-next-line no-param-reassign
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function drag(e, dragItem) {

  if (active) {

    // e.preventDefault();

    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragItem);
  }
}

class LiveTranscript extends Component {
  constructor() {
    super()
    this.state = {
      model: 'en-US_BroadbandModel',
      rawMessages: [],
      formattedMessages: [],
      audioSource: null,
      speakerLabels: false,
      keywords: [],
      settingsAtStreamStart: {
        model: '',
        keywords: [],
        speakerLabels: false,
      },
      error: null,
      creds: undefined,
      text: '',
      stream: undefined,
      stereoMix: '',
      showMenu: false,
      showCaption: true,
      showTextBox: false
    }
    this.onChangeLanguage = this.onChangeLanguage.bind(this);
    this.onListenClick = this.onListenClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.cameraCapture = this.cameraCapture.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDrag = this.handleDrag.bind(this);


    this.reset = this.reset.bind(this);
    this.captureSettings = this.captureSettings.bind(this);
    this.stopTranscription = this.stopTranscription.bind(this);
    this.getRecognizeOptions = this.getRecognizeOptions.bind(this);
    this.handleMicClick = this.handleMicClick.bind(this);
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.handleUserFile = this.handleUserFile.bind(this);
    this.handleUserFileRejection = this.handleUserFileRejection.bind(this);
    this.playFile = this.playFile.bind(this);
    this.handleStream = this.handleStream.bind(this);
    this.handleRawMessage = this.handleRawMessage.bind(this);
    this.handleFormattedMessage = this.handleFormattedMessage.bind(this);
    this.handleTranscriptEnd = this.handleTranscriptEnd.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleSpeakerLabelsChange = this.handleSpeakerLabelsChange.bind(this);
    this.getFinalResults = this.getFinalResults.bind(this);
    this.getCurrentInterimResult = this.getCurrentInterimResult.bind(this);
    this.getFinalAndLatestInterimResult = this.getFinalAndLatestInterimResult.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {

    this.fetchToken();
    // tokens expire after 60 minutes, so automatcally fetch a new one ever 50 minutes
    // Not sure if this will work properly if a computer goes to sleep for > 50 minutes
    // and then wakes back up
    // react automatically binds the call to this
    // eslint-disable-next-line
    this.setState({ tokenInterval: setInterval(this.fetchToken, 50 * 60 * 1000) });

    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.label.includes("Stereo Mix")) {
            this.setState({
              stereoMix: device.deviceId
            });
          }
          console.log(`${device.kind}: ${device.label
            } id = ${device.deviceId}`);
        });
      })
      .catch((err) => {
        console.log(`${err.name}: ${err.message}`);
      });
  }

  componentWillUnmount() {
    clearInterval(this.state.tokenInterval);
  }

  fetchToken() {
    return fetch('http://localhost:8002/api/v1/credentials').then((res) => {
      if (res.status !== 200) {
        throw new Error('Error retrieving auth token');
      }
      return res.json();
    }) // todo: throw here if non-200 status
      .then(creds => { this.setState({ creds }); }).catch(this.handleError);
  }

  reset() {
    if (this.state.audioSource) {
      this.stopTranscription();
    }
    this.setState({ rawMessages: [], formattedMessages: [], error: null });
  }

  /**
     * The behavior of several of the views depends on the settings when the
     * transcription was started. So, this stores those values in a settingsAtStreamStart object.
     */
  captureSettings() {
    const { model, speakerLabels } = this.state;
    this.setState({
      settingsAtStreamStart: {
        model,
        keywords: [],
        speakerLabels,
      },
    });
  }

  stopTranscription() {
    if (this.stream) {
      this.stream.stop();
      this.stream.removeAllListeners();
      this.stream.recognizeStream.removeAllListeners();
    }
    this.setState({ audioSource: null });
  }

  getRecognizeOptions(extra) {
    // const keywords = this.getKeywordsArrUnique();
    return {// formats phone numbers, currency, etc. (server-side)
      // mediaStream: this.state.stream,
      access_token: this.state.creds.accessToken,
      token: this.state.creds.accessToken,
      smart_formatting: true,
      format: true, // adds capitals, periods, and a few other things (client-side)
      model: this.state.model,
      objectMode: true,
      interim_results: true,
      // note: in normal usage, you'd probably set this a bit higher
      word_alternatives_threshold: 0.01,
      keywords: [],
      timestamps: true, // set timestamps for each word - automatically turned on by speaker_labels
      // includes the speaker_labels in separate objects unless resultsBySpeaker is enabled
      speaker_labels: this.state.speakerLabels,
      // combines speaker_labels and results together into single objects,
      // making for easier transcript outputting
      resultsBySpeaker: this.state.speakerLabels,
      // allow interim results through before the speaker has been determined
      speakerlessInterim: this.state.speakerLabels,
      url: this.state.creds.serviceUrl, ...extra
    };
  }

  handleMicClick() {
    if (this.state.audioSource === 'mic') {
      this.stopTranscription();
      return;
    }
    this.reset();
    this.setState({ audioSource: 'mic' });

    // The recognizeMicrophone() method is a helper method provided by the watson-speech package
    // It sets up the microphone, converts and downsamples the audio, and then transcribes it
    // over a WebSocket connection
    // It also provides a number of optional features, some of which are enabled by default:
    //  * enables object mode by default (options.objectMode)
    //  * formats results (Capitals, periods, etc.) (options.format)
    //  * outputs the text to a DOM element - not used in this demo because it doesn't play nice
    // with react (options.outputElement)
    //  * a few other things for backwards compatibility and sane defaults
    // In addition to this, it passes other service-level options along to the RecognizeStream that
    // manages the actual WebSocket connection.
    this.handleStream(recognizeMicrophone(this.getRecognizeOptions({mediaStream: this.state.stream})));
  }

  handleUploadClick() {
    console.log("file")
    if (this.state.audioSource === 'upload') {
      this.stopTranscription();
    } else {
      this.dropzone.open();
    }
  }

  handleUserFile(files) {
    const file = files[0];
    if (!file) {
      return;
    }
    this.reset();
    this.setState({ audioSource: 'upload' });
    console.log(file);
    this.playFile(file);
  }

  handleUserFileRejection() {
    this.setState({ error: 'Sorry, that file does not appear to be compatible.' });
  }

  playFile(file) {
    // The recognizeFile() method is a helper method provided by the watson-speach package
    // It accepts a file input and transcribes the contents over a WebSocket connection
    // It also provides a number of optional features, some of which are enabled by default:
    //  * enables object mode by default (options.objectMode)
    //  * plays the file in the browser if possible (options.play)
    //  * formats results (Capitals, periods, etc.) (options.format)
    //  * slows results down to realtime speed if received faster than realtime -
    // this causes extra interim `data` events to be emitted (options.realtime)
    //  * combines speaker_labels with results (options.resultsBySpeaker)
    //  * outputs the text to a DOM element - not used in this demo because it doesn't play
    //  nice with react (options.outputElement)
    //  * a few other things for backwards compatibility and sane defaults
    // In addition to this, it passes other service-level options along to the RecognizeStream
    // that manages the actual WebSocket connection.
    // fetch('http://localhost:8002/api/v1/credentials')
    //   .then((response) => {
    //     return response.text();
    //   }).then((token) => {
    //     const data = JSON.parse(token)
    //     console.log('token is', data.accessToken)
    //     const stream = recognizeFile({
    //       file,
    //       play: true,
    //       realtime: true,
    //       model: this.state.model,
    //       url: data.serviceUrl,
    //       token: data.accessToken,
    //       accessToken: data.accessToken,
    //       speakerLabels: false,
    //       objectMode: true, // send objects instead of text
    //       // extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
    //       format: true, // optional - performs basic formatting on the results such as capitals an periods,
    //       interim_results: true,
    //       smart_formatting: true,
    //       word_alternatives_threshold: 0.01,
    //       resultsBySpeaker: false,
    //       timestamps: true,
    //     });
    //     this.handleStream(stream);
    //   }).catch((error) => {
    //     console.log(error);
    //   });
    this.handleStream(recognizeFile(this.getRecognizeOptions({
      file,
      play: true, // play the audio out loud
      // use a helper stream to slow down the transcript output to match the audio speed
      realtime: true,
    })));
  }

  handleStream(stream) {
    console.log(stream);
    // cleanup old stream if appropriate
    if (this.stream) {
      this.stream.stop();
      this.stream.removeAllListeners();
      this.stream.recognizeStream.removeAllListeners();
    }
    this.stream = stream;
    this.captureSettings();

    // grab the formatted messages and also handle errors and such
    stream.on('data', this.handleFormattedMessage).on('end', this.handleTranscriptEnd).on('error', this.handleError);

    // when errors occur, the end event may not propagate through the helper streams.
    // However, the recognizeStream should always fire a end and close events
    stream.recognizeStream.on('end', () => {
      if (this.state.error) {
        this.handleTranscriptEnd();
      }
    });

    // grab raw messages from the debugging events for display on the JSON tab
    stream.recognizeStream
      .on('message', (frame, json) => this.handleRawMessage({ sent: false, frame, json }))
      .on('send-json', json => this.handleRawMessage({ sent: true, json }))
      .once('send-data', () => this.handleRawMessage({
        sent: true, binary: true, data: true, // discard the binary data to avoid waisting memory
      }))
      .on('close', (code, message) => this.handleRawMessage({ close: true, code, message }));

    // ['open','close','finish','end','error', 'pipe'].forEach(e => {
    //     stream.recognizeStream.on(e, console.log.bind(console, 'rs event: ', e));
    //     stream.on(e, console.log.bind(console, 'stream event: ', e));
    // });
  }

  handleRawMessage(msg) {
    const { rawMessages } = this.state;
    this.setState({ rawMessages: rawMessages.concat(msg) });
  }

  handleFormattedMessage(msg) {
    // console.log(msg);
    const { formattedMessages } = this.state;
    const { transcript } = msg.results[0].alternatives[0];
    this.setState({
      text: transcript,
    });
    const captionSegment = document.querySelector('.caption-segment');
    if (captionSegment) {
      document.querySelector('.caption-segment').scrollTop = 9999999;
      document.querySelector('.caption-segment').innerHTML = transcript;
    }
    this.setState({ formattedMessages: formattedMessages.concat(msg) });
  }

  handleTranscriptEnd() {
    // note: this function will be called twice on a clean end,
    // but may only be called once in the event of an error
    this.setState({ audioSource: null });
  }

  handleModelChange(model) {
    this.reset();
    this.setState({
      model,
      keywords: this.getKeywords(model),
      speakerLabels: false,
    });

    // clear the speaker_lables is not supported error - e.g.
    // speaker_labels is not a supported feature for model en-US_BroadbandModel
    if (this.state.error && this.state.error.indexOf('speaker_labels is not a supported feature for model') === 0) {
      this.setState({ error: null });
    }
  }

  handleSpeakerLabelsChange() {
    this.setState(prevState => ({ speakerLabels: !prevState.speakerLabels }));
  }

  getFinalResults() {
    return this.state.formattedMessages.filter(r => r.results
      && r.results.length && r.results[0].final);
  }

  getCurrentInterimResult() {
    const r = this.state.formattedMessages[this.state.formattedMessages.length - 1];

    // When resultsBySpeaker is enabled, each msg.results array may contain multiple results.
    // However, all results in a given message will be either final or interim, so just checking
    // the first one still works here.
    if (!r || !r.results || !r.results.length || r.results[0].final) {
      return null;
    }
    return r;
  }

  getFinalAndLatestInterimResult() {
    const final = this.getFinalResults();
    const interim = this.getCurrentInterimResult();
    if (interim) {
      final.push(interim);
    }
    return final;
  }

  handleError(err, extra) {
    console.error(err, extra);
    if (err.name === 'UNRECOGNIZED_FORMAT') {
      err = 'Unable to determine content type from file name or header; mp3, wav, flac, ogg, opus, and webm are supported. Please choose a different file.';
    } else if (err.name === 'NotSupportedError' && this.state.audioSource === 'mic') {
      err = 'This browser does not support microphone input.';
    } else if (err.message === '(\'UpsamplingNotAllowed\', 8000, 16000)') {
      err = 'Please select a narrowband voice model to transcribe 8KHz audio files.';
    } else if (err.message === 'Invalid constraint') {
      // iPod Touch does this on iOS 11 - there is a microphone, but Safari claims there isn't
      err = 'Unable to access microphone';
    }
    this.setState({ error: err.message || err });
  }

  onChangeLanguage(e) {
    console.log(e);
    const model = e;
    this.setState({
      model
    });
  }

  showVideoControls = () => {
    const videoControls = document.querySelector('.video-controls-bottom');
    if (videoControls) {
      videoControls.style.visibility = "visible";
    }
  }

  hideVideoControls = () => {
    const videoControls = document.querySelector('.video-controls-bottom');
    if (videoControls && !this.state.showMenu) {
      videoControls.style.visibility = "hidden";
    }
  }

  handleShowMenu = (showMenu) => {
    this.setState({
      showMenu
    });
  }

  handleShowCaption = () => {
    this.setState({
      showCaption: !this.state.showCaption
    });
  }

  onShowTextBox = (checked) => {
    this.setState({ showTextBox: checked });
    if (checked) {
      const transcriptTextBox = document.querySelector('.transcript-text-card');
      const videoContainer = document.querySelector('.video-container');
      if (transcriptTextBox && videoContainer) {
        transcriptTextBox.clientHeight = videoContainer.clientHeight;
      }
      console.log(videoContainer.clientHeight)
    }
  }

  onRecordAudio = () => {
    fetch('http://localhost:8002/api/v1/credentials')
      .then((response) => {
        return response.text();
      }).then((token) => {
        const data = JSON.parse(token)
        // console.log('token is', data.accessToken)
        const stream = recognizeMic({
          mediaStream: this.state.stream,
          model: this.state.model,
          url: data.serviceUrl,
          token: data.accessToken,
          accessToken: data.accessToken,
          speakerLabels: false,
          objectMode: true, // send objects instead of text
          // extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
          format: true, // optional - performs basic formatting on the results such as capitals an periods,
          interim_results: true,
          smart_formatting: true,
          word_alternatives_threshold: 0.01,
          resultsBySpeaker: false,
          timestamps: true,
        });
        this.handleStream(stream);
        console.log(this.state.stream);
        // stream.on('data', (rawData) => {
        //   const { transcript } = rawData.results[0].alternatives[0];
        //   this.setState({
        //     text: transcript,
        //   });
        // const { transcript } = rawData.alternatives[0];
        // console.log(rawData);
        // this.setState({
        //   text: rawData.alternatives[0].transcript,
        // });
        //   const captionSegment = document.querySelector('.caption-segment');
        //   if (captionSegment) {
        //     document.querySelector('.caption-segment').scrollTop = 9999999;
        //     document.querySelector('.caption-segment').innerHTML = transcript;
        //   }
        // });
        // stream.on('error', (err) => {
        //   console.log(err);
        // });
        document.querySelector('#stop').onclick = stream.stop.bind(stream);
      }).catch((error) => {
        console.log(error);
      });
  }

  onListenClick() {
    if (this.state.audioSource === 'mic') {
      this.stopTranscription();
      return;
    }
    this.reset();
    this.setState({ audioSource: 'mic' });
    this.onRecordAudio();
  }

  onResetClick() {
    console.log('stopped');
    this.setState(
      {
        audioSource: null,
        text: '',
        speakerLabels: false,
        zoom_end_point_url: null,
        stream: undefined
      }
    )
  }

  async cameraCapture() {
    if (this.state.stream) {
      this.stopCapture();
    }
    try {
      const videoElement = document.querySelector('#video');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: this.state.stereoMix, 'echoCancellation': true } }, video: true });
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      this.setState({
        stream
      });
      console.log(stream)
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  async startCapture() {
    if (this.state.stream) {
      this.stopCapture();
    }
    try {
      let stream = null;
      const videoElement = document.querySelector('#video');
      const videoStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      if (videoStream && videoStream.getAudioTracks().length > 0) {
        stream = videoStream;
      }
      else {
        const voiceStream = this.state.stereoMix && await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: this.state.stereoMix, 'echoCancellation': true } }, video: false });
        const tracks = [...videoStream.getTracks(), ...voiceStream.getAudioTracks()]
        stream = new MediaStream(tracks);
      }
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      this.setState({
        stream
      });
      // if (this.state.audioSource === 'mic') {
      //   this.stopTranscription();
      //   return;
      // };
      // this.setState({ audioSource: 'mic' });
      // this.onRecordAudio();
      // this.onListenClick();
      console.log(stream)
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  stopCapture() {
    const videoElement = document.querySelector('#video').srcObject;
    if (videoElement) {
      const tracks = videoElement.getTracks();
      tracks.forEach(track => track.stop());
    }
    document.querySelector('#video').srcObject = null;
    this.setState({
      stream: undefined,
      showTextBox: false
    });
    this.stopTranscription();
    this.reset();
  }

  handleDragStart(e) {
    const dragItem = document.querySelector(".caption-window");
    dragStart(e, dragItem);
  }

  handleDragEnd(e) {
    dragEnd(e);
  }

  handleDrag(e) {
    const dragItem = document.querySelector(".caption-window");
    drag(e, dragItem)
  }

  render() {

    const {
      audioSource,
      showTextBox
    } = this.state;

    const messages = this.getFinalAndLatestInterimResult();
    // console.log(messages);

    return (
      <>
        {/* <Dropzone
      onDrop={acceptedFiles => console.log(acceptedFiles)}
      onDropAccepted={this.handleUserFile}
      onDropRejected={this.handleUserFileRejection}
      maxSize={200 * 1024 * 1024}
      accept="audio/wav, audio/mp3, audio/mpeg, audio/l16, audio/ogg, audio/flac, .mp3, .mpeg, .wav, .ogg, .opus, .flac" // eslint-disable-line
      disableClick
      className="dropzone _container _container_large"
      activeClassName="dropzone-active"
      rejectClassName="dropzone-reject"
      ref={(node) => {
        this.dropzone = node;
      }}
    > */}
        {/* {({getRootProps, getInputProps}) => ( */}
          <div className="App">
                  <div className="page-container">

                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Card className="capture-btn-container">
                        {this.state.stream ? (
                          <Space>
                            <Button id='stopCapture' onClick={this.stopCapture.bind(this)} type="primary" shape="round" danger>
                              Stop
            </Button>
                          </Space>) : (<><Divider>What do you want to capture ?</Divider><Space><Button id='start'
                            className="capture-btn"
                            onClick={this.startCapture.bind(this)}
                            icon={<DesktopOutlined />}
                          >
                            Screen
            </Button>
                            <Button id='camera-btn'
                              className="capture-btn"
                              onClick={this.cameraCapture}
                              icon={<VideoCameraOutlined />}
                            >
                              Camera
            </Button>
                            <Button id='file-upload'
                              className="capture-btn"
                              onClick={this.handleUploadClick}
                              icon={<UploadOutlined />}
                            >
                              File
            </Button>
                          </Space></>)}
                      </Card>
                      <div className="live-transcript-container">
                        <Card
                          className="player-theater-card"
                        >
                          <div className="player-theater-container" onMouseOver={this.showVideoControls} onMouseOut={this.hideVideoControls}>
                            <div className={this.state.stream ? "video-container" : "video-container no-stream"}>
                              <video className="video-stream" id="video" autoPlay muted>
                                <source type="video/mp4" />
                              </video>
                            </div>

                            {!this.state.stream ? (<div
                              className="caption-window-container"
                            >
                              <div className="no-stream-content">
                                <PlayCircleOutlined className="no-stream-container-icon" />
                                <span className="stream-container-text">Captured media will be displayed here</span>
                              </div>
                            </div>) : (<><div
                              className="caption-window-container"
                              onMouseDown={this.handleDragStart}
                              onMouseUp={this.handleDragEnd}
                              onMouseMove={this.handleDrag}
                              onTouchStart={this.handleDragStart}
                              onTouchEnd={this.handleDragEnd}
                              onTouchMove={this.handleDrag}
                            >
                              <div className="caption-window">
                                <span className="caption-text">
                                  {/* <span className="caption-visual-line"> */}
                                  {this.state.showCaption && <span className="caption-segment">This is caption</span>}
                                  {/* </span> */}
                                </span>
                              </div>
                            </div>

                              <div className="video-controls-bottom">
                                <Row className="controls-container" justify="end">
                                  <div className="caption-menu-button fullscreen-btn transcript-switch-container">
                                    <Switch className="transcript-swt-btn" checkedChildren="S2T" unCheckedChildren="TOFF" onChange={this.onShowTextBox} />
                                  </div>
                                  {/* <Button
                      id='s2t'
                      onClick={this.onListenClick}
                      className="caption-menu-button fullscreen-btn"
                      shape="circle"
                      size="large"
                      icon={audioSource === "mic" ? <AudioOutlined className="video-controls-icon" /> : <AudioMutedOutlined className="video-controls-icon" />}
                    /> */}
                                  <Button
                                    id='cc'
                                    onClick={this.handleShowCaption}
                                    className="caption-menu-button fullscreen-btn"
                                    shape="circle"
                                    size="large"
                                    icon={<ProfileFilled className="video-controls-icon" />}
                                  />
                                  <CaptionMenu
                                    onChangeLanguage={this.onChangeLanguage.bind(this)}
                                    model={this.state.model}
                                    handleShowMenu={this.handleShowMenu}
                                  />
                                  <FullscreenBtn />
                                </Row>
                              </div></>)}


                          </div>
                          {/* } */}
                        </Card>
                        {showTextBox && <Card className="transcript-text-card" title="Word Timings"><Transcript messages={messages} /></Card>}
                      </div>
                      <ModelDropdown onChangeLanguage={this.onChangeLanguage.bind(this)} model={this.state.model} />
                      <Space>
                        <Button
                          onClick={this.onListenClick.bind(this)}
                          // onClick={this.handleMicClick}
                          type="primary" shape="round" icon={<AudioOutlined />}>
                          Record Audio
                      </Button>
                        <Button id='stop' type="primary" shape="round" danger>
                          Stop
                      </Button>
                        <Button id='reset' onClick={this.onResetClick.bind(this)} type="primary" shape="round" danger>
                          Reset
                      </Button>
                      </Space>
                      <div>
                        <TextArea
                          value={this.state.text}
                          placeholder="Text"
                          autoSize={{ minRows: 3 }}
                          style={{ fontSize: '30px', width: '700px', height: '200px', overFlowY: 'scroll' }}
                        />
                      </div>
                      <div></div>
                    </Space>
                  </div>
                </div>

        <Dropzone
          onDrop={acceptedFiles => console.log(acceptedFiles)}
          onDropAccepted={this.handleUserFile}
          onDropRejected={this.handleUserFileRejection}
          maxSize={200 * 1024 * 1024}
          accept="audio/wav, audio/mp3, audio/mpeg, audio/l16, audio/ogg, audio/flac, .mp3, .mpeg, .wav, .ogg, .opus, .flac" // eslint-disable-line
          disableClick
          className="dropzone _container _container_large"
          // activeClassName="dropzone-active"
          rejectClassName="dropzone-reject"
          ref={(node) => {
            this.dropzone = node;
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="drop-info-container">
                  <div className="drop-info">
                    <h1>Drop an audio file here.</h1>
                    <p>Watson Speech to Text supports .mp3, .mpeg, .wav, .opus, and
                    .flac files up to 200mb.</p>
                  </div>
                </div>

              </div>
            </section>
          )}
        </Dropzone>
        {/* </Dropzone> */}
      </>

    );
  }
}

export default LiveTranscript;
