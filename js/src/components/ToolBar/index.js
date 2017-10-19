// @file: Toolbar component jsx file
// @auth: spc@data.me 2017/10/10

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
    AtomicBlockUtils,
    EditorState,
    Entity,
    RichUtils,
    Modifier
} from 'draft-js';

import {
    setBlockData,
    getCurrentBlock
} from '../../utils';
import LinkModal from '../LinkModal';
import CustomModal from '../CustomModal';
import boldIcon from '../../../../icon/bold.svg';
import italicIcon from '../../../../icon/italic.svg';
import underscoreIcon from '../../../../icon/underscore.svg';
import titleIcon from '../../../../icon/title.svg';
import alignLeftIcon from '../../../../icon/align-left.svg';
import alignCenterIcon from '../../../../icon/align-center.svg';
import alignRightIcon from '../../../../icon/align-right.svg';
import listIcon from '../../../../icon/list.svg';
import orderedListIcon from '../../../../icon/ordered-list.svg';
import linkIcon from '../../../../icon/link.svg';
import imgIcon from '../../../../icon/img.svg';
// import unlinkIcon from '../../../../icon/unlink.svg';
import cleanIcon from '../../../../icon/clean.svg';
import factubeIcon from '../../../../icon/factube.svg';

import './styles.css';

export default class ToolBar extends Component {
    static propTypes = {
        currentState: PropTypes.object.isRequired,
        changeState: PropTypes.func.isRequired,
        imageUploader: PropTypes.func.isRequired,
        customBlockConfig: PropTypes.object
    };
    state = {
        showLinkModal: false,
        showCustomModal: false,
        currentTextAlignment: undefined,
        currentTextStyle: undefined,
        currentBlockType: undefined
    }

