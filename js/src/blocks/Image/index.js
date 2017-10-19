import React, { Component } from 'react';
import {
    Entity,
    SelectionState,
    EditorState
} from 'draft-js';
import PropTypes from 'prop-types';

import { getCurrentBlock } from '../../utils';
import alignLeftIcon from '../../../../icon/align-left.svg';
import alignCenterIcon from '../../../../icon/align-center.svg';
import alignRightIcon from '../../../../icon/align-right.svg';
import undoIcon from '../../../../icon/undo.svg';
import styles from './styles.css'; // eslint-disable-line no-unused-vars

export default class Image extends Component {
    static propTypes: Object = {
        block: PropTypes.object,
        contentState: PropTypes.object,
        blockProps: PropTypes.object
    };
    state: Object = {
        hovered: false,
        isSelected: false,
        reloading: false
    };
    componentWillReceiveProps(props) {
        const { block, blockProps } = props;
        const { getEditorState } = blockProps;
        const key = block.getKey();
        const editorState = getEditorState();
        const currentblock = getCurrentBlock(editorState);
        this.setState({
            isSelected: currentblock.getKey() === key
        });
    }
    // upload image
    onImgChange: Function = (event) => {
        const file = event.target.files[0];
        if (file.type.indexOf('image/') === 0) {
            const src = URL.createObjectURL(file);
            const { block } = this.props;
            const entityKey = block.getEntityAt(0);
            Entity.mergeData(
                entityKey,
                { src }
            );
            this.setState({
                reloading: true
            });
            this.props.blockProps.imageUploader(file).then((data) => {
                const editorState = this.props.blockProps.getEditorState();
                const contentState = editorState.getCurrentContent().mergeEntityData(
                    entityKey,
                    { src: data.src }
                );
                const newerState = EditorState.push(editorState, contentState, 'apply-entity');
                this.setState({
                    reloading: false
                });
                this.props.blockProps.setEditorState(EditorState.forceSelection(newerState, newerState.getSelection()));
            });
        }
    }
    setEntityAlignment: Function = (alignment) => {
        const { block } = this.props;
        const entityKey = block.getEntityAt(0);
        Entity.mergeData(
            entityKey,
            { alignment }
        );
        this.setState({
            hovered: true
        });
    };
    setEntityAlignmentLeft: Function = () => {
        this.setEntityAlignment('left');
    };
    setEntityAlignmentRight: Function = () => {
        this.setEntityAlignment('right');
    };
    setEntityAlignmentCenter: Function = () => {
        this.setEntityAlignment('center');
    };
    // 图片获取焦点
    focusBlock: Function = () => {
        const { block, blockProps } = this.props;
        const { getEditorState, setEditorState } = blockProps;
        const key = block.getKey();
        const editorState = getEditorState();
        const currentblock = getCurrentBlock(editorState);
        if (currentblock.getKey() === key) {
            return;
        }
        const newSelection = new SelectionState({
            anchorKey: key,
            focusKey: key,
            anchorOffset: 0,
            focusOffset: 1
        });
        setEditorState(EditorState.forceSelection(editorState, newSelection));
    }
    // add new image
    reloadImg: Function = () => {
        this.imgReloader.value = null;
        this.imgReloader.click();
    }
    toggleEnter: Function = (): void => {
        this.setState({
            hovered: true
        });
    };
    toggleLeave: Function = (): void => {
        this.setState({
            hovered: false
        });
    };
    renderAlignmentOptions() {
        return (
            <div className="rde-image-toolbar">
                <button className="rde-block-button" onClick={this.setEntityAlignmentLeft}>
                    <img src={alignLeftIcon} alt="Left" />
                </button>
                <button className="rde-block-button" onClick={this.setEntityAlignmentCenter}>
                    <img src={alignCenterIcon} alt="Center" />
                </button>
                <button className="rde-block-button" onClick={this.setEntityAlignmentRight}>
                    <img src={alignRightIcon} alt="Right" />
                </button>
                <button className="rde-block-button" onClick={this.reloadImg}>
                    <img src={undoIcon} alt="ReloadImage" />
                </button>
            </div>
        );
    }
    render(): Object {
        const { block, contentState } = this.props;
        const entityKey = block.getEntityAt(0);
        let blockData = {
            src: '',
            alignment: undefined
        };
        if (entityKey) {
            const entity = contentState.getEntity(entityKey);
            blockData = entity.getData();
        }
        const { src, alignment, loading } = blockData;
        // const { hovered } = this.state;
        return (
            <div
                className={alignment ? `rde-image-${alignment}` : 'rde-image-center'}
                onClick={this.focusBlock}
                role="presentation"
            >
                <div
                    onMouseEnter={this.toggleEnter}
                    onMouseLeave={this.toggleLeave}
                    className="rde-image-wrapper"
                >
                    { (loading || this.state.reloading) &&
                        <div className="rde-image-loader">
                            <div className="spinner">
                                <div className="double-bounce1" />
                                <div className="double-bounce2" />
                            </div>
                        </div>
                    }
                    <img
                        className={`rde-image-content${this.state.isSelected ? ' rde-image-is-selected' : ''}`}
                        alt=""
                        src={src}
                    />
                    { (this.state.hovered && !loading) && this.renderAlignmentOptions() }
                    <input
                        type="file"
                        accept="image/jpg,image/png,image/gif,image/jpeg"
                        ref={(ref) => { this.imgReloader = ref; }}
                        onChange={this.onImgChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        );
    }
}
