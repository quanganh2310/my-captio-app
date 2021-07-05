/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Modal, Button, Row, Col } from 'antd';
import { Radio, Switch, Slider, Tooltip } from 'antd';
import { Spin } from 'antd';
import { SettingFilled, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import './TranscriptDesc.css';

import contentType from '../../../lib/ibm/watson-speech/speech-to-text/content-type';
import Transcript from './transcript';

import UploadIcon from '../../../assets/icons/upload-icon.svg';
import BrowseIcon from '../../../assets/icons/browse-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';
import StopBtnIcon from '../../../assets/icons/Group 73.svg';


// const BASE64_MARKER = ';base64,';

// function convertDataURIToBinary(dataURI) {
//   const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
//   const base64 = dataURI.substring(base64Index);
//   const raw = window.atob(base64);
//   const rawLength = raw.length;
//   const array = new Uint8Array(new ArrayBuffer(rawLength));

//   for(let i = 0; i < rawLength; i+=1) {
//     array[i] = raw.charCodeAt(i);
//   }
//   return array;
// }

export class TranscriptDesc extends Component {

  constructor(props) {
    super(props);
    this.state = {
      matchingTextIndex: 0,
      matchingWordIndex: 0
    };
  }

  getMinimizedMessages = (messages) => {
    const minMessages = [];
    messages.forEach(msg => {
      const timestamps = [...msg.results[0].alternatives[0].timestamps, ['eof', 99999999999, 999999999999999]];
      const miniMsg = {
        "start": msg.results[0].alternatives[0].timestamps[0][1],
        "end": msg.results[0].alternatives[0].timestamps.lastItem[2],
        "transcript": msg.results[0].alternatives[0].transcript,
        "timestamps": timestamps
      };
      minMessages.push(miniMsg);
    });
    minMessages.push({
      "start": 999999,
      "end": 9999999,
      "transcript": "End script"
    });
    return minMessages;
  }

  handleSyncText(messages) {
    const captionText = document.querySelector('.transcript-render');
    const matchingIndex = this.state.matchingTextIndex;
    const matchingWord = this.state.matchingWordIndex;
    for (let i = 0; i < messages.length; i += 1) {
      if (i === messages.length - 1) {
        return;
      }
      if (this.audioPlayer.currentTime >= messages[i].start && this.audioPlayer.currentTime <= messages[i + 1].start) {
        if (matchingIndex !== i) {
          captionText.children[matchingIndex].classList.remove("transcript-text-matching");
          captionText.children[matchingIndex].children[1].lastChild.classList.remove("word-matching");
          this.setState({
            matchingTextIndex: i
          });
        }
        captionText.children[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        captionText.children[i].classList.add("transcript-text-matching");
        const timestamps = messages[i].timestamps;
        for (let j = 0; j <= timestamps.length; j += 1) {
          if (j === timestamps.length -1) {
            return;
          }
          if (this.audioPlayer.currentTime >= timestamps[j][1] && this.audioPlayer.currentTime <= timestamps[j+1][1]) {
            if (matchingWord !== j) {
              captionText.children[matchingIndex].children[1].children[matchingWord].classList.remove("word-matching");
              this.setState({
                matchingWordIndex: j
              });
            }
            captionText.children[i].children[1].children[j].classList.add("word-matching");
            return;
          }
        }
        this.setState({
          matchingWordIndex: 0
        });
        return;
      }
    }
  }

  render() {
    const { name, createdAt, messages, audioSource, type } = this.props;
    const minMessages = this.getMinimizedMessages(messages);
    let audioURL;
    if (type === 1 || type === 0) {
      audioURL = null;
      console.log(audioSource);
    }
    else {
      audioURL = audioSource;
    }
    // const binary = convertDataURIToBinary(audioSource);
    // const blob = new Blob([binary], {type : 'audio/ogg'});
    // const audioURL = window.URL.createObjectURL(blob);

    return (
      <>
        <div
          className={classNames("record-container",{
          })}
        >
          <div className="record-name">
            {name}
          </div>
          <div className="record-date">
            {createdAt}
          </div>
          <div className="record-transcript-text-card">
            <div className="record-transcript-text-content">
              <Transcript messages={messages} fileType={type} />
            </div>
          </div>
          <div className={classNames("record-audio-controls",{
              'display-none': !audioURL,
            })}
          >
            <audio
              id="audio"
              onTimeUpdate={() => this.handleSyncText(minMessages)}
              controls
              src={audioURL}
              ref={(node) => {
                this.audioPlayer = node;
              }}
            >
              <source type="audio/ogg" />
              <source src="horse.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

        </div>
      </>
    );
  }
}

export default TranscriptDesc;
