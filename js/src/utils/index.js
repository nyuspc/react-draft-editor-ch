// @file: util functions file
// @auth: spc@data.me 2017/10/12
import {
    EditorState,
    Modifier
} from 'draft-js';


/**
* Function returns collection of currently selected blocks.
*/
function getSelectedBlocksList(editorState) {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    const blockMap = contentState.getBlockMap();
    return blockMap.toSeq()
        .skipUntil((_, key) => key === startKey)
        .takeUntil((_, key) => key === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .toList();
}

/**
* Function returns collection of currently selected blocks.
*/
function getSelectedBlocksMap(editorState) {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    const blockMap = contentState.getBlockMap();
    return blockMap.toSeq()
        .skipUntil((_, key) => key === startKey)
        .takeUntil((_, key) => key === endKey)
        .concat([[endKey, blockMap.get(endKey)]]);
}

/**
* Function will return currently selected text in the editor.
*/
function getSelectionText(editorState) {
    let selectedText = '';
    const selectionState = editorState.getSelection();
    let startKey = selectionState.getAnchorOffset();
    let endKey = selectionState.getFocusOffset();
    const selectedBlocks = getSelectedBlocksList(editorState);
    if (selectedBlocks.size > 0) {
        if (selectionState.getIsBackward()) {
            const tempKey = startKey;
            startKey = endKey;
            endKey = tempKey;
        }
        selectedText = selectedBlocks.map((block, index) => {
            console.log(block.getText());
            let start = 0;
            let end = block.getText().length;
            if (index === 0) {
                start = startKey;
            }
            if (index === selectedBlocks.size - 1) {
                end = endKey;
            }
            return block.getText().slice(start, end);
        }).join('');
    }
    return selectedText;
}

// /**
// * Function will return inlineStyle of currently selected text in the editor.
// */
// function getSelectedBlocksStyle(editorState) {
//     const inlineStyles = {
//         BOLD: true,
//         ITALIC: true,
//         UNDERLINE: true,
//         STRIKETHROUGH: true,
//         CODE: true,
//         SUPERSCRIPT: true,
//         SUBSCRIPT: true
//     };
//     const currentSelection = editorState.getSelection();
//     const start = currentSelection.getStartOffset();
//     const end = currentSelection.getEndOffset();
//     const selectedBlocks = getSelectedBlocksList(editorState);
//     if (selectedBlocks.size > 0) {
//       for (let i = 0; i < selectedBlocks.size; i += 1) {
//         let blockStart = i === 0 ? start : 0;
//         let blockEnd =
//           i === (selectedBlocks.size - 1) ? end : selectedBlocks.get(i).getText().length;
//         if (blockStart === blockEnd && blockStart === 0) {
//           blockStart = 1;
//           blockEnd = 2;
//         } else if (blockStart === blockEnd) {
//           blockStart -= 1;
//         }
//         for (let j = blockStart; j < blockEnd; j += 1) {
//             const inlineStylesAtOffset = selectedBlocks.get(i).getInlineStyleAt(j);
//                ['BOLD', 'ITALIC', 'UNDERLINE', 'STRIKETHROUGH', 'CODE', 'SUPERSCRIPT', 'SUBSCRIPT'].forEach((style) => {
//                   inlineStyles[style] = inlineStyles[style] && inlineStylesAtOffset.get(style) === style;
//                   });
//             }
//       }
//     }
//     return inlineStyles;
// }

/*
Get currentBlock in the editorState.
*/
function getCurrentBlock(editorState) {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selectionState.getStartKey());
    return block;
}

/**
* Function will change block level meta-data.
*/
function setBlockData(editorState, data) {
    const newContentState = Modifier.setBlockData(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        data
    );
    return EditorState.push(editorState, newContentState, 'change-block-data');
}

/**
* Function will render block style by meta-data.
*/
function blockStyleFunc(block) {
    const blockAlignment = block.getData() && block.getData().get('text-align');
    if (blockAlignment) {
        return `rde-text-align-${blockAlignment}`;
    }
    return '';
}

module.exports = {
    blockStyleFunc,
    setBlockData,
    getCurrentBlock,
    getSelectionText
};
