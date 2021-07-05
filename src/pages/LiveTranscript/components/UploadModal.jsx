/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Modal, Button, Row, Col } from 'antd';
import { Radio, Switch, Slider, Tooltip } from 'antd';
import { Spin } from 'antd';
import { SettingFilled, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import './ConfirmModal.css';

import ModelDropdown from './ModelDropdown';

import UploadIcon from '../../../assets/icons/upload-icon.svg';
import BrowseIcon from '../../../assets/icons/browse-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';

export class UploadModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  hideUploadModal = () => {
    this.props.hideUploadModal();
  }

  handleStart = (acceptedFiles) => {
    this.hideUploadModal();
    this.props.handleUserFile(acceptedFiles);
  }

  handleBrowse = () => {
    console.log(this.dropzone);
    this.dropzone.open();
  }

  reset = (acceptedFiles) => {
    const files = acceptedFiles;
    if (this.props.transcriptEnd) {
      files.length = 0
      files.splice(0, acceptedFiles.length)
    }
  }

  render() {
    const { transcriptEnd, hideUploadModal, handleUserFile, onChangeLanguage, model, visible } = this.props;

    return (
      <>
        {/* <Button type="primary" className="upload-modal-open-btn" onClick={this.showModal}>
          Modal
        </Button> */}
          <Dropzone
            onDrop={acceptedFiles => console.log(acceptedFiles)}
            // onDropAccepted={this.handleUserFile}
            // onDropRejected={this.handleUserFileRejection}
            maxSize={200 * 1024 * 1024}
            accept="video/mp4, audio/wav, audio/mp3, audio/mpeg, audio/l16, audio/ogg, audio/flac, .m4a, .mp3, .mpeg, .wav, .ogg, .opus, .flac" // eslint-disable-line
            disableClick
            className="dropzone _container _container_large"
            // activeClassName="dropzone-active"
            rejectClassName="dropzone-reject"
            ref={(node) => {
              this.dropzone = node;
            }}
          >
            {({ getRootProps, getInputProps, isDragActive, acceptedFiles }) => (
              <Modal
              title={<div className="modal-title-container">
                <div className="modal-title">Upload a video or audio file</div>
                <div className="modal-subtitle">Browse your desktop or drag & drop your file here</div>
              </div>}
              visible={visible}
              // onOk={this.hideModal}
              onCancel={this.hideUploadModal}
              afterClose={() => this.reset(acceptedFiles)}
              width={700}
              footer={null}
            // okText="确认"
            // cancelText="取消"
            >
              <section>
                <div
                  className={classNames("file-confirm-section", {
                    'display-none': acceptedFiles.length === 0 || !transcriptEnd,
                    'display-block': acceptedFiles.length > 0 && transcriptEnd,
                  })}
                >
                  <div className="language-select">
                    <div className="content-text">Select language:</div>
                    <ModelDropdown
                      onChangeLanguage={onChangeLanguage}
                      model={model}
                    />
                  </div>
                  <div className="uploaded-files">
                    <div className="content-text">File name:</div>
                    <div className="file-name-container">
                      {acceptedFiles.map((f,i) => <div key={i} className="file-name-text">{f.name}</div>)}
                      <Button id="re-browse-btn" className="btn browse-btn" onClick={this.handleBrowse}>
                        <img src={BrowseIcon} alt="browseIcon" />
                        <span>Browse</span>
                      </Button>
                    </div>
                  </div>
                  <div className="btn-container">
                    <Button className="btn browse-btn play-btn" onClick={() => this.handleStart(acceptedFiles)}>
                      <img src={PlayIcon} alt="playIcon" />
                      <span>Start Transcript</span>
                    </Button>
                  </div>
                </div>
                <div {...getRootProps()} className={classNames({
                    'display-none': acceptedFiles.length > 0 || !transcriptEnd,
                    'display-block': acceptedFiles.length === 0 && transcriptEnd,
                  })}>
                  <input {...getInputProps()} />
                  <div className={isDragActive ? "modal-contents-container dropzone-active" : "modal-contents-container"}>
                    <div className="modal-contents">
                      <img src={UploadIcon} alt="uploadIcon" />
                      <div className="upload-text">Drag & drop your file here</div>
                      <div className="Upload-sub-text">Or</div>
                      <div className="btn-container">
                        <Button className="btn browse-btn">
                          <img src={BrowseIcon} alt="browseIcon" />
                          <span>Browse desktop</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              </Modal>
            )}
          </Dropzone>

      </>
    );
  }
}

export default UploadModal;
