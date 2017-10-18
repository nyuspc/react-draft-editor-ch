// @file: Custom Block Func file
// @auth: spc@data.me 2017/10/10
// @modified: spc@data.me 2017/10/16
import { Entity } from 'draft-js';
import Image from './Image';
import Custom from './Custom';

export default function blockRendererFunc(setEditorState, getEditorState, customBlockConfig) {
    return (block) => {
        if (block.getType() === 'atomic') {
            const entityKey = block.getEntityAt(0);
            if (entityKey) {
                const entity = Entity.get(entityKey);
                if (entity && entity.type === 'IMAGE') {
                    return {
                        component: Image,
                        editable: false,
                        props: {
                            setEditorState,
                            getEditorState
                        }
                    };
                }
                if (entity && entity.type === 'CUSTOM') {
                    return {
                        component: Custom,
                        editable: false,
                        props: {
                            setEditorState,
                            getEditorState,
                            customBlockConfig
                        }
                    };
                }
            }
        }
        return undefined;
    };
}