    componentWillReceiveProps(props) {
        if (props.currentState !== this.props.currentState) {
            this.setState({
                currentTextAlignment: getCurrentBlock(props.currentState).getData().get('text-align'),
                currentTextStyle: props.currentState.getCurrentInlineStyle(),
                currentBlockType: RichUtils.getCurrentBlockType(props.currentState)
            });
        }
    }
    onStyleChange: Function = (blockStyle) => {
        const { currentState, changeState } = this.props;
        const newState = RichUtils.toggleInlineStyle(
            currentState,
            blockStyle
        );
        if (newState) {
            changeState(newState);
        }
    };
    onTypeChange: Function = (blockType) => {
        const { currentState, changeState } = this.props;
        const newState = RichUtils.toggleBlockType(
            currentState,
            blockType
        );
        if (newState) {
            if (blockType === 'ordered-list-item' || blockType === 'unordered-list-item') {
                changeState(setBlockData(newState, { 'text-align': undefined }));
            } else {
                changeState(newState);
            }
        }
    }
    // clear all style, metas, special types
    onCleanClick: Function = () => {
        const { currentState } = this.props;
        let contentState = currentState.getCurrentContent();
        ['BOLD', 'ITALIC', 'UNDERLINE', 'STRIKETHROUGH', 'MONOSPACE',
            'FONTFAMILY', 'COLOR', 'BGCOLOR', 'FONTSIZE', 'SUPERSCRIPT', 'SUBSCRIPT'].forEach((style) => {
            contentState = Modifier.removeInlineStyle(
                contentState,
                currentState.getSelection(),
                style
            );
        });
        const noStyleState = EditorState.push(currentState, contentState, 'change-inline-style');
        const noTypeState = RichUtils.toggleBlockType(
            noStyleState,
            'unstyled'
        );
        this.props.changeState(setBlockData(noTypeState, { 'text-align': undefined }));
    };
    // add new image
    onImgClick: Function = () => {
        this.imgInput.value = null;
        this.imgInput.click();
    }
    // upload image
    onImgChange: Function = (event) => {
        const file = event.target.files[0];
        if (file.type.indexOf('image/') === 0) {
            const src = URL.createObjectURL(file);
            const { currentState } = this.props;
            const entityKey = Entity.create('IMAGE', 'MUTABLE', { src, alignment: 'center', loading: true });
            const newState = AtomicBlockUtils.insertAtomicBlock(currentState, entityKey, ' ');
            this.props.changeState(newState);
            this.props.imageUploader(file).then((data) => {
                const contentState = newState.getCurrentContent().replaceEntityData(
                    entityKey,
                    { src: data.src, alignment: 'center' }
                );
                const newerState = EditorState.push(newState, contentState, 'apply-entity');
                this.props.changeState(EditorState.forceSelection(newerState, newerState.getSelection()));
            });
        }
    }
    // change alignment data
    toggleAlignment:Function = (alignment) => {
        const { currentState } = this.props;
        const { currentTextAlignment } = this.state;
        if (currentTextAlignment !== alignment) {
            this.props.changeState(setBlockData(currentState, { 'text-align': alignment }));
        } else {
            this.props.changeState(setBlockData(currentState, { 'text-align': undefined }));
        }
    }
    // show add link modal
    showLinkModal: Function = () => {
        this.setState({
            showLinkModal: true
        });
    }
    // hide add link modal
    hideLinkModal: Function = () => {
        this.setState({
            showLinkModal: false
        });
    }
    // call on link request submitted
    submitLink: Function = (linkTitle, linkTarget) => {
        this.addLink(linkTitle, linkTarget);
        this.hideLinkModal();
    }
    // add a new link
    addLink: Function = (linkTitle, linkTarget) => {
        const { currentState } = this.props;
        // const contentState = currentState.getCurrentContent();
        const entityKey = Entity.create('LINK', 'MUTABLE', {
            url: linkTarget
        });
        const newState = RichUtils.toggleLink(
            currentState,
            currentState.getSelection(),
            entityKey
        );
        const contentState = Modifier.replaceText(
            newState.getCurrentContent(),
            newState.getSelection(),
            `${linkTitle}`,
            newState.getCurrentInlineStyle(),
            entityKey
        );
        this.props.changeState(EditorState.push(newState, contentState, 'insert-characters'));
    };
    // show add Custom modal
    showCustomModal: Function = () => {
        this.setState({
            showCustomModal: true
        });
    }
    // hide add Custom modal
    hideCustomModal: Function = () => {
        this.setState({
            showCustomModal: false
        });
    }
    // call on link request submitted
    submitCustom: Function = (customData) => {
        this.addCustom(customData);
        this.hideCustomModal();
    }
    // add a new Custom
    addCustom: Function = (customData) => {
        if (customData) {
            const { currentState } = this.props;
            const entityKey = Entity.create('CUSTOM', 'INMUTABLE', { customData });
            this.props.changeState(AtomicBlockUtils.insertAtomicBlock(currentState, entityKey, ' '));
        }
    };
    render() {
        return (
            <div className="rde-toolbar">
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextStyle && this.state.currentTextStyle.has('BOLD') }
                    )}
                    title="加粗"
                    onClick={() => this.onStyleChange('BOLD')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={boldIcon} alt="Bold" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextStyle && this.state.currentTextStyle.has('ITALIC') }
                    )}
                    title="斜体"
                    onClick={() => this.onStyleChange('ITALIC')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={italicIcon} alt="Italic" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextStyle && this.state.currentTextStyle.has('UNDERLINE') }
                    )}
                    title="下划线"
                    onClick={() => this.onStyleChange('UNDERLINE')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={underscoreIcon} alt="UNDERLINE" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentBlockType === 'header-three' }
                    )}
                    title="标题"
                    onClick={() => this.onTypeChange('header-three')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={titleIcon} alt="Title" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextAlignment === 'left' }
                    )}
                    title="左对齐"
                    onClick={() => this.toggleAlignment('left')}
                    disabled={this.state.currentBlockType === 'atomic'
                        || this.state.currentBlockType === 'ordered-list-item'
                        || this.state.currentBlockType === 'unordered-list-item'}
                >
                    <img src={alignLeftIcon} alt="Left" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextAlignment === 'center' }
                    )}
                    title="居中"
                    onClick={() => this.toggleAlignment('center')}
                    disabled={this.state.currentBlockType === 'atomic'
                        || this.state.currentBlockType === 'ordered-list-item'
                        || this.state.currentBlockType === 'unordered-list-item'}
                >
                    <img src={alignCenterIcon} alt="Center" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentTextAlignment === 'right' }
                    )}
                    title="右对齐"
                    onClick={() => this.toggleAlignment('right')}
                    disabled={this.state.currentBlockType === 'atomic'
                        || this.state.currentBlockType === 'ordered-list-item'
                        || this.state.currentBlockType === 'unordered-list-item'}
                >
                    <img src={alignRightIcon} alt="Right" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentBlockType === 'unordered-list-item' }
                    )}
                    title="项目符号"
                    onClick={() => this.onTypeChange('unordered-list-item')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={listIcon} alt="List" />
                </button>
                <button
                    className={classnames(
                        'rde-toolbar-button',
                        { 'rde-toolbar-button-on': this.state.currentBlockType === 'ordered-list-item' }
                    )}
                    title="列表"
                    onClick={() => this.onTypeChange('ordered-list-item')}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={orderedListIcon} alt="Order List" />
                </button>
                <button
                    className="rde-toolbar-button"
                    title="插入超链接"
                    onClick={this.showLinkModal}
                    disabled={this.state.currentBlockType === 'atomic'}
                >
                    <img src={linkIcon} alt="Link" />
                </button>
                <button
                    className="rde-toolbar-button"
                    title="插入图片"
                    onClick={this.onImgClick}
                    disabled={this.state.currentBlockType === 'atomic'
                        || this.state.currentBlockType === 'ordered-list-item'
                        || this.state.currentBlockType === 'unordered-list-item'}
                >
                    <img src={imgIcon} alt="Insert Pic" />
                    <input
                        type="file"
                        accept="image/jpg,image/png,image/gif,image/jpeg"
                        ref={(ref) => { this.imgInput = ref; }}
                        onChange={this.onImgChange}
                        style={{ display: 'none' }}
                    />
                </button>
                { this.props.customBlockConfig &&
                    <button
                        className="rde-toolbar-button"
                        title={this.props.customBlockConfig.customTitle}
                        onClick={this.showCustomModal}
                        disabled={this.state.currentBlockType === 'atomic'
                            || this.state.currentBlockType === 'ordered-list-item'
                            || this.state.currentBlockType === 'unordered-list-item'}
                    >
                        <img src={factubeIcon} alt="Insert Custom Content" />
                    </button> }
                <button className="rde-toolbar-button" title="清除样式" disabled={this.state.currentBlockType === 'atomic'} onClick={this.onCleanClick}>
                    <img src={cleanIcon} alt="Clean" />
                </button>
                { this.state.showLinkModal
                    && <LinkModal
                        currentState={this.props.currentState}
                        onCancel={this.hideLinkModal}
                        onSubmit={this.submitLink}
                    />
                }
                { (this.props.customBlockConfig && this.state.showCustomModal)
                    && <CustomModal
                        customBlockConfig={this.props.customBlockConfig}
                        onCancel={this.hideCustomModal}
                        onSubmit={this.submitCustom}
                    />
                }
            </div>
        );
    }
}
